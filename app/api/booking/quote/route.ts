import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { hostify, HOSTIFY_AVAILABLE, HostifyError } from "@/lib/hostify/client";
import { getHomeBySlug } from "@/lib/data/server";
import { homeHostifyPrimaryId } from "@/lib/data";

const QuoteSchema = z.object({
  homeSlug: z.string().min(1),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.number().int().min(1).max(20),
  pets: z.number().int().min(0).max(5).optional(),
});

const EGP_PER_USD = (() => {
  const raw = process.env.NEXT_PUBLIC_EGP_PER_USD;
  if (!raw) return 50;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 50;
})();

/**
 * Live price quote from Hostify for the chosen dates + guests.
 * GET /api/booking/quote?slug=...&ci=...&co=...&g=2
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const parsed = QuoteSchema.safeParse({
    homeSlug: sp.get("slug"),
    checkIn: sp.get("ci"),
    checkOut: sp.get("co"),
    guests: Number(sp.get("g")),
    pets: sp.get("pets") ? Number(sp.get("pets")) : undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "invalid-params", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (!HOSTIFY_AVAILABLE()) {
    return NextResponse.json({ ok: false, error: "hostify-not-configured" }, { status: 503 });
  }

  try {
    const home = await getHomeBySlug(parsed.data.homeSlug);
    const listingId = home ? homeHostifyPrimaryId(home) : undefined;
    if (!home || !listingId) {
      return NextResponse.json({ ok: false, error: "home-not-found" }, { status: 404 });
    }

    const res = await hostify.getPriceQuote({
      listingId,
      startDate: parsed.data.checkIn,
      endDate: parsed.data.checkOut,
      guests: parsed.data.guests,
      pets: parsed.data.pets,
      includeFees: true,
    });

    if (!res.success || !res.price) {
      return NextResponse.json(
        { ok: false, error: "no-quote", message: "Hostify returned no quote" },
        { status: 502 },
      );
    }

    const p = res.price;
    return NextResponse.json({
      ok: true,
      available: p.available !== false,
      currency: p.iso_code ?? "USD",
      nights: p.nights ?? 0,
      basePriceUsd: p.base_price ?? 0,
      cleaningFeeUsd: p.cleaning_fee ?? 0,
      totalUsd: p.total ?? p.price ?? 0,
      // EGP equivalents using our static FX
      basePriceEgp: Math.round((p.base_price ?? 0) * EGP_PER_USD),
      cleaningFeeEgp: Math.round((p.cleaning_fee ?? 0) * EGP_PER_USD),
      totalEgp: Math.round((p.total ?? p.price ?? 0) * EGP_PER_USD),
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof HostifyError ? `hostify-${err.status}` : "hostify-error",
      },
      { status: 502 },
    );
  }
}
