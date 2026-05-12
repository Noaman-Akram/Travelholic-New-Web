import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { hostify, HOSTIFY_AVAILABLE, HostifyError } from "@/lib/hostify/client";
import { getHomeBySlug } from "@/lib/data/server";
import { homeHostifyPrimaryId } from "@/lib/data";
import { getEgpPerUsd } from "@/lib/fx/rates";

const QuoteSchema = z.object({
  homeSlug: z.string().min(1),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.number().int().min(1).max(20),
  pets: z.number().int().min(0).max(5).optional(),
});

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

    // Hostify uses `{ success: false, error: "..." }` to convey two
    // different things:
    //   (a) hard API failures (auth, listing-not-found, bad params, etc.)
    //   (b) "the chosen dates aren't available" — a normal business
    //       response we should NOT treat as a 502, because the booking
    //       widget needs to react ("try different dates") instead of
    //       showing "live quote unavailable".
    if (!res.success) {
      const rawError = typeof (res as { error?: unknown }).error === "string"
        ? ((res as { error: string }).error)
        : "";
      const isUnavailable = /not\s+available|unavailable|blocked|booked/i.test(
        rawError,
      );
      if (isUnavailable) {
        return NextResponse.json(
          {
            ok: true,
            available: false,
            reason: "dates-unavailable",
            message: rawError || "These dates are not available",
          },
          { status: 200 },
        );
      }
      return NextResponse.json(
        {
          ok: false,
          error: "no-quote",
          message: rawError || "Hostify returned no quote",
        },
        { status: 502 },
      );
    }
    if (!res.price) {
      return NextResponse.json(
        { ok: false, error: "no-quote", message: "Hostify returned no price" },
        { status: 502 },
      );
    }

    const p = res.price;
    const fx = await getEgpPerUsd();
    return NextResponse.json({
      ok: true,
      available: p.available !== false,
      currency: p.iso_code ?? "USD",
      nights: p.nights ?? 0,
      basePriceUsd: p.base_price ?? 0,
      cleaningFeeUsd: p.cleaning_fee ?? 0,
      totalUsd: p.total ?? p.price ?? 0,
      // EGP equivalents using the live FX rate
      basePriceEgp: Math.round((p.base_price ?? 0) * fx.rate),
      cleaningFeeEgp: Math.round((p.cleaning_fee ?? 0) * fx.rate),
      totalEgp: Math.round((p.total ?? p.price ?? 0) * fx.rate),
      fx: { rate: fx.rate, source: fx.source, fetchedAt: fx.fetchedAt },
    });
  } catch (err) {
    // Hostify communicates "dates not available" as HTTP 400 with a
    // JSON body like { success: false, error: "The period is not
    // available" }. Our request<> helper throws HostifyError on non-2xx
    // status, so we parse the body here and downgrade to the
    // "available: false" UX path when applicable.
    if (err instanceof HostifyError) {
      let parsed: { success?: boolean; error?: string } | null = null;
      try {
        parsed = JSON.parse(err.body);
      } catch {
        // body isn't JSON — fall through to generic error response
      }
      const rawError = typeof parsed?.error === "string" ? parsed.error : "";
      const isUnavailable = /not\s+available|unavailable|blocked|booked/i.test(
        rawError,
      );
      if (isUnavailable) {
        return NextResponse.json(
          {
            ok: true,
            available: false,
            reason: "dates-unavailable",
            message: rawError,
          },
          { status: 200 },
        );
      }
      return NextResponse.json(
        {
          ok: false,
          error: `hostify-${err.status}`,
          message: rawError || undefined,
        },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { ok: false, error: "hostify-error" },
      { status: 502 },
    );
  }
}
