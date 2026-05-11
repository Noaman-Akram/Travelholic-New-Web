import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { superpay, SUPERPAY_AVAILABLE, SuperPayError } from "@/lib/superpay/client";
import {
  generateMerchantOrderId,
  newOrderEnvelope,
  saveOrder,
} from "@/lib/superpay/orders";

const CreateSchema = z.object({
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
 * Step 1 of the payment flow.
 *
 * Builds a unique merchantOrderId, persists the pending booking on disk,
 * asks SuperPay for a hosted-iframe URL, and returns that URL to the
 * client. The client then either redirects or opens the URL in an iframe
 * popup.
 *
 * Important: we do NOT create the Hostify reservation here. That happens
 * in /api/payment/webhook AFTER SuperPay confirms PAY_COMPLETED. This
 * prevents orphan reservations when the customer abandons the payment.
 */
export async function POST(req: NextRequest) {
  if (!SUPERPAY_AVAILABLE()) {
    return NextResponse.json(
      { ok: false, error: "superpay-not-configured" },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "invalid-payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const merchantOrderId = generateMerchantOrderId(data.homeSlug);

  const envelope = newOrderEnvelope({
    merchantOrderId,
    homeSlug: data.homeSlug,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    nights: data.nights,
    guests: data.guests,
    guest: data.guest,
    pricing: data.pricing,
    locale: data.locale,
  });

  await saveOrder(envelope);

  try {
    const { url } = await superpay.createIframeUrl({
      merchantOrderId,
      amount: data.pricing.totalEGP,
      currency: "EGP",
      // Use the email as the customer identifier so SuperPay can offer
      // returning-card tokenization on subsequent bookings.
      clientId: data.guest.email,
    });

    return NextResponse.json({
      ok: true,
      merchantOrderId,
      paymentUrl: url,
      amount: data.pricing.totalEGP,
      currency: "EGP",
    });
  } catch (err) {
    const code = err instanceof SuperPayError ? `superpay-${err.status}` : "superpay-error";
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[payment/create] failed:", err);
    }
    return NextResponse.json(
      { ok: false, error: code, merchantOrderId },
      { status: 502 },
    );
  }
}
