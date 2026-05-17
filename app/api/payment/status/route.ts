import { NextResponse, type NextRequest } from "next/server";
import { superpay, SUPERPAY_AVAILABLE, SuperPayError } from "@/lib/superpay/client";
import { hostify, HostifyError } from "@/lib/hostify/client";
import { parseHostifyIdFromMerchantOrderId } from "@/lib/superpay/orders";
import {
  getTransaction,
  applyWebhookUpdate,
  recordHostifyAction,
  type TransactionStatus,
} from "@/lib/db/transactions";

/**
 * Client-polled from /booking/success.
 *
 * Read path: look up the transactions row. If it's already in a
 * terminal state (succeeded/failed/cancelled) with a hostify_status
 * recorded, return that immediately — the webhook did the work.
 *
 * Backstop: if the row is still 'pending' (webhook hasn't fired yet),
 * re-verify via SuperPay getOrderStatus and apply the same Hostify
 * transition the webhook would have. This guards local dev (no public
 * URL) and webhook latency.
 */
export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref");
  if (!ref) {
    return NextResponse.json({ ok: false, error: "missing-ref" }, { status: 400 });
  }

  const row = await getTransaction(ref).catch(() => null);
  if (!row) {
    return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  }

  const reservationId =
    row.hostify_reservation_id ?? parseHostifyIdFromMerchantOrderId(ref);

  // Terminal state already recorded by webhook → short-circuit.
  if (row.status === "succeeded" && row.hostify_status === "accepted") {
    return NextResponse.json({
      ok: true,
      state: "confirmed",
      confirmationCode: row.hostify_confirmation_code,
      hostifyReservationId: reservationId,
      paidAt: row.hostify_action_at,
    });
  }
  if (row.status === "failed" || row.status === "cancelled") {
    return NextResponse.json({
      ok: true,
      state: "failed",
      orderStatus: row.superpay_status,
    });
  }

  // Still pending → re-verify with SuperPay as a backstop.
  if (!SUPERPAY_AVAILABLE()) {
    return NextResponse.json({ ok: true, state: "pending", reason: "superpay-not-configured" });
  }

  try {
    const status = await superpay.getOrderStatus(row.merchant_order_id);
    if (status.status !== "SUCCESS") {
      return NextResponse.json({ ok: true, state: "pending" });
    }

    const completed = status.orderStatus === "PAY_COMPLETED";
    const failed =
      status.orderStatus === "FAILED" ||
      status.orderStatus === "CANCELLED" ||
      status.orderStatus === "EXPIRED";

    const dbStatus: TransactionStatus = completed
      ? "succeeded"
      : status.orderStatus === "CANCELLED"
        ? "cancelled"
        : failed
          ? "failed"
          : "pending";

    await applyWebhookUpdate(row.merchant_order_id, {
      superpayStatus: status.orderStatus,
      paymentGwOrderId: status.paymentgwOrderId,
      webhookPayload: null,
      verifyPayload: status as unknown as Parameters<typeof applyWebhookUpdate>[1]["verifyPayload"],
      status: dbStatus,
    }).catch(() => {});

    if (!completed && !failed) {
      return NextResponse.json({
        ok: true,
        state: "pending",
        orderStatus: status.orderStatus,
      });
    }

    if (!reservationId) {
      return NextResponse.json(
        { ok: false, state: "paid-no-reservation", error: "no-reservation-id" },
        { status: 500 },
      );
    }

    const targetStatus: "accepted" | "cancelled_by_guest" = completed
      ? "accepted"
      : "cancelled_by_guest";

    try {
      await hostify.updateReservation(reservationId, {
        status: targetStatus,
        note: completed
          ? `Paid via SuperPay. Order ${row.merchant_order_id} / payment ${status.paymentgwOrderId}. (status-backstop)`
          : `SuperPay reported ${status.orderStatus}. Order ${row.merchant_order_id}. (status-backstop)`,
      });
      await recordHostifyAction(row.merchant_order_id, targetStatus).catch(() => {});
    } catch (err) {
      if (err instanceof HostifyError) {
        const alreadyInState =
          err.status === 400 && /Status should be one of/i.test(err.body);
        if (alreadyInState) {
          await recordHostifyAction(row.merchant_order_id, targetStatus, "already-in-state").catch(() => {});
        } else {
          await recordHostifyAction(
            row.merchant_order_id,
            "error",
            err.body.slice(0, 400),
          ).catch(() => {});
          return NextResponse.json(
            {
              ok: false,
              state: completed ? "paid-no-reservation" : "failed",
              error: `hostify-${err.status}`,
            },
            { status: 500 },
          );
        }
      } else {
        throw err;
      }
    }

    if (completed) {
      // Re-fetch confirmation_code from Hostify in case the row didn't
      // capture it at create-time.
      let confirmationCode = row.hostify_confirmation_code;
      try {
        const r = await hostify.getReservation(reservationId);
        confirmationCode = r.reservation?.confirmation_code ?? confirmationCode;
      } catch {
        // best-effort
      }
      return NextResponse.json({
        ok: true,
        state: "confirmed",
        confirmationCode: confirmationCode ?? null,
        hostifyReservationId: reservationId,
        paidAt: status.updatedTime,
      });
    }

    return NextResponse.json({
      ok: true,
      state: "failed",
      orderStatus: status.orderStatus,
    });
  } catch (err) {
    const code = err instanceof SuperPayError ? `superpay-${err.status}` : "status-error";
    return NextResponse.json({ ok: false, state: "error", error: code }, { status: 502 });
  }
}
