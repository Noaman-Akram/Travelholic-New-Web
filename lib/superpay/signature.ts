import "server-only";

import { createHmac } from "node:crypto";

/**
 * SuperPay signs every order request with HMAC-SHA256(secret, payload).
 * The payload format is provider-specified per endpoint.
 *
 * For order creation (iframe URL): payload = `${merchantOrderId}${amount}${currency}`
 * Amount must be a two-decimal string ("100.00", not "100").
 *
 * For refund: payload = `${merchantOrderId}${paymentgwOrderId}${refundAmount}`
 *
 * Output is hex (not base64) per the spec.
 */

function getSecret(): string {
  const secret = process.env.SUPERPAY_SECURE_HASH_KEY?.trim();
  if (!secret) {
    throw new Error(
      "SUPERPAY_SECURE_HASH_KEY is not set. Add it to .env.local — it's required to sign payment requests.",
    );
  }
  return secret;
}

function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

export function signOrderCreate({
  merchantOrderId,
  amount,
  currency,
}: {
  merchantOrderId: string;
  amount: number;
  currency: string;
}): string {
  const payload = `${merchantOrderId}${formatAmount(amount)}${currency}`;
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function signRefund({
  merchantOrderId,
  paymentgwOrderId,
  refundAmount,
}: {
  merchantOrderId: string;
  paymentgwOrderId: string;
  refundAmount: number;
}): string {
  const payload = `${merchantOrderId}${paymentgwOrderId}${formatAmount(refundAmount)}`;
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function signKeyExchange({
  merchantCode,
  apiKey,
  requestTime,
}: {
  merchantCode: string;
  apiKey: string;
  requestTime: string;
}): string {
  const payload = `${merchantCode}${apiKey}${requestTime}`;
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}
