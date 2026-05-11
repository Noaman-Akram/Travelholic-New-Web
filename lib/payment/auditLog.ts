import "server-only";

import { createPaymentAirtableRecord, paymentAirtableConfigured } from "./airtableClient";

type PaymentAuditLevel = "info" | "warn" | "error";

export type PaymentAuditEvent = {
  level?: PaymentAuditLevel;
  event: string;
  merchantOrderId?: string;
  paymentgwOrderId?: string;
  hostifyReservationId?: number;
  confirmationCode?: string;
  homeSlug?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  totalEGP?: number;
  orderStatus?: string;
  source?: "create" | "status" | "webhook" | "hostify" | "logs";
  message?: string;
  error?: string;
  details?: Record<string, unknown>;
};

export type PaymentAuditRecord = PaymentAuditEvent & {
  at: string;
  level: PaymentAuditLevel;
};

export async function paymentAudit(event: PaymentAuditEvent): Promise<void> {
  const record: PaymentAuditRecord = {
    ...event,
    level: event.level ?? "info",
    at: new Date().toISOString(),
  };

  writeConsole(record);
  await pushAuditToAirtable(record);
}

function writeConsole(record: PaymentAuditRecord): void {
  const prefix = "[payment-audit]";
  if (record.level === "error") {
    // eslint-disable-next-line no-console
    console.error(prefix, record);
  } else if (record.level === "warn") {
    // eslint-disable-next-line no-console
    console.warn(prefix, record);
  } else {
    // eslint-disable-next-line no-console
    console.log(prefix, record);
  }
}

async function pushAuditToAirtable(record: PaymentAuditRecord): Promise<void> {
  if (!paymentAirtableConfigured()) return;

  const result = await createPaymentAirtableRecord(
    {
      Name: `${record.event}${record.merchantOrderId ? ` - ${record.merchantOrderId}` : ""}`,
      "Created At": record.at,
      Source: record.source,
      "Merchant Order ID": record.merchantOrderId,
      "SuperPay Payment ID": record.paymentgwOrderId,
      "SuperPay Status": record.orderStatus,
      "Hostify Reservation ID": record.hostifyReservationId
        ? String(record.hostifyReservationId)
        : undefined,
      "Confirmation Code": record.confirmationCode,
      "Home Slug": record.homeSlug,
      "Check In": record.checkIn,
      "Check Out": record.checkOut,
      Guests: record.guests,
      "Total EGP": record.totalEGP,
      "Event Log": JSON.stringify(record, null, 2),
    },
    2500,
  );

  if (!result.ok) {
    writeConsole({
      at: new Date().toISOString(),
      level: "warn",
      event: "payment_audit_airtable_failed",
      source: "hostify",
      error: result.error,
      message: result.message,
      details: { status: result.status },
    });
  }
}

export function maskEmail(email: string | undefined): string | undefined {
  if (!email) return undefined;
  const [name, domain] = email.split("@");
  if (!name || !domain) return "***";
  return `${name.slice(0, 2)}***@${domain}`;
}

export function maskPhone(phone: string | undefined): string | undefined {
  if (!phone) return undefined;
  return phone.length <= 4 ? "****" : `${phone.slice(0, 3)}***${phone.slice(-2)}`;
}
