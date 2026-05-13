import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { superpay, SUPERPAY_AVAILABLE, SuperPayError } from "@/lib/superpay/client";
import {
  buildMerchantOrderIdFromReservation,
  newOrderEnvelope,
  saveOrder,
} from "@/lib/superpay/orders";

const CreateSchema = z.object({
  // The Hostify reservation that the BookingDialog just created with
  // status="pending". We embed its numeric id into the SuperPay
  // merchantOrderId so the webhook can find this exact reservation when
  // the payment lifecycle resolves.
  hostifyReservationId: z.number().int().positive(),
  hostifyConfirmationCode: z.string().min(1).max(80),
  homeSlug: z.string().min(1),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
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
    totalEGP: z.number().int().min(1),
  }),
  locale: z.enum(["en", "ar"]),
});

/**
 * Hands the customer off to SuperPay.
 *
 * Preconditions: /api/booking has already created a Hostify reservation
 * with status="pending" — its numeric id and confirmation_code travel
 * in the request body. Hostify is the source of truth for the booking
 * lifecycle; this route only builds the SuperPay iframe URL and saves
 * a thin audit envelope of our own.
 *
 * The `merchantOrderId` we hand to SuperPay encodes the Hostify
 * reservation id so the webhook (which is unsigned) can locate the
 * exact reservation to promote → accepted on PAY_COMPLETED, or
 * cancel via cancelled_by_guest on PAY_FAILED / PAY_CANCELLED.
 */
export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  if (!SUPERPAY_AVAILABLE()) {
    console.warn("[payment/create] superpay-not-configured — missing env vars");
    return NextResponse.json(
      { ok: false, error: "superpay-not-configured" },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    console.warn("[payment/create] invalid-json");
    return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    console.warn("[payment/create] invalid-payload", {
      issues: parsed.error.flatten(),
    });
    return NextResponse.json(
      { ok: false, error: "invalid-payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;

  console.log("[payment/create] request", {
    hostifyReservationId: data.hostifyReservationId,
    homeSlug: data.homeSlug,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    nights: data.nights,
    guests: data.guests,
    totalEGP: data.pricing.totalEGP,
    locale: data.locale,
  });

  // Format: TH-<hostify-id>-<short-suffix>. The suffix lets the same
  // reservation be retried with a fresh SuperPay order if the first
  // attempt times out, without collisions on SuperPay's side.
  const merchantOrderId = buildMerchantOrderIdFromReservation(
    data.hostifyReservationId,
  );

  // Thin local audit envelope — Hostify is the lifecycle store but
  // having a side trail of "what we asked SuperPay for" is invaluable
  // when debugging webhook arrivals. Best-effort: failures don't block
  // the payment.
  try {
    await saveOrder(
      newOrderEnvelope({
        merchantOrderId,
        homeSlug: data.homeSlug,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        nights: data.nights,
        guests: data.guests,
        guest: data.guest,
        pricing: data.pricing,
        locale: data.locale,
        hostifyReservationId: data.hostifyReservationId,
        hostifyConfirmationCode: data.hostifyConfirmationCode,
      }),
    );
  } catch {
    // Audit save is non-blocking.
  }

  try {
    const { url, debug } = await superpay.createIframeUrl({
      merchantOrderId,
      amount: data.pricing.totalEGP,
      currency: "EGP",
      // Email as the customer identifier so SuperPay can tokenize the
      // card for returning bookings (per V1.3 spec, clientId is optional
      // but enables saved-card flow on subsequent visits).
      clientId: data.guest.email,
    });

    console.log("[payment/create] success", {
      merchantOrderId,
      elapsedMs: Date.now() - startedAt,
      paymentUrlHost: (() => {
        try { return new URL(url).host; } catch { return "?"; }
      })(),
    });

    // Redact secrets before exposing the SuperPay request to the
    // browser. The user can still see the exact endpoint, structure,
    // and merchant code — just not the API key or full signature.
    const redactedHeaders = {
      ...debug.requestHeaders,
      "X-API-Key": "***REDACTED***",
    };
    const redactedBody = {
      ...debug.requestBody,
      merchant: {
        code: debug.requestBody.merchant.code,
        apiKey: "***REDACTED***",
      },
    };

    return NextResponse.json({
      ok: true,
      merchantOrderId,
      paymentUrl: url,
      amount: data.pricing.totalEGP,
      currency: "EGP",
      debug: {
        endpoint: debug.endpoint,
        requestHeaders: redactedHeaders,
        requestBody: redactedBody,
        rawResponse: debug.rawResponse,
      },
    });
  } catch (err) {
    const code =
      err instanceof SuperPayError ? `superpay-${err.status}` : "superpay-error";
    console.error("[payment/create] failed", {
      merchantOrderId,
      elapsedMs: Date.now() - startedAt,
      code,
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { ok: false, error: code, merchantOrderId },
      { status: 502 },
    );
  }
}
