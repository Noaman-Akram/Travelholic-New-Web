import type {
  HostifyListingFull,
  HostifyListingResponse,
  HostifyListingSummary,
  HostifyPhoto,
} from "./types";
import type {
  Bilingual,
  BilingualArr,
  Home,
  HomeStatus,
  HomeType,
  AmenityKey,
} from "@/lib/data/types";
import { mapHostifyAmenities } from "./amenityMap";

/**
 * Hostify tag → Travelholic destination slug.
 * REVIEW: confirm `South Academy` mapping with operator. For now treated
 * as a New Cairo locale near the AUC corridor; user previously called this
 * "Near CFC".
 */
const TAG_TO_DESTINATION: Record<string, string> = {
  louts: "lotus",
  lotus: "lotus",
  "near mivida": "lotus",
  auc: "auc",
  "south academy": "near-cfc",
  "near cfc": "near-cfc",
  cfc: "near-cfc",
  "90st": "ninetieth-street",
  "90 st": "ninetieth-street",
  "90th": "ninetieth-street",
  "90th street": "ninetieth-street",
  "gg buildings": "gg-buildings",
  "gg b2": "gg-buildings",
  "gg villas": "gg-villas",
  "gg nomads": "nomads",
  nomads: "nomads",
  "golden gates": "golden-gates", // parent area — we'll prefer a more specific tag if one exists
};

const EGP_PER_USD = (() => {
  const raw = process.env.NEXT_PUBLIC_EGP_PER_USD;
  if (!raw) return 50;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 50;
})();

function usdToEgp(usd: number | null | undefined): number {
  return Math.max(0, Math.round((usd ?? 0) * EGP_PER_USD));
}

function tagsToDestinationSlug(tags: string | null | undefined): string {
  if (!tags) return "lotus";
  const list = tags
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  // Prefer the most specific tag
  for (const t of list) {
    const slug = TAG_TO_DESTINATION[t];
    if (slug && slug !== "golden-gates") return slug;
  }
  // Fall back to area-level
  for (const t of list) {
    if (TAG_TO_DESTINATION[t]) return TAG_TO_DESTINATION[t];
  }
  // Heuristic last-ditch
  if (/golden/i.test(tags)) return "gg-buildings";
  if (/cairo/i.test(tags)) return "lotus";
  return "lotus";
}

const BRAND_SUFFIX_REGEX = /\s*[,|·\-—]?\s*(?:by\s+travelholic|travelholic)\s*$/i;
const UNIT_PREFIX_REGEX = /^\d+\.\d+\.\(?\d+\)?\s+/;

/**
 * "1.1.(104) The Calm Corner1BR W/Balcony" → "The Calm Corner1BR W/Balcony"
 * "The Calm Corner1BR W/Balcony, Lotus, By Travelholic" → "The Calm Corner — 1BR w/ Balcony"
 */
export function cleanTitle(rawName: string): string {
  let name = rawName.replace(UNIT_PREFIX_REGEX, "").replace(BRAND_SUFFIX_REGEX, "");
  // Strip trailing district fragment ", Lotus" or ", New Cairo"
  name = name.replace(/,\s*(?:lotus|louts|new cairo|auc|gg|golden gates|nomads|south academy)[^,]*$/gi, "");
  name = name.replace(/,\s*(?:lotus|louts|new cairo|auc|gg|golden gates|nomads|south academy)/gi, "");
  // Light typography: separate squashed digits "Corner1BR" → "Corner 1BR"
  name = name.replace(/([a-z])(\d)/gi, "$1 $2");
  return name.trim().replace(/\s+/g, " ");
}

const SLUG_NON_ALNUM = /[^a-z0-9]+/g;

export function makeHomeSlug(rawName: string): string {
  const cleaned = cleanTitle(rawName).toLowerCase();
  const slug = cleaned
    .replace(SLUG_NON_ALNUM, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || "home";
}

function inferHomeType(listing: HostifyListingSummary): HomeType {
  const bedrooms = listing.bedrooms ?? 0;
  const name = listing.name?.toLowerCase() ?? "";
  if (/penthouse/.test(name)) return "penthouse";
  if (bedrooms >= 3) return "3br";
  if (bedrooms === 2) return "2br";
  if (bedrooms === 1) return "1br";
  return "studio";
}

function inferStatus(listing: HostifyListingSummary): HomeStatus {
  if (listing.is_listed === 1) return "available";
  // Hostify is_listed=0 means "not on connected OTAs" — that's still bookable
  // direct, so we surface as available unless explicitly unavailable.
  return "available";
}

function gallery(photos: HostifyPhoto[] | undefined, fallback: string | null): { src: string; alt: string }[] {
  const list = (photos ?? [])
    .map((p) => ({
      src: p.original_file ?? p.thumbnail_file ?? "",
      alt: p.description ?? "Travelholic home",
    }))
    .filter((g) => g.src);
  if (list.length === 0 && fallback) {
    return [{ src: fallback, alt: "Travelholic home" }];
  }
  return list;
}

function bilingual(en: string, ar?: string | null): Bilingual {
  return { en: en, ar: (ar && ar.trim()) || en };
}

function bilingualArr(items: string[]): BilingualArr {
  return { en: items, ar: items };
}

function highlights(listing: HostifyListingFull): BilingualArr {
  const out: string[] = [];
  if ((listing.bedrooms ?? 0) === 0) out.push("Studio layout");
  else if ((listing.bedrooms ?? 0) >= 1) out.push(`${listing.bedrooms} bedroom${(listing.bedrooms ?? 0) > 1 ? "s" : ""}`);
  if (listing.amenities?.some((a) => /smart.*lock|keypad/i.test(a.name))) {
    out.push("Smart check-in");
  }
  if (listing.amenities?.some((a) => /wifi|wireless internet/i.test(a.name))) {
    out.push("Fast Wi-Fi");
  }
  if (listing.amenities?.some((a) => /balcony|patio/i.test(a.name))) {
    out.push("Balcony / patio");
  }
  if (listing.amenities?.some((a) => /workspace|laptop/i.test(a.name))) {
    out.push("Dedicated workspace");
  }
  return bilingualArr(out.slice(0, 5));
}

const FALLBACK_AMENITIES: AmenityKey[] = [
  "wifi",
  "ac",
  "kitchen",
  "linens",
  "cleaningService",
];

/**
 * Group multiple Hostify listings by their cleaned title and return one Home
 * per unique property. The first listing's id becomes the canonical
 * `hostifyId` (used for deep-linking to book.travelholiceg.com); the full set
 * of unit IDs is preserved in `hostifyIds`.
 */
export function groupAndTransform(listings: HostifyListingSummary[]): Home[] {
  const groups = new Map<string, HostifyListingSummary[]>();
  for (const l of listings) {
    const slug = makeHomeSlug(l.name ?? `listing-${l.id}`);
    const arr = groups.get(slug) ?? [];
    arr.push(l);
    groups.set(slug, arr);
  }

  const homes: Home[] = [];
  for (const [slug, group] of groups) {
    const head = group[0];
    if (!head) continue;
    homes.push(transformSummary(head, group, slug));
  }
  // Stable order: by destination then by price ascending
  return homes.sort((a, b) =>
    a.destinationSlug.localeCompare(b.destinationSlug) ||
    a.pricing.nightlyEGP - b.pricing.nightlyEGP,
  );
}

function transformSummary(
  head: HostifyListingSummary,
  group: HostifyListingSummary[],
  slug: string,
): Home {
  const cleanName = cleanTitle(head.name ?? "Travelholic home");
  const destinationSlug = tagsToDestinationSlug(head.tags);
  const usd = head.default_daily_price ?? 0;

  const home: Home = {
    slug,
    title: bilingual(cleanName),
    destinationSlug,
    type: inferHomeType(head),
    capacity: {
      guests: head.person_capacity ?? 2,
      bedrooms: head.bedrooms ?? 0,
      beds: head.beds ?? Math.max(1, head.bedrooms ?? 1),
      baths: head.bathrooms ?? 1,
    },
    pricing: {
      nightlyEGP: usdToEgp(usd),
      weeklyDiscountPct: head.weekly_price_factor
        ? Math.max(0, Math.round((1 - head.weekly_price_factor) * 100))
        : 8,
      monthlyDiscountPct: head.monthly_price_factor
        ? Math.max(0, Math.round((1 - head.monthly_price_factor) * 100))
        : 18,
      cleaningFeeEGP: usdToEgp(head.cleaning_fee ?? 0),
    },
    amenities: FALLBACK_AMENITIES,
    highlights: bilingualArr([
      head.bedrooms ? `${head.bedrooms}-bedroom home` : "Studio layout",
      "Smart check-in",
      "Fast Wi-Fi",
    ]),
    description: bilingual(
      `${cleanName} — a Travelholic home in ${head.city ?? "Cairo"}.`,
    ),
    gallery: head.thumbnail_file
      ? [{ src: head.thumbnail_file, alt: cleanName }]
      : [],
    houseRules: bilingualArr([
      "No smoking indoors",
      "Quiet hours 11 PM – 8 AM",
      "No parties",
    ]),
    nearbyPlaces: [],
    reviews: [],
    rating: 4.8,
    reviewCount: 0,
    smartCheckIn: true,
    instantBook: head.instant_booking === "everyone",
    coordinates: {
      lat: head.lat ?? 30.0444,
      lng: head.lng ?? 31.2357,
    },
    status: inferStatus(head),
  };

  // Attach the Hostify metadata via a non-typed extension. Consumers that
  // need it (`PropertyCard` deep-link, etc.) read via `(home as Home & { hostifyIds?: number[] })`.
  Object.assign(home, {
    hostifyIds: group.map((g) => g.id),
    hostifyPrimaryId: head.id,
    hostifyUnitCount: group.length,
  });

  return home;
}

/**
 * Enrich a Home with full listing details (description, photos, amenities,
 * rating). Used on the home detail page.
 */
export function enrichWithFullListing(
  base: Home,
  full: HostifyListingResponse,
  fallback: string | null,
): Home {
  const listing = full.listing;
  const photos = full.photos ?? [];
  const amenityNames = (full.amenities ?? []).map((a) => a.name);
  const mapped = mapHostifyAmenities(amenityNames);
  const desc = full.description ?? {};
  const summaryEn =
    desc.summary ||
    desc.description ||
    desc.space ||
    base.description.en;

  return {
    ...base,
    gallery: gallery(photos, fallback ?? base.gallery[0]?.src ?? null),
    amenities: mapped.length ? mapped : base.amenities,
    description: bilingual(summaryEn ?? "", desc.summary ?? base.description.ar),
    houseRules: desc.house_rules
      ? bilingualArr(
          desc.house_rules
            .split(/\n+/)
            .map((s) => s.replace(/^[\s-•·]+/, "").trim())
            .filter(Boolean)
            .slice(0, 8),
        )
      : base.houseRules,
    rating: full.rating?.rating ?? base.rating,
    reviewCount: full.rating?.reviews ?? base.reviewCount,
    highlights: highlights({ ...listing, photos, amenities: full.amenities, rooms: full.rooms, description: desc, rating: full.rating, reviews: full.reviews }),
    coordinates: {
      lat: listing.lat ?? base.coordinates.lat,
      lng: listing.lng ?? base.coordinates.lng,
    },
  };
}

/**
 * Public deep-link to book.travelholiceg.com for a given Home, prefilled
 * with dates + guests when known.
 */
export function bookingDeepLink(opts: {
  hostifyId: number;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}): string {
  const base = (
    process.env.NEXT_PUBLIC_BOOKING_SITE ?? "https://book.travelholiceg.com"
  ).replace(/\/$/, "");
  const params = new URLSearchParams();
  if (opts.guests) params.set("guests", String(opts.guests));
  if (opts.guests) params.set("adults", String(opts.guests));
  if (opts.checkIn) params.set("checkin", opts.checkIn);
  if (opts.checkOut) params.set("checkout", opts.checkOut);
  const qs = params.toString();
  return `${base}/listing/${opts.hostifyId}${qs ? `?${qs}` : ""}`;
}
