import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

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

const LOG_DIR =
  process.env.PAYMENT_AUDIT_LOG_DIR ??
  (process.env.VERCEL
    ? path.join("/tmp", "travelholic-payment-audit")
    : path.resolve(process.cwd(), ".cache", "payment-audit"));
const LOG_FILE = path.join(LOG_DIR, "payment-events.jsonl");

export async function paymentAudit(event: PaymentAuditEvent): Promise<void> {
  const record: PaymentAuditRecord = {
    ...event,
    level: event.level ?? "info",
    at: new Date().toISOString(),
  };
  const line = JSON.stringify(record);

  writeConsole(record);

  try {
    await fs.mkdir(LOG_DIR, { recursive: true });
    await fs.appendFile(LOG_FILE, `${line}\n`, "utf8");
  } catch (err) {
    writeConsole({
      at: new Date().toISOString(),
      level: "error",
      event: "payment_audit_write_failed",
      source: "logs",
      error: err instanceof Error ? err.message : "unknown-error",
    });
  }

  await pushAuditWebhook(record);
}

export async function readPaymentAudit(limit = 200): Promise<PaymentAuditRecord[]> {
  try {
    const text = await fs.readFile(LOG_FILE, "utf8");
    return text
      .trim()
      .split("\n")
      .filter(Boolean)
      .slice(-Math.max(1, Math.min(limit, 1000)))
      .map((line) => JSON.parse(line) as PaymentAuditRecord)
      .reverse();
  } catch {
    return [];
  }
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

async function pushAuditWebhook(record: PaymentAuditRecord): Promise<void> {
  const url = process.env.PAYMENT_AUDIT_WEBHOOK_URL?.trim();
  if (!url) return;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(record),
      cache: "no-store",
      signal: controller.signal,
    });

    if (!res.ok) {
      writeConsole({
        at: new Date().toISOString(),
        level: "warn",
        event: "payment_audit_webhook_failed",
        source: "logs",
        details: { status: res.status },
      });
    }
  } catch (err) {
    writeConsole({
      at: new Date().toISOString(),
      level: "warn",
      event: "payment_audit_webhook_error",
      source: "logs",
      error: err instanceof Error ? err.message : "unknown-error",
    });
  } finally {
    clearTimeout(timeout);
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
