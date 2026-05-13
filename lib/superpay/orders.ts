import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import type { PendingBooking } from "./types";

// Reservation-first model: each merchantOrderId encodes the numeric
// Hostify reservation id so the webhook can promote pending → accepted
// (or cancel) by hitting Hostify directly.
//
// SuperPay requires merchantOrderId to be alphanumeric only — no
// hyphens, underscores, or other separators. Format:
//   TH<hostifyReservationId>X<hexRand>
// `X` is the separator because it's not a hex digit and not in
// numeric Hostify IDs, so the parser can split unambiguously.
const RESERVATION_ID_PREFIX = "TH";
const RESERVATION_ID_SEPARATOR = "X";

/**
 * Local file-backed store for in-flight bookings. Created on POST
 * /api/payment/create, consumed by /api/payment/webhook (or polled from
 * /api/payment/status), expires 15 minutes after creation if no payment
 * arrives.
 *
 * For multi-instance production this needs to move to a shared store
 * (Vercel KV / Upstash). The interface below — `save / get / update /
 * delete` — is what the swap target needs to expose, so the migration
 * is one file deep.
 */

const ORDER_TTL_MS = 15 * 60 * 1000; // 15 minutes
const STORE_DIR = path.resolve(process.cwd(), ".cache", "pending-orders");

function fileFor(merchantOrderId: string): string {
  // Whitelist on the slug/id segment to avoid path traversal.
  const safe = merchantOrderId.replace(/[^A-Za-z0-9_-]/g, "_");
  return path.join(STORE_DIR, `${safe}.json`);
}

/**
 * Reservation-first merchantOrderId. Format: `TH<hostifyId>X<rand>`.
 * Alphanumeric only per SuperPay spec. `X` separates the Hostify id
 * (pure digits) from the hex random suffix; X is not a hex digit so
 * the parser can locate the boundary unambiguously.
 */
export function buildMerchantOrderIdFromReservation(
  hostifyReservationId: number,
): string {
  const rand = randomBytes(4).toString("hex").toUpperCase();
  return `${RESERVATION_ID_PREFIX}${hostifyReservationId}${RESERVATION_ID_SEPARATOR}${rand}`;
}

/**
 * Extracts the Hostify reservation id from a merchantOrderId built by
 * buildMerchantOrderIdFromReservation. Returns null if the id isn't a
 * recognisable reservation-prefixed format.
 */
export function parseHostifyIdFromMerchantOrderId(
  merchantOrderId: string,
): number | null {
  if (!merchantOrderId.startsWith(RESERVATION_ID_PREFIX)) return null;
  const rest = merchantOrderId.slice(RESERVATION_ID_PREFIX.length);
  const sepIndex = rest.indexOf(RESERVATION_ID_SEPARATOR);
  const idPart = sepIndex >= 0 ? rest.slice(0, sepIndex) : rest;
  const n = Number(idPart);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) return null;
  return n;
}

export async function saveOrder(order: PendingBooking): Promise<void> {
  await fs.mkdir(STORE_DIR, { recursive: true });
  await fs.writeFile(fileFor(order.merchantOrderId), JSON.stringify(order, null, 2), "utf8");
}

export async function getOrder(merchantOrderId: string): Promise<PendingBooking | null> {
  try {
    const text = await fs.readFile(fileFor(merchantOrderId), "utf8");
    const parsed = JSON.parse(text) as PendingBooking;
    return parsed;
  } catch {
    return null;
  }
}

export async function updateOrder(
  merchantOrderId: string,
  patch: Partial<PendingBooking>,
): Promise<PendingBooking | null> {
  const current = await getOrder(merchantOrderId);
  if (!current) return null;
  const next: PendingBooking = { ...current, ...patch };
  await saveOrder(next);
  return next;
}

export async function deleteOrder(merchantOrderId: string): Promise<void> {
  try {
    await fs.unlink(fileFor(merchantOrderId));
  } catch {
    /* nothing */
  }
}

export function isExpired(order: PendingBooking): boolean {
  return new Date(order.expiresAt).getTime() < Date.now();
}

export function newOrderEnvelope(input: {
  merchantOrderId: string;
  homeSlug: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  guest: PendingBooking["guest"];
  pricing: PendingBooking["pricing"];
  locale: PendingBooking["locale"];
  hostifyReservationId?: number;
  hostifyConfirmationCode?: string;
}): PendingBooking {
  const now = Date.now();
  return {
    merchantOrderId: input.merchantOrderId,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + ORDER_TTL_MS).toISOString(),
    homeSlug: input.homeSlug,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    nights: input.nights,
    guests: input.guests,
    guest: input.guest,
    pricing: input.pricing,
    locale: input.locale,
    hostifyReservationId: input.hostifyReservationId,
    hostifyConfirmationCode: input.hostifyConfirmationCode,
  };
}
