import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import type { PendingBooking } from "./types";

// Reservation-first model: each merchantOrderId encodes the numeric
// Hostify reservation id so the webhook can promote pending → accepted
// (or cancel) by hitting Hostify directly.
const RESERVATION_ID_PREFIX = "TH-";

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
 * Pre-reservation flavour: kept for any legacy caller. Use
 * buildMerchantOrderIdFromReservation when you already have a Hostify
 * reservation id (which is the normal flow now).
 */
export function generateMerchantOrderId(homeSlug: string): string {
  const slugSig = homeSlug.replace(/[^a-z0-9]/gi, "").slice(0, 8).toUpperCase() || "HOME";
  const ts = Date.now().toString(36).toUpperCase();
  const rand = randomBytes(3).toString("hex").toUpperCase();
  return `${RESERVATION_ID_PREFIX}${slugSig}-${ts}-${rand}`;
}

/**
 * Reservation-first merchantOrderId. Format: `TH-<hostify-id>-<rand>`.
 * The hostify id (numeric, ~9 digits) is the part the webhook + expire
 * cron extract; the random suffix lets the same reservation be retried
 * with a fresh SuperPay order if the first attempt times out, without
 * collisions on SuperPay's side.
 */
export function buildMerchantOrderIdFromReservation(
  hostifyReservationId: number,
): string {
  const rand = randomBytes(2).toString("hex").toUpperCase();
  return `${RESERVATION_ID_PREFIX}${hostifyReservationId}-${rand}`;
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
  // The id is the first dash-separated segment that's purely numeric.
  // Defensive against future format tweaks.
  const firstSegment = rest.split("-")[0];
  const n = Number(firstSegment);
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
