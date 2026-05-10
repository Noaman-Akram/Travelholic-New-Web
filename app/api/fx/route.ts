import { NextResponse } from "next/server";
import { getEgpPerUsd } from "@/lib/fx/rates";

/**
 * Debug + monitoring endpoint. Returns the current EGP/USD rate, the
 * source it came from, and how stale the data is. Safe to expose — it's
 * just a public exchange rate.
 */
export async function GET() {
  const fx = await getEgpPerUsd();
  return NextResponse.json({
    pair: "USD/EGP",
    rate: fx.rate,
    source: fx.source,
    fetchedAt: fx.fetchedAt,
    cachedSince: fx.cachedSince,
  });
}
