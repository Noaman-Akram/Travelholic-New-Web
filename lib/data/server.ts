import "server-only";

import { homes as homesFallback } from "./homes";
import { fetchHostifyHomes, fetchHostifyHomeBySlug } from "@/lib/hostify/listings";
import type { Home } from "./types";

export { homesFallback };

/**
 * Returns all homes, preferring live Hostify data when available, falling
 * back to the bundled mock dataset when the API key is unset or the call
 * fails. Cached for 1 hour via Next's fetch cache.
 */
export async function getAllHomes(): Promise<Home[]> {
  const live = await fetchHostifyHomes();
  return live.length > 0 ? live : homesFallback;
}

export async function getHomeBySlug(slug: string): Promise<Home | undefined> {
  const live = await fetchHostifyHomeBySlug(slug);
  if (live) return live;
  return homesFallback.find((h) => h.slug === slug);
}

export async function getHomesByDestination(
  destinationSlug: string,
): Promise<Home[]> {
  const all = await getAllHomes();
  return all.filter((h) => h.destinationSlug === destinationSlug);
}

export async function getFeaturedHomes(limit = 8): Promise<Home[]> {
  const all = await getAllHomes();
  return [...all]
    .sort((a, b) => {
      const ra = a.rating || 0;
      const rb = b.rating || 0;
      if (rb !== ra) return rb - ra;
      const ca = a.reviewCount || 0;
      const cb = b.reviewCount || 0;
      if (cb !== ca) return cb - ca;
      return a.pricing.nightlyEGP - b.pricing.nightlyEGP;
    })
    .slice(0, limit);
}

/**
 * Returns the live count of homes per destination, derived from grouped
 * Hostify listings.
 */
export async function getDestinationListingCounts(): Promise<Map<string, number>> {
  const all = await getAllHomes();
  const counts = new Map<string, number>();
  for (const h of all) {
    counts.set(h.destinationSlug, (counts.get(h.destinationSlug) ?? 0) + 1);
  }
  return counts;
}
