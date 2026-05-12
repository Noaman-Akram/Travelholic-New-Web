import { NextResponse, type NextRequest } from "next/server";
import { superpay, SUPERPAY_AVAILABLE, SuperPayError } from "@/lib/superpay/client";
import { hostify, HostifyError } from "@/lib/hostify/client";
import {
  getOrder,
  parseHostifyIdFromMerchantOrderId,
  updateOrder,
} from "@/lib/superpay/orders";

/**
 * Client-polled from /booking/success. Returns the current state of a
 * pending order — useful when the webhook hasn't arrived yet (or in
 * local dev where there's no public URL for SuperPay to call).
 *
 * Acts as a webhook backstop: if SuperPay reports PAY_COMPLETED but
 * the audit envelope doesn't yet show a `payment` block (the webhook
 * hasn't fired), we apply the same Hostify status transition the
 * webhook would have — promoting the pending reservation to
 * `accepted` for success, or `cancelled_by_guest` for failure.
 *
 * Idempotent: re-applying the same Hostify status returns 400 with a
 * helpful error which we treat as already-applied.
 */
export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref");
  if (!ref) {
    return NextResponse.json({ ok: false, error: "missing-ref" }, { status: 400 });
  }

  const order = await getOrder(ref);
  if (!order) {
    return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  }

  // Hostify reservation id is encoded in the merchantOrderId itself —
  // it's also stored on the audit envelope for redundancy.
  const reservationId =
    order.hostifyReservationId ?? parseHostifyIdFromMerchantOrderId(ref);

  // If audit already shows the reservation was confirmed (webhook
  // already did the work), short-circuit.
  if (order.payment?.orderStatus === "PAY_COMPLETED" && order.hostifyConfirmationCode) {
    return NextResponse.json({
      ok: true,
      state: "confirmed",
      confirmationCode: order.hostifyConfirmationCode,
      hostifyReservationId: reservationId ?? null,
      paidAt: order.payment.completedAt,
    });
  }

  if (!SUPERPAY_AVAILABLE()) {
    return NextResponse.json({ ok: true, state: "pending", reason: "superpay-not-configured" });
  }

  try {
    const status = await superpay.getOrderStatus(order.merchantOrderId);
    if (status.status !== "SUCCESS") {
      return NextResponse.json({ ok: true, state: "pending" });
    }

    const completed = status.orderStatus === "PAY_COMPLETED";
    const failed =
      status.orderStatus === "FAILED" ||
      status.orderStatus === "CANCELLED" ||
      status.orderStatus === "EXPIRED";

    // Persist whatever SuperPay told us into the audit envelope.
    await updateOrder(order.merchantOrderId, {
      payment: {
        paymentgwOrderId: status.paymentgwOrderId,
        orderStatus: status.orderStatus,
        completedAt: status.updatedTime,
        acquirer: status.acquirer,
        network: status.network,
      },
    });

    if (!completed && !failed) {
      // INITIATE_AUTHORIZE / REFUNDED / PARTIALLY_REFUNDED — still in
      // flight from the guest's POV.
      return NextResponse.json({
        ok: true,
        state: "pending",
        orderStatus: status.orderStatus,
      });
    }

    if (!reservationId) {
      // Audit envelope has no reservation id and the merchantOrderId
      // can't be decoded. Surface this so an operator can reconcile.
      return NextResponse.json(
        {
          ok: false,
          state: "paid-no-reservation",
          error: "no-reservation-id",
        },
        { status: 500 },
      );
    }

    const targetStatus = completed ? "accepted" : "cancelled_by_guest";
    try {
      await hostify.updateReservation(reservationId, {
        status: targetStatus,
        note: completed
          ? `Paid via SuperPay. Order ${order.merchantOrderId} / payment ${status.paymentgwOrderId}. (status-backstop)`
          : `SuperPay reported ${status.orderStatus}. Order ${order.merchantOrderId}. (status-backstop)`,
      });
    } catch (err) {
      if (err instanceof HostifyError) {
        const alreadyInState =
          err.status === 400 && /Status should be one of/i.test(err.body);
        if (!alreadyInState) {
          // Real Hostify failure on a paid order — page user, but report
          // honest state.
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
      // Record on the audit envelope so the next poll short-circuits.
      // We need the Hostify confirmation_code — re-fetch the reservation.
      let confirmationCode = order.hostifyConfirmationCode;
      try {
        const r = await hostify.getReservation(reservationId);
        confirmationCode = r.reservation?.confirmation_code ?? confirmationCode;
      } catch {
        // Best-effort; the merchantOrderId is enough as a ref otherwise.
      }
      if (confirmationCode && confirmationCode !== order.hostifyConfirmationCode) {
        await updateOrder(order.merchantOrderId, {
          hostifyConfirmationCode: confirmationCode,
        });
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
