import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { hostify, HOSTIFY_AVAILABLE, HostifyError } from "@/lib/hostify/client";
import { getHomeBySlug } from "@/lib/data/server";
import { homeHostifyPrimaryId } from "@/lib/data";

// Booking status to create in Hostify. "pending" = host accepts manually
// (typical when payment is collected outside Hostify or via a follow-up
// payment link). Switch to "accepted" once payment is collected on this
// site directly.
const HOSTIFY_BOOKING_STATUS: "pending" | "accepted" = "pending";

const BookingSchema = z.object({
  homeSlug: z.string().min(1),
  checkIn: z.string().min(8),
  checkOut: z.string().min(8),
  nights: z.number().int().min(1),
  guests: z.number().int().min(1).max(20),
  guest: z.object({
    firstName: z.string().min(1).max(80),
    lastName: z.string().min(1).max(80),
    email: z.string().email(),
    phone: z.string().min(5).max(40),
    country: z.string().min(2).max(80),
    specialRequests: z.string().max(2000).optional().or(z.literal("")),
    agreeTerms: z.literal("on"),
  }),
  pricing: z.object({
    subtotalEGP: z.number().int().min(0),
    discountEGP: z.number().int().min(0),
    cleaningFeeEGP: z.number().int().min(0),
    totalEGP: z.number().int().min(0),
    currency: z.enum(["EGP", "USD"]),
  }),
  locale: z.enum(["en", "ar"]),
  source: z.literal("direct-website"),
  timestamp: z.string(),
});

const EGP_PER_USD = (() => {
  const raw = process.env.NEXT_PUBLIC_EGP_PER_USD;
  if (!raw) return 50;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 50;
})();

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }

  const parsed = BookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "invalid-payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const fallbackRef = generateRef(data.homeSlug);

  // Try to create the reservation in Hostify. If the API key isn't set or
  // the call fails, we still capture the lead via the webhook and return
  // a synthesised ref so the UI flow doesn't break.
  let hostifyResult: {
    ok: boolean;
    confirmationCode?: string;
    reservationId?: number;
    error?: string;
  } | null = null;

  if (HOSTIFY_AVAILABLE()) {
    try {
      const home = await getHomeBySlug(data.homeSlug);
      const listingId = home ? homeHostifyPrimaryId(home) : undefined;

      if (!home || !listingId) {
        // Mock-only home (no Hostify ID). Fall through to webhook only.
        hostifyResult = { ok: false, error: "no-hostify-listing" };
      } else {
        // Hostify expects total_price in the listing's currency. Travelholic
        // listings are in USD; convert the EGP total back to USD here.
        const totalUsd =
          data.pricing.currency === "EGP"
            ? data.pricing.totalEGP / EGP_PER_USD
            : data.pricing.totalEGP;

        const guest = data.guest;
        const fullName = `${guest.firstName} ${guest.lastName}`.trim();
        const note =
          (guest.specialRequests || "").trim() ||
          `Booked direct via Travelholic website. Country: ${guest.country}.`;

        const res = await hostify.createReservation({
          listingId,
          startDate: data.checkIn,
          endDate: data.checkOut,
          guests: data.guests,
          name: fullName,
          email: guest.email,
          phone: guest.phone,
          totalPrice: totalUsd,
          note,
          source: "Travelholic Direct",
          status: HOSTIFY_BOOKING_STATUS,
        });

        if (res.success && res.reservation) {
          hostifyResult = {
            ok: true,
            confirmationCode: res.reservation.confirmation_code,
            reservationId: res.reservation.id,
          };
        } else {
          hostifyResult = {
            ok: false,
            error: res.error || res.message || "hostify-rejected",
          };
        }
      }
    } catch (err) {
      hostifyResult = {
        ok: false,
        error: err instanceof HostifyError ? `hostify-${err.status}` : "hostify-error",
      };
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.error("[booking] hostify createReservation failed:", err);
      }
    }
  }

  const finalRef = hostifyResult?.confirmationCode ?? fallbackRef;

  // Webhook is now optional analytics — fires whether or not Hostify call
  // succeeded so the team has a record either way.
  const webhookUrl = process.env.BOOKING_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "booking-lead",
          ref: finalRef,
          hostify: hostifyResult,
          ...data,
        }),
      });
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.error("[booking] webhook delivery failed", err);
      }
    }
  } else if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log("[booking] no webhook configured — local log only:", {
      ref: finalRef,
      hostify: hostifyResult,
    });
  }

  // Surface Hostify failures to the client so the dialog can show an
  // honest error instead of a fake confirmation code.
  if (hostifyResult && hostifyResult.ok === false && hostifyResult.error !== "no-hostify-listing") {
    return NextResponse.json(
      {
        ok: false,
        error: hostifyResult.error,
        ref: fallbackRef,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    ref: finalRef,
    hostifyReservationId: hostifyResult?.reservationId,
    status: hostifyResult?.ok ? HOSTIFY_BOOKING_STATUS : "lead",
  });
}

function generateRef(slug: string): string {
  const ts = Date.now().toString(36).toUpperCase().slice(-5);
  const slugSig = slug
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 4)
    .toUpperCase();
  return `TH-${slugSig}-${ts}`;
}
