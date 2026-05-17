import { NextResponse, type NextRequest } from "next/server";
import { hostify, HostifyError } from "@/lib/hostify/client";
import { superpay, SuperPayError } from "@/lib/superpay/client";
import { parseHostifyIdFromMerchantOrderId } from "@/lib/superpay/orders";
import type { WebhookNotificationParams } from "@/lib/superpay/types";
import {
  getTransaction,
  applyWebhookUpdate,
  recordHostifyAction,
  type TransactionStatus,
} from "@/lib/db/transactions";

/**
 * SuperPay calls this endpoint with `?response=<base64-encoded-JSON>` after
 * the customer finishes (or fails) payment on the hosted page. The
 * notification itself is unsigned, so we always re-verify status via the
 * Get Order Status API before acting on it.
 *
 * Lifecycle:
 *   1. Decode + look up the transactions row by merchant_order_id
 *   2. Re-verify status via SuperPay getOrderStatus
 *   3. UPDATE transactions row with verified status + raw payloads
 *   4. PUT Hostify reservation (accepted on PAY_COMPLETED, cancelled
 *      on FAILED / CANCELLED / EXPIRED)
 *   5. UPDATE transactions row with hostify_status / hostify_error
 *
 * Idempotent: if the row already shows the same paymentGwOrderId we
 * skip steps 3–5 and ack.
 */
export async function GET(req: NextRequest) {
  const startedAt = Date.now();
  console.log("[payment/webhook] received", {
    hasResponse: req.nextUrl.searchParams.has("response"),
  });

  const responseParam = req.nextUrl.searchParams.get("response");
  if (!responseParam) {
    return NextResponse.json({ ok: false, error: "missing-response" }, { status: 400 });
  }

  let notification: WebhookNotificationParams;
  try {
    const json = Buffer.from(responseParam, "base64").toString("utf8");
    notification = JSON.parse(json) as WebhookNotificationParams;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-base64" }, { status: 400 });
  }

  const { merchantOrderId, paymentgwOrderId } = notification;
  if (!merchantOrderId || !paymentgwOrderId) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }

  console.log("[payment/webhook] notification", {
    merchantOrderId,
    paymentgwOrderId,
    orderStatus: notification.orderStatus,
  });

  const reservationId = parseHostifyIdFromMerchantOrderId(merchantOrderId);
  if (!reservationId) {
    console.warn("[payment/webhook] no-reservation-id-in-merchant-order", { merchantOrderId });
    return NextResponse.json({ ok: true, ignored: "merchant-order-id-not-reservation-prefixed" });
  }

  // Look up the transaction row. If missing, we still proceed (a missing
  // DB row shouldn't block reconciliation in Hostify) but we can't
  // write back to it.
  const existing = await getTransaction(merchantOrderId).catch(() => null);

  // Idempotency: same paymentGwOrderId already recorded → noop.
  if (existing?.payment_gw_order_id === paymentgwOrderId && existing.hostify_status) {
    return NextResponse.json({ ok: true, already: true, reservationId });
  }

  // Defensive re-verify against SuperPay.
  let verifiedStatus = notification.orderStatus;
  let verifyPayload: unknown = null;
  try {
    const status = await superpay.getOrderStatus(merchantOrderId);
    verifyPayload = status;
    if (status.status !== "SUCCESS") {
      return NextResponse.json({ ok: false, error: "verify-failed" }, { status: 502 });
    }
    if (status.paymentgwOrderId !== paymentgwOrderId) {
      return NextResponse.json({ ok: false, error: "paymentgw-mismatch" }, { status: 409 });
    }
    verifiedStatus = status.orderStatus;
  } catch (err) {
    const code = err instanceof SuperPayError ? `superpay-${err.status}` : "verify-error";
    console.error("[payment/webhook] verify-failed", { merchantOrderId, code });
    return NextResponse.json({ ok: false, error: code }, { status: 502 });
  }

  // Update the DB row with the verified status + raw payloads.
  const dbStatus: TransactionStatus = mapPaymentStatusToDb(verifiedStatus);
  if (existing) {
    try {
      await applyWebhookUpdate(merchantOrderId, {
        superpayStatus: verifiedStatus,
        paymentGwOrderId: paymentgwOrderId,
        webhookPayload: notification as unknown as Parameters<typeof applyWebhookUpdate>[1]["webhookPayload"],
        verifyPayload: verifyPayload as unknown as Parameters<typeof applyWebhookUpdate>[1]["verifyPayload"],
        status: dbStatus,
      });
    } catch (err) {
      console.error("[payment/webhook] db update failed", err);
    }
  }

  // Map SuperPay terminal state → Hostify transition.
  const targetHostifyStatus = mapPaymentStatusToHostify(verifiedStatus);
  if (!targetHostifyStatus) {
    return NextResponse.json({
      ok: true,
      orderStatus: verifiedStatus,
      hostify: { id: reservationId, action: "no-change" },
    });
  }

  try {
    await hostify.updateReservation(reservationId, {
      status: targetHostifyStatus,
      note:
        targetHostifyStatus === "accepted"
          ? `Paid via SuperPay. Order ${merchantOrderId} / payment ${paymentgwOrderId}.`
          : `SuperPay reported ${verifiedStatus}. Order ${merchantOrderId}.`,
    });
    await recordHostifyAction(merchantOrderId, targetHostifyStatus).catch(() => {});
  } catch (err) {
    if (err instanceof HostifyError) {
      const alreadyInState =
        err.status === 400 && /Status should be one of/i.test(err.body);
      if (alreadyInState) {
        await recordHostifyAction(merchantOrderId, targetHostifyStatus, "already-in-state").catch(() => {});
        return NextResponse.json({
          ok: true,
          orderStatus: verifiedStatus,
          hostify: { id: reservationId, action: `already-${targetHostifyStatus}` },
        });
      }
    }
    const detail = err instanceof HostifyError ? err.body.slice(0, 400) : String(err);
    console.error("[payment/webhook] hostify-update-failed", {
      merchantOrderId,
      reservationId,
      targetHostifyStatus,
      detail,
    });
    await recordHostifyAction(merchantOrderId, "error", detail).catch(() => {});
    return NextResponse.json(
      { ok: false, error: "hostify-update-failed", detail },
      { status: 500 },
    );
  }

  console.log("[payment/webhook] done", {
    merchantOrderId,
    elapsedMs: Date.now() - startedAt,
    orderStatus: verifiedStatus,
    hostifyAction: targetHostifyStatus,
    reservationId,
  });

  return NextResponse.json({
    ok: true,
    orderStatus: verifiedStatus,
    hostify: { id: reservationId, action: targetHostifyStatus },
  });
}

function mapPaymentStatusToHostify(
  paymentStatus: string,
): "accepted" | "cancelled_by_guest" | null {
  switch (paymentStatus) {
    case "PAY_COMPLETED":
      return "accepted";
    case "FAILED":
    case "CANCELLED":
    case "EXPIRED":
      return "cancelled_by_guest";
    default:
      // INITIATE_AUTHORIZE / REFUNDED / PARTIALLY_REFUNDED: handled
      // out-of-band; don't auto-mutate Hostify.
      return null;
  }
}

function mapPaymentStatusToDb(paymentStatus: string): TransactionStatus {
  switch (paymentStatus) {
    case "PAY_COMPLETED":
      return "succeeded";
    case "FAILED":
    case "EXPIRED":
      return "failed";
    case "CANCELLED":
      return "cancelled";
    default:
      return "pending";
  }
}
