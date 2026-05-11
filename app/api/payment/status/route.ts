import { NextResponse, type NextRequest } from "next/server";
import { superpay, SUPERPAY_AVAILABLE, SuperPayError } from "@/lib/superpay/client";
import { getOrder, saveOrder, updateOrder } from "@/lib/superpay/orders";
import { verifyBookingToken } from "@/lib/superpay/bookingToken";
import { createHostifyReservation } from "@/lib/hostify/reservations";
import { paymentAudit } from "@/lib/payment/auditLog";
import { createPaymentAirtableBackup } from "@/lib/payment/airtableBackup";

/**
 * Client-polled from /booking/success. Returns the current state of a
 * pending order — useful when the webhook hasn't arrived yet (or in local
 * dev when there's no public URL for SuperPay to call).
 *
 * Acts as a backstop: if SuperPay says PAY_COMPLETED but we haven't yet
 * created the Hostify reservation (no webhook), we create it here. Same
 * idempotency rule as the webhook applies.
 */
export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref");
  if (!ref) {
    await paymentAudit({
      level: "warn",
      event: "payment_status_missing_ref",
      source: "status",
    });
    return NextResponse.json({ ok: false, error: "missing-ref" }, { status: 400 });
  }

  let order = await getOrder(ref);
  if (!order) {
    const tokenOrder = verifyBookingToken(req.nextUrl.searchParams.get("bt"));
    if (tokenOrder?.merchantOrderId === ref) {
      order = tokenOrder;
      await saveOrder(tokenOrder);
      await paymentAudit({
        event: "payment_status_order_recovered_from_token",
        source: "status",
        merchantOrderId: ref,
        homeSlug: tokenOrder.homeSlug,
      });
    }
  }
  if (!order) {
    await paymentAudit({
      level: "error",
      event: "payment_status_order_not_found",
      source: "status",
      merchantOrderId: ref,
      details: { tokenPresent: Boolean(req.nextUrl.searchParams.get("bt")) },
    });
    return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  }

  // If we already have a confirmed Hostify reservation, return it immediately.
  if (order.hostify) {
    await paymentAudit({
      event: "payment_status_already_confirmed",
      source: "status",
      merchantOrderId: order.merchantOrderId,
      paymentgwOrderId: order.payment?.paymentgwOrderId,
      hostifyReservationId: order.hostify.reservationId,
      confirmationCode: order.hostify.confirmationCode,
      homeSlug: order.homeSlug,
      orderStatus: order.payment?.orderStatus,
    });
    return NextResponse.json({
      ok: true,
      state: "confirmed",
      confirmationCode: order.hostify.confirmationCode,
      hostifyReservationId: order.hostify.reservationId,
      paidAt: order.payment?.completedAt,
      homeSlug: order.homeSlug,
      checkIn: order.checkIn,
      checkOut: order.checkOut,
      guests: order.guests,
      nights: order.nights,
      totalEGP: order.pricing.totalEGP,
      paymentgwOrderId: order.payment?.paymentgwOrderId,
      orderStatus: order.payment?.orderStatus,
      paymentMethod: order.payment?.paymentMethod,
    });
  }

  // No reservation yet — query SuperPay for the authoritative status.
  if (!SUPERPAY_AVAILABLE()) {
    await paymentAudit({
      level: "warn",
      event: "payment_status_superpay_not_configured",
      source: "status",
      merchantOrderId: order.merchantOrderId,
      homeSlug: order.homeSlug,
    });
    return NextResponse.json(
      { ok: true, state: "pending", reason: "superpay-not-configured" },
    );
  }

  try {
    const status = await superpay.getOrderStatus(order.merchantOrderId);
    await paymentAudit({
      event: "payment_status_superpay_checked",
      source: "status",
      merchantOrderId: order.merchantOrderId,
      paymentgwOrderId: status.status === "SUCCESS" ? status.paymentgwOrderId : undefined,
      homeSlug: order.homeSlug,
      orderStatus: status.status === "SUCCESS" ? status.orderStatus : status.status,
      totalEGP: status.status === "SUCCESS" ? status.totalAmount : undefined,
      details:
        status.status === "SUCCESS"
          ? { paymentMethod: status.paymentMethod, updatedTime: status.updatedTime }
          : { errorCode: status.errorCode, descriptionEnglish: status.descriptionEnglish },
    });
    if (status.status !== "SUCCESS") {
      return NextResponse.json({ ok: true, state: "pending" });
    }

    if (status.orderStatus !== "PAY_COMPLETED") {
      // Persist the latest non-final state for the success page to read.
      await updateOrder(order.merchantOrderId, {
        payment: {
          paymentgwOrderId: status.paymentgwOrderId,
          orderStatus: status.orderStatus,
          completedAt: status.updatedTime,
          paymentMethod: status.paymentMethod,
          acquirer: status.acquirer,
          network: status.network,
        },
      });
      return NextResponse.json({
        ok: true,
        state: status.orderStatus === "FAILED" || status.orderStatus === "CANCELLED"
          ? "failed"
          : "pending",
        orderStatus: status.orderStatus,
      });
    }

    // PAY_COMPLETED but no Hostify reservation yet → create it now.
    await paymentAudit({
      event: "payment_status_hostify_create_started",
      source: "status",
      merchantOrderId: order.merchantOrderId,
      paymentgwOrderId: status.paymentgwOrderId,
      homeSlug: order.homeSlug,
      checkIn: order.checkIn,
      checkOut: order.checkOut,
      guests: order.guests,
      totalEGP: order.pricing.totalEGP,
      orderStatus: status.orderStatus,
    });
    const reservation = await createHostifyReservation({
      homeSlug: order.homeSlug,
      checkIn: order.checkIn,
      checkOut: order.checkOut,
      guests: order.guests,
      guest: order.guest,
      totalEGP: order.pricing.totalEGP,
      status: "accepted",
      noteSuffix: `Paid via SuperPay. Order ${order.merchantOrderId} / payment ${status.paymentgwOrderId}.`,
    });

    if (!reservation.ok) {
      await paymentAudit({
        level: "error",
        event: "payment_status_hostify_create_failed",
        source: "status",
        merchantOrderId: order.merchantOrderId,
        paymentgwOrderId: status.paymentgwOrderId,
        homeSlug: order.homeSlug,
        orderStatus: status.orderStatus,
        error: reservation.error,
      });
      // Payment succeeded but reservation create failed — surface this so
      // the success page can show "we'll be in touch" + ops gets paged.
      await updateOrder(order.merchantOrderId, {
        payment: {
          paymentgwOrderId: status.paymentgwOrderId,
          orderStatus: status.orderStatus,
          completedAt: status.updatedTime,
          paymentMethod: status.paymentMethod,
          acquirer: status.acquirer,
          network: status.network,
        },
      });
      return NextResponse.json(
        {
          ok: false,
          state: "paid-no-reservation",
        error: reservation.error,
        paymentgwOrderId: status.paymentgwOrderId,
        paidAt: status.updatedTime,
      },
      { status: 500 },
    );
    }

    await updateOrder(order.merchantOrderId, {
      payment: {
        paymentgwOrderId: status.paymentgwOrderId,
        orderStatus: status.orderStatus,
        completedAt: status.updatedTime,
        paymentMethod: status.paymentMethod,
        acquirer: status.acquirer,
        network: status.network,
      },
      hostify: {
        reservationId: reservation.reservationId,
        confirmationCode: reservation.confirmationCode,
        createdAt: new Date().toISOString(),
      },
    });
    await paymentAudit({
      event: "payment_status_hostify_create_succeeded",
      source: "status",
      merchantOrderId: order.merchantOrderId,
      paymentgwOrderId: status.paymentgwOrderId,
      hostifyReservationId: reservation.reservationId,
      confirmationCode: reservation.confirmationCode,
      homeSlug: order.homeSlug,
      orderStatus: status.orderStatus,
    });
    await createPaymentAirtableBackup({
      source: "status",
      order,
      payment: status,
      hostify: {
        reservationId: reservation.reservationId,
        confirmationCode: reservation.confirmationCode,
      },
    });

    return NextResponse.json({
      ok: true,
      state: "confirmed",
      confirmationCode: reservation.confirmationCode,
      hostifyReservationId: reservation.reservationId,
      paidAt: status.updatedTime,
      homeSlug: order.homeSlug,
      checkIn: order.checkIn,
      checkOut: order.checkOut,
      guests: order.guests,
      nights: order.nights,
      totalEGP: order.pricing.totalEGP,
      paymentgwOrderId: status.paymentgwOrderId,
      orderStatus: status.orderStatus,
      paymentMethod: status.paymentMethod,
    });
  } catch (err) {
    const code = err instanceof SuperPayError ? `superpay-${err.status}` : "status-error";
    await paymentAudit({
      level: "error",
      event: "payment_status_failed",
      source: "status",
      merchantOrderId: order.merchantOrderId,
      homeSlug: order.homeSlug,
      error: code,
      message: err instanceof Error ? err.message : "unknown-error",
    });
    return NextResponse.json({ ok: false, state: "error", error: code }, { status: 502 });
  }
}
