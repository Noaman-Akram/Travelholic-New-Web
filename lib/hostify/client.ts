import "server-only";

import type {
  HostifyListingResponse,
  HostifyListingsResponse,
  HostifyPriceResponse,
} from "./types";

const DEFAULT_BASE = "https://api-rms.hostify.com";

function getBase(): string {
  return (process.env.HOSTIFY_API_BASE ?? DEFAULT_BASE).replace(/\/$/, "");
}

function getKey(): string | null {
  const key = process.env.HOSTIFY_API_KEY?.trim();
  return key && key.length > 0 ? key : null;
}

export const HOSTIFY_AVAILABLE = (): boolean => getKey() !== null;

export class HostifyError extends Error {
  status: number;
  body: string;
  constructor(status: number, body: string) {
    super(`Hostify API ${status}: ${body.slice(0, 120)}`);
    this.status = status;
    this.body = body;
  }
}

type FetchOptions = {
  /** Next.js incremental cache. Default: revalidate every hour. */
  revalidate?: number | false;
  /** Override default tags for revalidation. */
  tags?: string[];
};

async function request<T>(
  path: string,
  searchParams?: Record<string, string | number | undefined>,
  options: FetchOptions = {},
): Promise<T> {
  const key = getKey();
  if (!key) {
    throw new HostifyError(0, "HOSTIFY_API_KEY not set");
  }
  const url = new URL(getBase() + path);
  if (searchParams) {
    for (const [k, v] of Object.entries(searchParams)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }

  const next: { revalidate?: number; tags?: string[] } = {};
  if (options.revalidate === undefined) next.revalidate = 3600;
  else if (options.revalidate !== false) next.revalidate = options.revalidate;
  if (options.tags) next.tags = options.tags;

  const res = await fetch(url, {
    headers: {
      "x-api-key": key,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    next,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new HostifyError(res.status, text);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new HostifyError(res.status, `Bad JSON: ${text.slice(0, 80)}`);
  }
}

export const hostify = {
  /**
   * List all listings. Hostify caps per_page at 200 implicitly; we paginate
   * until exhausted.
   */
  async listAllListings(): Promise<HostifyListingsResponse["listings"]> {
    const perPage = 200;
    let page = 1;
    const all: HostifyListingsResponse["listings"] = [];
    // Safety cap: 50 pages = 10k listings. We'll never hit this.
    for (let i = 0; i < 50; i += 1) {
      const data = await request<HostifyListingsResponse>(
        "/listings",
        { page, per_page: perPage },
        { revalidate: 3600, tags: ["hostify-listings"] },
      );
      const items = data.listings ?? [];
      all.push(...items);
      const total = data.total ?? all.length;
      if (all.length >= total) break;
      const next = data.next_page ?? page + 1;
      if (!next || next === page) break;
      page = next;
    }
    return all;
  },

  /**
   * Single listing with related objects (photos, amenities, rooms, description).
   */
  async getListing(id: number): Promise<HostifyListingResponse> {
    return request<HostifyListingResponse>(
      `/listings/${id}`,
      { include_related_objects: 1 },
      { revalidate: 3600, tags: ["hostify-listings", `hostify-listing-${id}`] },
    );
  },

  /**
   * Real-time price quote for given dates + guests. Not cached (stale prices
   * are worse than no quote).
   */
  async getPriceQuote(args: {
    listingId: number;
    startDate: string;
    endDate: string;
    guests: number;
    pets?: number;
    includeFees?: boolean;
  }): Promise<HostifyPriceResponse> {
    return request<HostifyPriceResponse>(
      "/listings/price",
      {
        listing_id: args.listingId,
        start_date: args.startDate,
        end_date: args.endDate,
        guests: args.guests,
        pets: args.pets ?? 0,
        include_fees: args.includeFees ? 1 : 0,
      },
      { revalidate: false },
    );
  },
};
