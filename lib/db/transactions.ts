import "server-only";
import { sql } from "./client";

export type TransactionStatus =
  | "initiated"
  | "pending"
  | "succeeded"
  | "failed"
  | "cancelled";

export type TransactionRow = {
  id: string;
  merchant_order_id: string;
  hostify_reservation_id: number;
  hostify_confirmation_code: string | null;
  home_slug: string;
  check_in: string;
  check_out: string;
  nights: number;
  guests: number;
  guest_email: string;
  guest_first_name: string;
  guest_last_name: string;
  guest_phone: string;
  amount_egp: number;
  locale: string;
  status: TransactionStatus;
  superpay_status: string | null;
  payment_gw_order_id: string | null;
  payment_url: string | null;
  hostify_status: string | null;
  hostify_action_at: string | null;
  hostify_error: string | null;
  webhook_payload: unknown;
  verify_payload: unknown;
  created_at: string;
  updated_at: string;
};

export type CreateTransactionInput = {
  merchantOrderId: string;
  hostifyReservationId: number;
  hostifyConfirmationCode?: string | null;
  homeSlug: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  guestEmail: string;
  guestFirstName: string;
  guestLastName: string;
  guestPhone: string;
  amountEgp: number;
  locale: string;
};

/**
 * Insert a fresh row at status='initiated' before the SuperPay POST.
 * Idempotent on merchant_order_id (returns the existing row if rerun).
 */
export async function createTransaction(
  input: CreateTransactionInput,
): Promise<TransactionRow> {
  const [row] = await sql<TransactionRow[]>`
    insert into transactions (
      merchant_order_id, hostify_reservation_id, hostify_confirmation_code,
      home_slug, check_in, check_out, nights, guests,
      guest_email, guest_first_name, guest_last_name, guest_phone,
      amount_egp, locale, status
    ) values (
      ${input.merchantOrderId}, ${input.hostifyReservationId}, ${input.hostifyConfirmationCode ?? null},
      ${input.homeSlug}, ${input.checkIn}, ${input.checkOut}, ${input.nights}, ${input.guests},
      ${input.guestEmail}, ${input.guestFirstName}, ${input.guestLastName}, ${input.guestPhone},
      ${input.amountEgp}, ${input.locale}, 'initiated'
    )
    on conflict (merchant_order_id) do update set updated_at = now()
    returning *
  `;
  return row;
}

export async function markTransactionPending(
  merchantOrderId: string,
  paymentUrl: string,
): Promise<void> {
  await sql`
    update transactions
    set status = 'pending', payment_url = ${paymentUrl}
    where merchant_order_id = ${merchantOrderId}
  `;
}

export async function markTransactionFailedToCreate(
  merchantOrderId: string,
  errorDetail: string,
): Promise<void> {
  await sql`
    update transactions
    set status = 'failed', hostify_error = ${errorDetail}
    where merchant_order_id = ${merchantOrderId}
  `;
}

export async function getTransaction(
  merchantOrderId: string,
): Promise<TransactionRow | null> {
  const rows = await sql<TransactionRow[]>`
    select * from transactions
    where merchant_order_id = ${merchantOrderId}
    limit 1
  `;
  return rows[0] ?? null;
}

import type { JSONValue } from "postgres";

export type WebhookUpdate = {
  superpayStatus: string;
  paymentGwOrderId: string;
  webhookPayload: JSONValue;
  verifyPayload: JSONValue;
  status: TransactionStatus;
};

export async function applyWebhookUpdate(
  merchantOrderId: string,
  update: WebhookUpdate,
): Promise<void> {
  await sql`
    update transactions
    set
      superpay_status = ${update.superpayStatus},
      payment_gw_order_id = ${update.paymentGwOrderId},
      webhook_payload = ${sql.json(update.webhookPayload)},
      verify_payload = ${sql.json(update.verifyPayload)},
      status = ${update.status}
    where merchant_order_id = ${merchantOrderId}
  `;
}

export async function recordHostifyAction(
  merchantOrderId: string,
  hostifyStatus: string,
  error?: string,
): Promise<void> {
  await sql`
    update transactions
    set
      hostify_status = ${hostifyStatus},
      hostify_action_at = now(),
      hostify_error = ${error ?? null}
    where merchant_order_id = ${merchantOrderId}
  `;
}
