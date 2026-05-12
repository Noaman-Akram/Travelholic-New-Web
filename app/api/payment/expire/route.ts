import { NextResponse, type NextRequest } from "next/server";
import { hostify, HostifyError, HOSTIFY_AVAILABLE } from "@/lib/hostify/client";

/**
 * Safety-net sweeper. The webhook is the primary lifecycle driver, but
 * if SuperPay never delivers (network hiccup, customer closes browser
 * on the iframe and walks away, etc.), Hostify is left holding the
 * pending reservation forever — and the dates remain unsellable to
 * other guests.
 *
 * This route lists pending reservations made through the `Travelholic
 * Direct` source and cancels any older than the stale threshold.
 *
 * Triggered by Vercel cron (vercel.json) every 5 minutes. Idempotent —
 * a stale reservation that's been cancelled in a previous sweep is a
 * no-op on retry.
 *
 * Auth: Vercel calls cron routes with an `Authorization: Bearer
 * $CRON_SECRET` header when CRON_SECRET is set. We honour the standard
 * pattern. Manual invocation is allowed in non-production for local
 * testing.
 */

const STALE_THRESHOLD_MINUTES = 15;
const SWEEP_PAGE_LIMIT = 50;

export async function GET(req: NextRequest) {
  // Production gate: require the Vercel cron bearer token. In dev we
  // skip the check so a curl from the host is enough to test.
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && process.env.NODE_ENV === "production") {
    const provided =
      req.headers.get("authorization") || req.headers.get("Authorization");
    if (provided !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
  }

  if (!HOSTIFY_AVAILABLE()) {
    return NextResponse.json(
      { ok: false, error: "hostify-not-configured" },
      { status: 503 },
    );
  }

  const now = Date.now();
  const threshold = now - STALE_THRESHOLD_MINUTES * 60 * 1000;
  const swept: number[] = [];
  const skipped: number[] = [];
  const errors: { id: number; error: string }[] = [];

  try {
    // We only care about pending reservations; Hostify's list endpoint
    // takes status as a filter. Single page is plenty given a 15 min
    // window (volume should never exceed a handful per sweep).
    const list = await hostify.listReservations({
      status: "pending",
      perPage: SWEEP_PAGE_LIMIT,
    });

    for (const r of list.reservations ?? []) {
      // Only sweep reservations we ourselves created — leaves Airbnb /
      // Booking.com pending blocks alone.
      const isOurs = (r.source ?? "").toLowerCase().includes("travelholic");
      if (!isOurs) {
        skipped.push(r.id);
        continue;
      }
      const createdAt = r.created_at ? Date.parse(r.created_at) : NaN;
      const isStale = Number.isFinite(createdAt) && createdAt < threshold;
      if (!isStale) {
        skipped.push(r.id);
        continue;
      }

      try {
        await hostify.updateReservation(r.id, {
          status: "cancelled_by_host",
          note: "Auto-cancelled: no payment received within 15 minutes.",
        });
        swept.push(r.id);
      } catch (err) {
        const detail =
          err instanceof HostifyError ? `${err.status}: ${err.body.slice(0, 80)}` : "unknown";
        errors.push({ id: r.id, error: detail });
      }
    }
  } catch (err) {
    const code = err instanceof HostifyError ? `hostify-${err.status}` : "hostify-error";
    return NextResponse.json({ ok: false, error: code }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    swept,
    skipped: skipped.length,
    errors,
    thresholdMinutes: STALE_THRESHOLD_MINUTES,
    ranAt: new Date(now).toISOString(),
  });
}
