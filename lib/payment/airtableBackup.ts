import "server-only";

import type { PendingBooking, OrderStatusResponse } from "@/lib/superpay/types";
import { createPaymentAirtableRecord, paymentAirtableConfigured } from "./airtableClient";
import { paymentAudit } from "./auditLog";

type BackupInput = {
  source: "status" | "webhook";
  order: PendingBooking;
  payment: Extract<OrderStatusResponse, { status: "SUCCESS" }> | {
    paymentgwOrderId: string;
    orderStatus: string;
    totalAmount: number;
    updatedTime?: string;
    paymentMethod?: string;
  };
  hostify: {
    reservationId: number;
    confirmationCode: string;
  };
};

export async function createPaymentAirtableBackup(input: BackupInput): Promise<void> {
  if (!paymentAirtableConfigured()) {
    await paymentAudit({
      level: "warn",
      event: "payment_airtable_backup_skipped_not_configured",
      source: input.source,
      merchantOrderId: input.order.merchantOrderId,
      paymentgwOrderId: input.payment.paymentgwOrderId,
      hostifyReservationId: input.hostify.reservationId,
      confirmationCode: input.hostify.confirmationCode,
      homeSlug: input.order.homeSlug,
    });
    return;
  }

  const guestName = `${input.order.guest.firstName} ${input.order.guest.lastName}`.trim();
  const fields = {
    Name: `${guestName || "Guest"} - ${input.order.homeSlug} - ${input.order.merchantOrderId}`,
    "Created At": new Date().toISOString(),
    Status: "Accepted",
    Source: input.source,
    "Merchant Order ID": input.order.merchantOrderId,
    "SuperPay Payment ID": input.payment.paymentgwOrderId,
    "SuperPay Status": input.payment.orderStatus,
    "Hostify Reservation ID": String(input.hostify.reservationId),
    "Confirmation Code": input.hostify.confirmationCode,
    "Home Slug": input.order.homeSlug,
    "Check In": input.order.checkIn,
    "Check Out": input.order.checkOut,
    Nights: input.order.nights,
    Guests: input.order.guests,
    "Total EGP": input.order.pricing.totalEGP,
    "Guest Name": guestName,
    "Guest Email": input.order.guest.email,
    "Guest Phone": input.order.guest.phone,
    "Guest Country": input.order.guest.country,
    "Special Requests": input.order.guest.specialRequests || "",
    "Payment Method": input.payment.paymentMethod || "",
    "Event Log": JSON.stringify(
      {
        order: {
          merchantOrderId: input.order.merchantOrderId,
          homeSlug: input.order.homeSlug,
          checkIn: input.order.checkIn,
          checkOut: input.order.checkOut,
          nights: input.order.nights,
          guests: input.order.guests,
          pricing: input.order.pricing,
        },
        payment: input.payment,
        hostify: input.hostify,
      },
      null,
      2,
    ),
  };

  const result = await createPaymentAirtableRecord(fields);

  if (!result.ok) {
    await paymentAudit({
      level: "error",
      event: "payment_airtable_backup_failed",
      source: input.source,
      merchantOrderId: input.order.merchantOrderId,
      paymentgwOrderId: input.payment.paymentgwOrderId,
      hostifyReservationId: input.hostify.reservationId,
      confirmationCode: input.hostify.confirmationCode,
      homeSlug: input.order.homeSlug,
      error: result.error,
      message: result.message,
      details: { status: result.status },
    });
    return;
  }

  await paymentAudit({
    event: "payment_airtable_backup_succeeded",
    source: input.source,
    merchantOrderId: input.order.merchantOrderId,
    paymentgwOrderId: input.payment.paymentgwOrderId,
    hostifyReservationId: input.hostify.reservationId,
    confirmationCode: input.hostify.confirmationCode,
    homeSlug: input.order.homeSlug,
    details: { airtableRecordId: result.id },
  });
}
