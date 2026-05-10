import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { hostify, HOSTIFY_AVAILABLE } from "@/lib/hostify/client";
import { homeHostifyPrimaryId } from "@/lib/data";
import { getHomeBySlug } from "@/lib/data/server";
import { calcBookingPricing } from "@/lib/utils/bookingMath";
import { createSuperPayIframeUrl, superPayAvailable } from "@/lib/superpay/client";

const PaymentIframeSchema = z.object({
  bookingRef: z.string().min(4).max(80),
  homeSlug: z.string().min(1),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.number().int().min(1).max(20),
  guest: z.object({
    email: z.string().email(),
    phone: z.string().min(5).max(40),
  }),
  locale: z.enum(["en", "ar"]),
});

const EGP_PER_USD = (() => {
  const raw = process.env.NEXT_PUBLIC_EGP_PER_USD;
  if (!raw) return 50;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 50;
})();

export async function POST(req: NextRequest) {
  if (!superPayAvailable()) {
    return NextResponse.json({ ok: false, error: "superpay-not-configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }

  const parsed = PaymentIframeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "invalid-payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const home = await getHomeBySlug(data.homeSlug);
  if (!home) {
    return NextResponse.json({ ok: false, error: "home-not-found" }, { status: 404 });
  }

  const amountEGP = await getAuthoritativeAmountEGP({
    home,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    guests: data.guests,
  });

  if (amountEGP <= 0) {
    return NextResponse.json({ ok: false, error: "invalid-amount" }, { status: 400 });
  }

  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const siteUrl =
    configuredSiteUrl &&
    !configuredSiteUrl.includes("localhost") &&
    !configuredSiteUrl.includes("127.0.0.1")
      ? configuredSiteUrl
      : req.nextUrl.origin;
  const refParam = encodeURIComponent(data.bookingRef);
  const successUrl = `${siteUrl}/${data.locale}/payment/superpay/success?ref=${refParam}`;
  const failureUrl = `${siteUrl}/${data.locale}/payment/superpay/failure?ref=${refParam}`;
  const refundUrl = `${siteUrl}/api/payments/superpay/notify`;

  try {
    const payment = await createSuperPayIframeUrl({
      merchantOrderId: data.bookingRef,
      amountEGP,
      clientId: data.guest.email || data.guest.phone,
      locale: data.locale,
      successUrl,
      failureUrl,
      refundUrl,
    });

    return NextResponse.json({
      ok: true,
      ...payment,
    });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[superpay] iframe URL failed", err);
    }
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "superpay-error" },
      { status: 502 },
    );
  }
}

async function getAuthoritativeAmountEGP({
  home,
  checkIn,
  checkOut,
  guests,
}: {
  home: NonNullable<Awaited<ReturnType<typeof getHomeBySlug>>>;
  checkIn: string;
  checkOut: string;
  guests: number;
}) {
  const listingId = homeHostifyPrimaryId(home);
  if (HOSTIFY_AVAILABLE() && listingId) {
    try {
      const quote = await hostify.getPriceQuote({
        listingId,
        startDate: checkIn,
        endDate: checkOut,
        guests,
        includeFees: true,
      });

      if (quote.success && quote.price && quote.price.available !== false) {
        return Math.round((quote.price.total ?? quote.price.price ?? 0) * EGP_PER_USD);
      }
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.error("[superpay] Hostify quote failed, using local pricing", err);
      }
    }
  }

  const pricing = calcBookingPricing({
    checkIn: new Date(checkIn),
    checkOut: new Date(checkOut),
    nightlyEGP: home.pricing.nightlyEGP,
    weeklyDiscountPct: home.pricing.weeklyDiscountPct,
    monthlyDiscountPct: home.pricing.monthlyDiscountPct,
    cleaningFeeEGP: home.pricing.cleaningFeeEGP,
    otaPriceEGP: home.pricing.otaPriceEGP,
  });

  return pricing.totalEGP;
}
