import "server-only";

import { hostify, HOSTIFY_AVAILABLE, HostifyError } from "./client";
import { groupAndTransform, enrichWithFullListing } from "./transform";
import type { Home } from "@/lib/data/types";

type HomeWithHostify = Home & {
  hostifyIds?: number[];
  hostifyPrimaryId?: number;
  hostifyUnitCount?: number;
};

/**
 * Fetch every listing from Hostify and transform them into deduplicated
 * Travelholic Home entries. Used by the listing index, destination detail,
 * featured grid, and similar-homes strip.
 */
export async function fetchHostifyHomes(): Promise<Home[]> {
  if (!HOSTIFY_AVAILABLE()) return [];
  try {
    const listings = await hostify.listAllListings();
    if (listings.length === 0) return [];
    return groupAndTransform(listings);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(
        "[hostify] failed to fetch listings:",
        err instanceof HostifyError ? `${err.status} ${err.message}` : err,
      );
    }
    return [];
  }
}

/**
 * Fetch a single listing's full payload (photos, amenities, description) and
 * return a Home enriched with that data.
 */
export async function fetchHostifyHomeBySlug(slug: string): Promise<Home | null> {
  if (!HOSTIFY_AVAILABLE()) return null;
  const all = await fetchHostifyHomes();
  const base = all.find((h) => h.slug === slug) as HomeWithHostify | undefined;
  if (!base) return null;
  const primaryId = base.hostifyPrimaryId;
  if (!primaryId) return base;
  try {
    const full = await hostify.getListing(primaryId);
    return enrichWithFullListing(base, full, base.gallery[0]?.src ?? null);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("[hostify] failed to enrich listing:", err);
    }
    return base;
  }
}
