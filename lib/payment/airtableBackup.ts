import "server-only";

import type { PendingBooking, OrderStatusResponse } from "@/lib/superpay/types";
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

type AirtableResponse = {
  id?: string;
  error?: {
    type?: string;
    message?: string;
  };
};

function getConfig():
  | {
      token: string;
      baseId: string;
      table: string;
    }
  | null {
  const token = process.env.PAYMENT_AIRTABLE_API_KEY?.trim();
  const baseId = process.env.PAYMENT_AIRTABLE_BASE_ID?.trim();
  const table = process.env.PAYMENT_AIRTABLE_TABLE_ID?.trim();
  if (!token || !baseId || !table) return null;
  return { token, baseId, table };
}

export async function createPaymentAirtableBackup(input: BackupInput): Promise<void> {
  const config = getConfig();
  if (!config) {
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

  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${encodeURIComponent(config.baseId)}/${encodeURIComponent(config.table)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields, typecast: true }),
        cache: "no-store",
      },
    );
    const data = (await res.json().catch(() => ({}))) as AirtableResponse;

    if (!res.ok) {
      await paymentAudit({
        level: "error",
        event: "payment_airtable_backup_failed",
        source: input.source,
        merchantOrderId: input.order.merchantOrderId,
        paymentgwOrderId: input.payment.paymentgwOrderId,
        hostifyReservationId: input.hostify.reservationId,
        confirmationCode: input.hostify.confirmationCode,
        homeSlug: input.order.homeSlug,
        error: data.error?.type ?? `airtable-${res.status}`,
        message: data.error?.message,
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
      details: { airtableRecordId: data.id },
    });
  } catch (err) {
    await paymentAudit({
      level: "error",
      event: "payment_airtable_backup_error",
      source: input.source,
      merchantOrderId: input.order.merchantOrderId,
      paymentgwOrderId: input.payment.paymentgwOrderId,
      hostifyReservationId: input.hostify.reservationId,
      confirmationCode: input.hostify.confirmationCode,
      homeSlug: input.order.homeSlug,
      error: err instanceof Error ? err.message : "unknown-error",
    });
  }
}
