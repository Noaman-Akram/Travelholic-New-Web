import { NextResponse, type NextRequest } from "next/server";
import { hostify, HostifyError } from "@/lib/hostify/client";
import { superpay, SuperPayError } from "@/lib/superpay/client";
import {
  getOrder,
  parseHostifyIdFromMerchantOrderId,
  updateOrder,
} from "@/lib/superpay/orders";
import type { WebhookNotificationParams } from "@/lib/superpay/types";

/**
 * SuperPay calls this endpoint with `?response=<base64-encoded-JSON>` after
 * the customer finishes (or fails) payment on the hosted page. The
 * notification itself is unsigned, so we always re-verify status via the
 * Get Order Status API before acting on it. Idempotent on
 * `paymentgwOrderId` — SuperPay may deliver multiple times.
 *
 * Lifecycle model (phase 8):
 *   - The Hostify reservation already exists at status=pending — it
 *     was created by /api/booking before the user was redirected to
 *     SuperPay.
 *   - This handler PROMOTES the pending reservation:
 *       PAY_COMPLETED  → status=accepted   (PUT /reservations/{id})
 *       FAILED / EXPIRED / CANCELLED
 *                      → status=cancelled_by_guest
 *   - Idempotent: re-applying the same status to Hostify is a 200 no-op.
 *
 * Hostify reservation id is recovered from the merchantOrderId, which
 * was built as `TH-<numeric-id>-<rand>` in /api/payment/create. This
 * avoids us needing a separate lookup store between the two systems.
 */
export async function GET(req: NextRequest) {
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

  // The Hostify reservation id is the part the webhook actually needs.
  const reservationId = parseHostifyIdFromMerchantOrderId(merchantOrderId);
  if (!reservationId) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(
        `[payment/webhook] merchantOrderId ${merchantOrderId} doesn't encode a Hostify id`,
      );
    }
    return NextResponse.json(
      { ok: true, ignored: "merchant-order-id-not-reservation-prefixed" },
    );
  }

  // Audit envelope is best-effort. Hostify is the lifecycle source of
  // truth, so a missing audit record never blocks the update.
  const order = await getOrder(merchantOrderId);

  // Idempotency on the audit side — if we've already recorded the same
  // paymentgwOrderId, just ack.
  if (order?.payment?.paymentgwOrderId === paymentgwOrderId) {
    return NextResponse.json({
      ok: true,
      already: true,
      reservationId,
    });
  }

  // Defensive re-verify against SuperPay (the GET notification has no
  // signature; we never trust it on its own).
  let verifiedStatus = notification.orderStatus;
  try {
    const status = await superpay.getOrderStatus(merchantOrderId);
    if (status.status !== "SUCCESS") {
      return NextResponse.json(
        { ok: false, error: "verify-failed" },
        { status: 502 },
      );
    }
    if (status.paymentgwOrderId !== paymentgwOrderId) {
      return NextResponse.json(
        { ok: false, error: "paymentgw-mismatch" },
        { status: 409 },
      );
    }
    verifiedStatus = status.orderStatus;
  } catch (err) {
    const code = err instanceof SuperPayError ? `superpay-${err.status}` : "verify-error";
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[payment/webhook] verify failed:", err);
    }
    return NextResponse.json({ ok: false, error: code }, { status: 502 });
  }

  // Persist the audit trail regardless of status. Failures here don't
  // block the Hostify update.
  if (order) {
    await updateOrder(merchantOrderId, {
      payment: {
        paymentgwOrderId,
        orderStatus: verifiedStatus,
        completedAt: new Date().toISOString(),
        acquirer: notification.acquirer,
        network: notification.network,
      },
    });
  }

  // Map SuperPay terminal states → Hostify status transitions.
  const targetHostifyStatus = mapPaymentStatusToHostify(verifiedStatus);
  if (!targetHostifyStatus) {
    // Non-terminal status (e.g. INITIATE_AUTHORIZE) — Hostify stays at
    // pending. Acknowledge the webhook.
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
  } catch (err) {
    if (err instanceof HostifyError) {
      // Idempotency: if the reservation is already in the target state
      // Hostify returns 400 with a "Status should be one of …" body.
      // We treat that as success since the desired state holds.
      const alreadyInState =
        err.status === 400 &&
        /Status should be one of/i.test(err.body);
      if (alreadyInState) {
        return NextResponse.json({
          ok: true,
          orderStatus: verifiedStatus,
          hostify: {
            id: reservationId,
            action: `already-${targetHostifyStatus}`,
          },
        });
      }
    }
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error(
        `[payment/webhook] Hostify update FAILED for reservation ${reservationId}:`,
        err,
      );
    }
    return NextResponse.json(
      {
        ok: false,
        error: "hostify-update-failed",
        detail: err instanceof HostifyError ? err.body.slice(0, 200) : "unknown",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    orderStatus: verifiedStatus,
    hostify: {
      id: reservationId,
      action: targetHostifyStatus,
    },
  });
}

/**
 * Maps the SuperPay order status reported in the webhook to the Hostify
 * reservation status transition we should apply. Returns null for
 * non-terminal states (we leave Hostify at pending and wait for a
 * later, definitive webhook).
 *
 * Status values from SuperPay V1.3 spec.
 */
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
    case "INITIATE_AUTHORIZE":
    case "REFUNDED":
    case "PARTIALLY_REFUNDED":
    default:
      // INITIATE_AUTHORIZE: still in flight, wait for the next event.
      // REFUNDED / PARTIALLY_REFUNDED: handled out-of-band via the
      // SuperPay merchant portal in phase 8; we don't auto-cancel
      // Hostify on refund because partial refunds can leave the stay
      // intact.
      return null;
  }
}
