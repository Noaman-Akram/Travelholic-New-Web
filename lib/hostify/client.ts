import "server-only";

import type {
  HostifyListingResponse,
  HostifyListingsResponse,
  HostifyPriceResponse,
} from "./types";

export type HostifyReservationCreateInput = {
  listingId: number;
  startDate: string;          // YYYY-MM-DD
  endDate: string;            // YYYY-MM-DD
  guests: number;
  pets?: number;
  name: string;
  email: string;
  phone: string;
  totalPrice: number;         // in listing's currency (USD for Travelholic)
  note?: string;
  source?: string;            // displayed in the host inbox
  status?: "accepted" | "pending";
};

export type HostifyReservationResponse = {
  success: boolean;
  reservation?: {
    id: number;
    confirmation_code?: string;
    status?: string;
    status_description?: string;
    checkIn?: string;
    checkOut?: string;
    nights?: number;
    guests?: number;
    payout_price?: number;
    base_price?: number;
    cleaning_fee?: number;
    subtotal?: number;
    currency?: string;
    listing_id?: number;
  };
  error?: string;
  message?: string;
};

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

async function postJson<T>(path: string, body: unknown): Promise<T> {
  return jsonRequest<T>("POST", path, body);
}

async function jsonRequest<T>(
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  body: unknown,
): Promise<T> {
  const key = getKey();
  if (!key) throw new HostifyError(0, "HOSTIFY_API_KEY not set");
  const res = await fetch(getBase() + path, {
    method,
    headers: {
      "x-api-key": key,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
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

  /**
   * Creates a reservation in Hostify. The booking shows up in the host's
   * inbox / dashboard; if `status` is omitted, Hostify defaults to
   * "accepted" per the API docs.
   */
  async createReservation(
    input: HostifyReservationCreateInput,
  ): Promise<HostifyReservationResponse> {
    return postJson<HostifyReservationResponse>("/reservations", {
      listing_id: input.listingId,
      start_date: input.startDate,
      end_date: input.endDate,
      guests: input.guests,
      pets: input.pets ?? 0,
      name: input.name,
      email: input.email,
      phone: input.phone,
      total_price: Math.round(input.totalPrice * 100) / 100,
      note: input.note ?? "",
      source: input.source ?? "Travelholic Direct",
      ...(input.status ? { status: input.status } : {}),
    });
  },

  /**
   * Fetches a single reservation by its numeric Hostify id. Not cached —
   * the payment webhook depends on a real-time read.
   */
  async getReservation(id: number): Promise<HostifyReservationResponse> {
    return request<HostifyReservationResponse>(
      `/reservations/${id}`,
      undefined,
      { revalidate: false },
    );
  },

  /**
   * Updates the status of a Hostify reservation. Allowed transitions
   * (verified via Hostify's own 400 error message — the docs portal is
   * gated, so this is the canonical list):
   *
   *   accepted
   *   cancelled_by_host
   *   cancelled_by_guest
   *   denied
   *   no_show
   *
   * Trying any other value returns HTTP 400 with a list of valid options.
   * Idempotent on Hostify's side — re-applying the same status is a no-op
   * but still returns 200.
   */
  async updateReservation(
    id: number,
    body: { status: HostifyReservationStatus; note?: string },
  ): Promise<HostifyReservationResponse> {
    return jsonRequest<HostifyReservationResponse>(
      "PUT",
      `/reservations/${id}`,
      body,
    );
  },

  /**
   * Lists reservations matching the given filters. Used by the expiry
   * sweeper cron to find pending reservations older than 15 minutes.
   * Hostify caps per_page implicitly; callers should paginate.
   */
  async listReservations(args: {
    status?: HostifyReservationStatus | "pending";
    page?: number;
    perPage?: number;
  } = {}): Promise<HostifyReservationListResponse> {
    return request<HostifyReservationListResponse>(
      "/reservations",
      {
        ...(args.status ? { status: args.status } : {}),
        page: args.page ?? 1,
        per_page: args.perPage ?? 50,
      },
      { revalidate: false },
    );
  },
};

export type HostifyReservationStatus =
  | "accepted"
  | "cancelled_by_host"
  | "cancelled_by_guest"
  | "denied"
  | "no_show";

export type HostifyReservationSummary = {
  id: number;
  confirmation_code: string;
  status: string;
  source: string | null;
  checkIn: string;
  checkOut: string;
  created_at?: string;
  // Plus many other fields we don't model — see Hostify docs.
};

export type HostifyReservationListResponse = {
  success: boolean;
  reservations: HostifyReservationSummary[];
  total?: number;
  next_page?: number | null;
};
