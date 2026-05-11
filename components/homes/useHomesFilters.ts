"use client";

import { useCallback, useMemo, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { destinations } from "@/lib/data";
import { useHomesData } from "./HomesContext";
import type { AmenityKey, Home } from "@/lib/data/types";

export type HomesView = "grid" | "map";
export type HomesSort = "recommended" | "priceLow" | "priceHigh" | "ratingHigh" | "newest";

export type HomesFilters = {
  query: string;
  destinations: string[];
  checkIn: string | null;
  checkOut: string | null;
  guests: number | null;
  minBedrooms: number | null;
  priceMin: number;
  priceMax: number;
  amenities: AmenityKey[];
  instantBook: boolean;
};

const PRICE_FALLBACK_MIN = 1000;
const PRICE_FALLBACK_MAX = 13000;

function computePriceBounds(homes: Home[]): { min: number; max: number } {
  if (homes.length === 0) {
    return { min: PRICE_FALLBACK_MIN, max: PRICE_FALLBACK_MAX };
  }
  let lo = Infinity;
  let hi = -Infinity;
  for (const h of homes) {
    const p = h.pricing.nightlyEGP;
    if (p < lo) lo = p;
    if (p > hi) hi = p;
  }
  return {
    min: Math.max(0, Math.floor(lo / 100) * 100),
    max: Math.ceil(hi / 100) * 100,
  };
}

export const PRICE_BOUNDS = {
  min: PRICE_FALLBACK_MIN,
  max: PRICE_FALLBACK_MAX,
};

export function useHomesFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const homes = useHomesData();

  const priceBounds = useMemo(() => computePriceBounds(homes), [homes]);

  const filters = useMemo<HomesFilters>(() => {
    const q = searchParams.get("q") ?? "";
    const dest = searchParams.get("dest") ?? searchParams.get("destination");
    const ci = searchParams.get("ci") ?? searchParams.get("checkIn");
    const co = searchParams.get("co") ?? searchParams.get("checkOut");
    const g = searchParams.get("g") ?? searchParams.get("guests");
    const br = searchParams.get("br");
    const p = searchParams.get("p");
    const a = searchParams.get("a");
    const ib = searchParams.get("ib");

    let priceMin = priceBounds.min;
    let priceMax = priceBounds.max;
    if (p) {
      const [pMin, pMax] = p.split("-");
      const parsedMin = pMin ? Number(pMin) : NaN;
      const parsedMax = pMax ? Number(pMax) : NaN;
      if (!Number.isNaN(parsedMin)) priceMin = parsedMin;
      if (!Number.isNaN(parsedMax)) priceMax = parsedMax;
    }
    priceMin = clampNumber(priceMin, priceBounds.min, priceBounds.max);
    priceMax = clampNumber(priceMax, priceBounds.min, priceBounds.max);
    if (priceMin > priceMax) {
      [priceMin, priceMax] = [priceMax, priceMin];
    }

    const parsedGuests = parsePositiveInteger(g);
    const parsedBedrooms = parseNonNegativeInteger(br);

    return {
      query: q.trim(),
      destinations: dest ? dest.split(",").filter(Boolean) : [],
      checkIn: ci || null,
      checkOut: co || null,
      guests: parsedGuests,
      minBedrooms: parsedBedrooms,
      priceMin,
      priceMax,
      amenities: a ? (a.split(",").filter(Boolean) as AmenityKey[]) : [],
      instantBook: ib === "1",
    };
  }, [searchParams, priceBounds]);

  const rawView = searchParams.get("view");
  const view: HomesView = rawView === "map" ? "map" : "grid";
  const rawSort = searchParams.get("sort");
  const sort: HomesSort =
    rawSort === "priceLow" ||
    rawSort === "priceHigh" ||
    rawSort === "ratingHigh" ||
    rawSort === "newest"
      ? rawSort
      : "recommended";

  const setParams = useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      const next = new URLSearchParams(searchParams.toString());
      mutator(next);
      const query = next.toString();
      startTransition(() => {
        router.replace(query ? `?${query}` : "?", { scroll: false });
      });
    },
    [router, searchParams],
  );

  const setFilter = useCallback(
    <K extends keyof HomesFilters>(key: K, value: HomesFilters[K]) => {
      setParams((next) => {
        switch (key) {
          case "query": {
            const query = String(value).trim();
            if (query) next.set("q", query);
            else next.delete("q");
            break;
          }
          case "destinations":
          case "amenities": {
            const arr = value as string[];
            if (arr.length === 0) next.delete(paramKey(key));
            else next.set(paramKey(key), arr.join(","));
            if (key === "destinations") next.delete("destination");
            break;
          }
          case "checkIn":
            if (value) {
              const checkIn = String(value);
              next.set("ci", checkIn);
              next.delete("checkIn");
              if (filters.checkOut && filters.checkOut <= checkIn) {
                next.set("co", addDaysToISO(checkIn, 1));
                next.delete("checkOut");
              }
            } else {
              next.delete("ci");
              next.delete("checkIn");
            }
            break;
          case "checkOut":
            if (value) {
              const checkOut = String(value);
              next.set(
                "co",
                filters.checkIn && checkOut <= filters.checkIn
                  ? addDaysToISO(filters.checkIn, 1)
                  : checkOut,
              );
              next.delete("checkOut");
            } else {
              next.delete("co");
              next.delete("checkOut");
            }
            break;
          case "guests":
            if (value) next.set("g", String(value));
            else next.delete("g");
            next.delete("guests");
            break;
          case "minBedrooms":
            if (value !== null && value !== undefined) next.set("br", String(value));
            else next.delete("br");
            break;
          case "priceMin":
          case "priceMax": {
            const min = key === "priceMin" ? Number(value) : filters.priceMin;
            const max = key === "priceMax" ? Number(value) : filters.priceMax;
            if (min === priceBounds.min && max === priceBounds.max) {
              next.delete("p");
            } else {
              next.set("p", `${min}-${max}`);
            }
            break;
          }
          case "instantBook":
            if (value) next.set("ib", "1");
            else next.delete("ib");
            break;
        }
      });
    },
    [
      setParams,
      filters.checkIn,
      filters.checkOut,
      filters.priceMin,
      filters.priceMax,
      priceBounds.min,
      priceBounds.max,
    ],
  );

  const setView = useCallback(
    (next: HomesView) => {
      setParams((sp) => {
        if (next === "grid") sp.delete("view");
        else sp.set("view", next);
      });
    },
    [setParams],
  );

  const setSort = useCallback(
    (next: HomesSort) => {
      setParams((sp) => {
        if (next === "recommended") sp.delete("sort");
        else sp.set("sort", next);
      });
    },
    [setParams],
  );

  const clearAll = useCallback(() => {
    setParams((sp) => {
      [
        "q",
        "dest",
        "destination",
        "ci",
        "checkIn",
        "co",
        "checkOut",
        "g",
        "guests",
        "br",
        "p",
        "a",
        "ib",
        "sort",
        "view",
      ].forEach((k) => sp.delete(k));
    });
  }, [setParams]);

  const results = useMemo(() => applyFilters(homes, filters, sort), [homes, filters, sort]);

  const isFiltering =
    filters.query.length > 0 ||
    filters.destinations.length > 0 ||
    filters.guests !== null ||
    filters.minBedrooms !== null ||
    filters.priceMin !== priceBounds.min ||
    filters.priceMax !== priceBounds.max ||
    filters.amenities.length > 0 ||
    filters.instantBook ||
    !!filters.checkIn ||
    !!filters.checkOut;

  return {
    filters,
    setFilter,
    clearAll,
    results,
    view,
    setView,
    sort,
    setSort,
    isFiltering,
    priceBounds,
  };
}

function paramKey(key: keyof HomesFilters): string {
  switch (key) {
    case "query":
      return "q";
    case "destinations":
      return "dest";
    case "amenities":
      return "a";
    default:
      return key;
  }
}

function applyFilters(items: Home[], filters: HomesFilters, sort: HomesSort): Home[] {
  const query = normalizeSearch(filters.query);
  const filtered = items.filter((h) => {
    if (query && !homeMatchesQuery(h, query)) return false;
    if (filters.destinations.length && !filters.destinations.includes(h.destinationSlug)) return false;
    if (filters.guests && h.capacity.guests < filters.guests) return false;
    if (filters.minBedrooms !== null && h.capacity.bedrooms < filters.minBedrooms) return false;
    if (h.pricing.nightlyEGP < filters.priceMin || h.pricing.nightlyEGP > filters.priceMax) return false;
    if (filters.instantBook && !h.instantBook) return false;
    if (filters.amenities.length) {
      for (const need of filters.amenities) {
        if (!h.amenities.includes(need)) return false;
      }
    }
    return true;
  });

  switch (sort) {
    case "priceLow":
      return [...filtered].sort((a, b) => a.pricing.nightlyEGP - b.pricing.nightlyEGP);
    case "priceHigh":
      return [...filtered].sort((a, b) => b.pricing.nightlyEGP - a.pricing.nightlyEGP);
    case "ratingHigh":
      return [...filtered].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    case "newest":
      return filtered.slice().reverse();
    case "recommended":
    default:
      // Recommended = blend of OTA savings, rating, and instant-book.
      return [...filtered].sort((a, b) => {
        const aScore =
          (a.pricing.otaPriceEGP ? a.pricing.otaPriceEGP - a.pricing.nightlyEGP : 0) * 0.3 +
          a.rating * 200 +
          (a.instantBook ? 80 : 0);
        const bScore =
          (b.pricing.otaPriceEGP ? b.pricing.otaPriceEGP - b.pricing.nightlyEGP : 0) * 0.3 +
          b.rating * 200 +
          (b.instantBook ? 80 : 0);
        return bScore - aScore;
      });
  }
}

function parsePositiveInteger(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function parseNonNegativeInteger(value: string | null): number | null {
  if (!value && value !== "0") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

function clampNumber(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function homeMatchesQuery(home: Home, query: string): boolean {
  const destination = destinations.find((d) => d.slug === home.destinationSlug);
  const haystack = [
    home.slug,
    home.title.en,
    home.title.ar,
    home.description.en,
    home.description.ar,
    ...home.highlights.en,
    ...home.highlights.ar,
    destination?.slug,
    destination?.name.en,
    destination?.name.ar,
    destination?.areaName.en,
    destination?.areaName.ar,
    ...home.amenities,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();

  return haystack.includes(query);
}

function addDaysToISO(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
