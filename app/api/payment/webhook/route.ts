import { NextResponse, type NextRequest } from "next/server";
import { superpay, SuperPayError } from "@/lib/superpay/client";
import { getOrder, isExpired, saveOrder, updateOrder } from "@/lib/superpay/orders";
import { verifyBookingToken } from "@/lib/superpay/bookingToken";
import { createHostifyReservation } from "@/lib/hostify/reservations";
import { paymentAudit } from "@/lib/payment/auditLog";
import { createPaymentAirtableBackup } from "@/lib/payment/airtableBackup";
import type { WebhookNotificationParams } from "@/lib/superpay/types";

/**
 * SuperPay calls this endpoint with `?response=<base64-encoded-JSON>` after
 * the customer finishes (or fails) payment on the hosted page. The notification
 * itself is unsigned, so we defensively re-verify status via the Get Order
 * Status API before acting on it. Idempotent on `paymentgwOrderId` —
 * SuperPay can deliver multiple times.
 *
 * On verified PAY_COMPLETED we create the Hostify reservation (which we
 * deliberately deferred at /api/payment/create time to avoid orphans).
 */
export async function GET(req: NextRequest) {
  const responseParam = req.nextUrl.searchParams.get("response") ?? req.nextUrl.searchParams.get("params");
  if (!responseParam) {
    await paymentAudit({
      level: "warn",
      event: "payment_webhook_missing_response",
      source: "webhook",
    });
    return NextResponse.json({ ok: false, error: "missing-response" }, { status: 400 });
  }

  let notification: WebhookNotificationParams;
  try {
    const normalized = responseParam.replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(normalized, "base64").toString("utf8");
    notification = JSON.parse(json) as WebhookNotificationParams;
  } catch {
    await paymentAudit({
      level: "warn",
      event: "payment_webhook_invalid_base64",
      source: "webhook",
    });
    return NextResponse.json({ ok: false, error: "invalid-base64" }, { status: 400 });
  }

  const { merchantOrderId, paymentgwOrderId } = notification;
  if (!merchantOrderId || !paymentgwOrderId) {
    await paymentAudit({
      level: "warn",
      event: "payment_webhook_missing_fields",
      source: "webhook",
      details: { merchantOrderId: Boolean(merchantOrderId), paymentgwOrderId: Boolean(paymentgwOrderId) },
    });
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }

  await paymentAudit({
    event: "payment_webhook_received",
    source: "webhook",
    merchantOrderId,
    paymentgwOrderId,
    orderStatus: notification.orderStatus,
    totalEGP: notification.totalAmount,
    details: { status: notification.status, tokenPresent: Boolean(req.nextUrl.searchParams.get("bt")) },
  });

  let order = await getOrder(merchantOrderId);
  if (!order) {
    const tokenOrder = verifyBookingToken(req.nextUrl.searchParams.get("bt"));
    if (tokenOrder?.merchantOrderId === merchantOrderId) {
      order = tokenOrder;
      await saveOrder(tokenOrder);
      await paymentAudit({
        event: "payment_webhook_order_recovered_from_token",
        source: "webhook",
        merchantOrderId,
        paymentgwOrderId,
        homeSlug: tokenOrder.homeSlug,
      });
    }
  }
  if (!order) {
    // Either the order never existed on our side or we already cleaned it
    // up. Acknowledge so SuperPay stops retrying.
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(`[payment/webhook] unknown merchantOrderId ${merchantOrderId}`);
    }
    await paymentAudit({
      level: "error",
      event: "payment_webhook_order_not_found",
      source: "webhook",
      merchantOrderId,
      paymentgwOrderId,
      orderStatus: notification.orderStatus,
      details: { tokenPresent: Boolean(req.nextUrl.searchParams.get("bt")) },
    });
    return NextResponse.json({ ok: true, ignored: "unknown-order" });
  }

  // Idempotency: if we've already created the Hostify reservation for this
  // paymentgwOrderId, ack and exit.
  if (order.hostify && order.payment?.paymentgwOrderId === paymentgwOrderId) {
    await paymentAudit({
      event: "payment_webhook_already_confirmed",
      source: "webhook",
      merchantOrderId,
      paymentgwOrderId,
      hostifyReservationId: order.hostify.reservationId,
      confirmationCode: order.hostify.confirmationCode,
      homeSlug: order.homeSlug,
      orderStatus: order.payment.orderStatus,
    });
    return NextResponse.json({
      ok: true,
      already: true,
      hostifyReservationId: order.hostify.reservationId,
    });
  }

  // Defensive re-verify against SuperPay (the GET notification has no
  // signature; we never trust it on its own).
  let verified: WebhookNotificationParams = notification;
  try {
    const status = await superpay.getOrderStatus(merchantOrderId);
    await paymentAudit({
      event: "payment_webhook_superpay_verified",
      source: "webhook",
      merchantOrderId,
      paymentgwOrderId: status.status === "SUCCESS" ? status.paymentgwOrderId : paymentgwOrderId,
      homeSlug: order.homeSlug,
      orderStatus: status.status === "SUCCESS" ? status.orderStatus : status.status,
      totalEGP: status.status === "SUCCESS" ? status.totalAmount : undefined,
      details:
        status.status === "SUCCESS"
          ? { paymentMethod: status.paymentMethod, updatedTime: status.updatedTime }
          : { errorCode: status.errorCode, descriptionEnglish: status.descriptionEnglish },
    });
    if (status.status !== "SUCCESS") {
      return NextResponse.json(
        { ok: false, error: "verify-failed", detail: "supplied" in status ? status : undefined },
        { status: 502 },
      );
    }
    if (status.paymentgwOrderId !== paymentgwOrderId) {
      return NextResponse.json(
        { ok: false, error: "paymentgw-mismatch" },
        { status: 409 },
      );
    }
    verified = {
      ...notification,
      orderStatus: status.orderStatus,
      totalAmount: status.totalAmount,
      currency: "EGP",
    };
  } catch (err) {
    const code = err instanceof SuperPayError ? `superpay-${err.status}` : "verify-error";
    await paymentAudit({
      level: "error",
      event: "payment_webhook_superpay_verify_failed",
      source: "webhook",
      merchantOrderId,
      paymentgwOrderId,
      homeSlug: order.homeSlug,
      error: code,
      message: err instanceof Error ? err.message : "unknown-error",
    });
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[payment/webhook] verify failed:", err);
    }
    return NextResponse.json({ ok: false, error: code }, { status: 502 });
  }

  // Persist the payment outcome regardless of status (FAILED + EXPIRED also
  // get recorded so the success/cancelled pages can show an honest result).
  await updateOrder(merchantOrderId, {
    payment: {
      paymentgwOrderId,
      orderStatus: verified.orderStatus,
      completedAt: new Date().toISOString(),
      paymentMethod: verified.paymentMethod,
      acquirer: verified.acquirer,
      network: verified.network,
    },
  });
  await paymentAudit({
    event: "payment_webhook_payment_recorded",
    source: "webhook",
    merchantOrderId,
    paymentgwOrderId,
    homeSlug: order.homeSlug,
    orderStatus: verified.orderStatus,
    totalEGP: verified.totalAmount,
    details: { paymentMethod: verified.paymentMethod },
  });

  if (verified.orderStatus !== "PAY_COMPLETED") {
    // Non-success outcome — don't touch Hostify. Page polling will see this
    // status via /api/payment/status.
    return NextResponse.json({ ok: true, orderStatus: verified.orderStatus });
  }

  if (isExpired(order)) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(
        `[payment/webhook] PAY_COMPLETED for expired order ${merchantOrderId} — still creating reservation`,
      );
    }
    // We *still* create the Hostify reservation: the customer paid, we owe
    // them the booking. The expiry was just our internal cleanup hint.
  }

  await paymentAudit({
    event: "payment_webhook_hostify_create_started",
    source: "webhook",
    merchantOrderId,
    paymentgwOrderId,
    homeSlug: order.homeSlug,
    checkIn: order.checkIn,
    checkOut: order.checkOut,
    guests: order.guests,
    totalEGP: order.pricing.totalEGP,
    orderStatus: verified.orderStatus,
  });
  const reservation = await createHostifyReservation({
    homeSlug: order.homeSlug,
    checkIn: order.checkIn,
    checkOut: order.checkOut,
    guests: order.guests,
    guest: order.guest,
    totalEGP: order.pricing.totalEGP,
    status: "accepted",
    noteSuffix: `Paid via SuperPay. Order ${merchantOrderId} / payment ${paymentgwOrderId}.`,
  });

  if (!reservation.ok) {
    await paymentAudit({
      level: "error",
      event: "payment_webhook_hostify_create_failed",
      source: "webhook",
      merchantOrderId,
      paymentgwOrderId,
      homeSlug: order.homeSlug,
      checkIn: order.checkIn,
      checkOut: order.checkOut,
      guests: order.guests,
      totalEGP: order.pricing.totalEGP,
      orderStatus: verified.orderStatus,
      error: reservation.error,
    });
    // Payment succeeded but Hostify create failed — surface the inconsistency.
    // The order record holds payment info so an operator can manually create
    // the reservation in Hostify and reconcile.
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error(
        `[payment/webhook] Hostify create FAILED after payment for ${merchantOrderId}: ${reservation.error}`,
      );
    }
    return NextResponse.json(
      { ok: false, error: "hostify-failed-after-payment", detail: reservation.error },
      { status: 500 },
    );
  }

  await updateOrder(merchantOrderId, {
    hostify: {
      reservationId: reservation.reservationId,
      confirmationCode: reservation.confirmationCode,
      createdAt: new Date().toISOString(),
    },
  });
  await paymentAudit({
    event: "payment_webhook_hostify_create_succeeded",
    source: "webhook",
    merchantOrderId,
    paymentgwOrderId,
    hostifyReservationId: reservation.reservationId,
    confirmationCode: reservation.confirmationCode,
    homeSlug: order.homeSlug,
    checkIn: order.checkIn,
    checkOut: order.checkOut,
    guests: order.guests,
    totalEGP: order.pricing.totalEGP,
    orderStatus: verified.orderStatus,
  });
  await createPaymentAirtableBackup({
    source: "webhook",
    order,
    payment: {
      paymentgwOrderId,
      orderStatus: verified.orderStatus,
      totalAmount: verified.totalAmount,
      updatedTime: verified.updatedTime,
      paymentMethod: verified.paymentMethod,
    },
    hostify: {
      reservationId: reservation.reservationId,
      confirmationCode: reservation.confirmationCode,
    },
  });

  return NextResponse.json({
    ok: true,
    orderStatus: verified.orderStatus,
    hostifyReservationId: reservation.reservationId,
    confirmationCode: reservation.confirmationCode,
  });
}
