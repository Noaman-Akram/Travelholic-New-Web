import type { AmenityKey } from "@/lib/data/types";

/**
 * Maps Hostify amenity name strings to our AmenityKey enum.
 * Best-effort match — anything unrecognized is dropped silently.
 *
 * Hostify amenity names are human-readable strings, so we match
 * by lowercase keyword presence rather than exact equality.
 */
const RULES: { match: (name: string) => boolean; key: AmenityKey }[] = [
  { match: (n) => /\bwifi\b|wireless internet|free.*internet/.test(n), key: "wifi" },
  { match: (n) => /smart.*lock|keypad|smartlock|self check[- ]?in|lockbox/.test(n), key: "smartLock" },
  { match: (n) => /workspace|office|laptop friendly|dedicated workspace/.test(n), key: "workspace" },
  { match: (n) => /kitchen$|full kitchen|kitchenette/.test(n), key: "kitchen" },
  { match: (n) => /air condition|^ac$|air conditioner/.test(n), key: "ac" },
  { match: (n) => /\btv\b|television|cable tv|smart tv/.test(n), key: "tv" },
  { match: (n) => /\bwasher\b|washing machine/.test(n), key: "washer" },
  { match: (n) => /\bdryer\b/.test(n), key: "dryer" },
  { match: (n) => /\bpool\b|swimming pool/.test(n), key: "pool" },
  { match: (n) => /\bgym\b|fitness/.test(n), key: "gym" },
  { match: (n) => /\bparking\b/.test(n), key: "parking" },
  { match: (n) => /balcony|patio|terrace|veranda/.test(n), key: "balcony" },
  { match: (n) => /sea ?view|ocean view/.test(n), key: "seaView" },
  { match: (n) => /pet[s ]/.test(n), key: "petFriendly" },
  { match: (n) => /elevator/.test(n), key: "elevator" },
  { match: (n) => /security|24[- ]hour security|cctv/.test(n), key: "security" },
  { match: (n) => /cleaning service|housekeeping|cleaning before checkout/.test(n), key: "cleaningService" },
  { match: (n) => /linen|bed linens|bedding/.test(n), key: "linens" },
  { match: (n) => /coffee|espresso/.test(n), key: "coffee" },
  { match: (n) => /\biron\b/.test(n), key: "iron" },
];

export function mapHostifyAmenity(name: string | null | undefined): AmenityKey | null {
  if (!name) return null;
  const n = name.toLowerCase().trim();
  for (const rule of RULES) {
    if (rule.match(n)) return rule.key;
  }
  return null;
}

export function mapHostifyAmenities(names: (string | null | undefined)[]): AmenityKey[] {
  const seen = new Set<AmenityKey>();
  for (const name of names) {
    const key = mapHostifyAmenity(name);
    if (key) seen.add(key);
  }
  return Array.from(seen);
}
