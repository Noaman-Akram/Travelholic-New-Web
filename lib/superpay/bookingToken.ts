import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import type { PendingBooking } from "./types";

const TOKEN_VERSION = 1;
const ALGORITHM = "aes-256-gcm";

function getTokenSecret(): string {
  const secret =
    process.env.PAYMENT_BOOKING_TOKEN_SECRET?.trim() ||
    process.env.SUPERPAY_SECRET_KEY?.trim() ||
    process.env.SUPERPAY_SECURE_HASH_KEY?.trim();

  if (!secret) {
    throw new Error("No booking token secret configured");
  }
  return secret;
}

function getKey(): Buffer {
  return createHash("sha256").update(getTokenSecret()).digest();
}

function encode(value: Buffer): string {
  return value.toString("base64url");
}

export function createBookingToken(order: PendingBooking): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify({ v: TOKEN_VERSION, order }), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [String(TOKEN_VERSION), encode(iv), encode(encrypted), encode(tag)].join(".");
}

export function verifyBookingToken(token: string | null): PendingBooking | null {
  if (!token) return null;

  const [version, iv, encrypted, tag] = token.split(".");
  if (version !== String(TOKEN_VERSION) || !iv || !encrypted || !tag) return null;

  try {
    const decipher = createDecipheriv(
      ALGORITHM,
      getKey(),
      Buffer.from(iv, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encrypted, "base64url")),
      decipher.final(),
    ]).toString("utf8");
    const parsed = JSON.parse(decrypted) as {
      v?: number;
      order?: PendingBooking;
    };
    if (parsed.v !== TOKEN_VERSION || !parsed.order?.merchantOrderId) return null;
    return parsed.order;
  } catch {
    return null;
  }
}
