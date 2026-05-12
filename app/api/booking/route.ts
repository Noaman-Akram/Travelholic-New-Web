import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { hostify, HOSTIFY_AVAILABLE, HostifyError } from "@/lib/hostify/client";
import { getHomeBySlug } from "@/lib/data/server";
import { homeHostifyPrimaryId } from "@/lib/data";
import { egpToUsd } from "@/lib/fx/rates";

// Booking status to create in Hostify. "accepted" = the reservation is
// confirmed the moment the guest submits the form — no manual host
// approval queue, no payment gate. Travelholic's current commercial
// model is instant direct booking without on-site payment; switch back
// to "pending" only if you reintroduce an approval / payment step.
const HOSTIFY_BOOKING_STATUS: "pending" | "accepted" = "accepted";

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

// Brief operational logs (PII-safe) so reservation issues are diagnosable
// from Vercel → Logs without exposing guest emails / phones.
/* eslint-disable no-console */
const log = (...args: unknown[]) => console.log("[booking]", ...args);
const logErr = (...args: unknown[]) => console.error("[booking]", ...args);
/* eslint-enable no-console */

export async function POST(req: NextRequest) {
  const t0 = Date.now();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    logErr("invalid-json body");
    return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }

  const parsed = BookingSchema.safeParse(body);
  if (!parsed.success) {
    logErr("invalid-payload", parsed.error.flatten().fieldErrors);
    return NextResponse.json(
      { ok: false, error: "invalid-payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const fallbackRef = generateRef(data.homeSlug);

  log("incoming", {
    slug: data.homeSlug,
    ci: data.checkIn,
    co: data.checkOut,
    nights: data.nights,
    guests: data.guests,
    locale: data.locale,
    totalEGP: data.pricing.totalEGP,
    currency: data.pricing.currency,
    hostifyAvailable: HOSTIFY_AVAILABLE(),
  });

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
        log("mock-only home, skipping hostify", { slug: data.homeSlug, hasHome: !!home });
        hostifyResult = { ok: false, error: "no-hostify-listing" };
      } else {
        // Hostify expects total_price in the listing's currency. Travelholic
        // listings are in USD; convert the EGP total back to USD using the
        // live FX rate.
        const totalUsd =
          data.pricing.currency === "EGP"
            ? await egpToUsd(data.pricing.totalEGP)
            : data.pricing.totalEGP;

        const guest = data.guest;
        const fullName = `${guest.firstName} ${guest.lastName}`.trim();
        const note =
          (guest.specialRequests || "").trim() ||
          `Booked direct via Travelholic website. Country: ${guest.country}.`;

        log("calling hostify", {
          listingId,
          ci: data.checkIn,
          co: data.checkOut,
          guests: data.guests,
          totalUsd,
          status: HOSTIFY_BOOKING_STATUS,
        });

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
          log("hostify success", {
            reservationId: res.reservation.id,
            confirmationCode: res.reservation.confirmation_code,
          });
        } else {
          hostifyResult = {
            ok: false,
            error: res.error || res.message || "hostify-rejected",
          };
          logErr("hostify rejected", { error: hostifyResult.error });
        }
      }
    } catch (err) {
      hostifyResult = {
        ok: false,
        error: err instanceof HostifyError ? `hostify-${err.status}` : "hostify-error",
      };
      logErr("hostify threw", {
        error: hostifyResult.error,
        message: err instanceof Error ? err.message : String(err),
        body: err instanceof HostifyError ? err.body : undefined,
      });
    }
  } else {
    log("hostify not configured (HOSTIFY_API_KEY missing) — lead-only mode");
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
      log("webhook delivered", { ref: finalRef });
    } catch (err) {
      logErr("webhook failed", { ref: finalRef, message: err instanceof Error ? err.message : String(err) });
    }
  } else {
    log("no webhook configured", { ref: finalRef });
  }

  // Surface Hostify failures to the client so the dialog can show an
  // honest error instead of a fake confirmation code.
  if (hostifyResult && hostifyResult.ok === false && hostifyResult.error !== "no-hostify-listing") {
    log("response 502", { ref: fallbackRef, error: hostifyResult.error, ms: Date.now() - t0 });
    return NextResponse.json(
      {
        ok: false,
        error: hostifyResult.error,
        ref: fallbackRef,
      },
      { status: 502 },
    );
  }

  const status = hostifyResult?.ok ? HOSTIFY_BOOKING_STATUS : "lead";
  log("response 200", {
    ref: finalRef,
    hostifyReservationId: hostifyResult?.reservationId,
    status,
    ms: Date.now() - t0,
  });

  return NextResponse.json({
    ok: true,
    ref: finalRef,
    hostifyReservationId: hostifyResult?.reservationId,
    status,
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
