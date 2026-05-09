"use client";

import { useCallback, useMemo, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useHomesData } from "./HomesContext";
import type { AmenityKey, Home } from "@/lib/data/types";

export type HomesView = "grid" | "map";
export type HomesSort = "recommended" | "priceLow" | "priceHigh" | "ratingHigh" | "newest";

export type HomesFilters = {
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

const PRICE_DEFAULT_MIN = 1500;
const PRICE_DEFAULT_MAX = 13000;

const DEFAULT_FILTERS: HomesFilters = {
  destinations: [],
  checkIn: null,
  checkOut: null,
  guests: null,
  minBedrooms: null,
  priceMin: PRICE_DEFAULT_MIN,
  priceMax: PRICE_DEFAULT_MAX,
  amenities: [],
  instantBook: false,
};

export const PRICE_BOUNDS = {
  min: PRICE_DEFAULT_MIN,
  max: PRICE_DEFAULT_MAX,
};

export function useHomesFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const homes = useHomesData();

  const filters = useMemo<HomesFilters>(() => {
    const dest = searchParams.get("dest");
    const ci = searchParams.get("ci");
    const co = searchParams.get("co");
    const g = searchParams.get("g");
    const br = searchParams.get("br");
    const p = searchParams.get("p");
    const a = searchParams.get("a");
    const ib = searchParams.get("ib");

    let priceMin = PRICE_DEFAULT_MIN;
    let priceMax = PRICE_DEFAULT_MAX;
    if (p) {
      const [pMin, pMax] = p.split("-");
      const parsedMin = pMin ? Number(pMin) : NaN;
      const parsedMax = pMax ? Number(pMax) : NaN;
      if (!Number.isNaN(parsedMin)) priceMin = parsedMin;
      if (!Number.isNaN(parsedMax)) priceMax = parsedMax;
    }

    return {
      destinations: dest ? dest.split(",").filter(Boolean) : [],
      checkIn: ci || null,
      checkOut: co || null,
      guests: g ? Number(g) : null,
      minBedrooms: br ? Number(br) : null,
      priceMin,
      priceMax,
      amenities: a ? (a.split(",").filter(Boolean) as AmenityKey[]) : [],
      instantBook: ib === "1",
    };
  }, [searchParams]);

  const view = (searchParams.get("view") as HomesView) || "grid";
  const sort = (searchParams.get("sort") as HomesSort) || "recommended";

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
          case "destinations":
          case "amenities": {
            const arr = value as string[];
            if (arr.length === 0) next.delete(paramKey(key));
            else next.set(paramKey(key), arr.join(","));
            break;
          }
          case "checkIn":
            if (value) next.set("ci", String(value));
            else next.delete("ci");
            break;
          case "checkOut":
            if (value) next.set("co", String(value));
            else next.delete("co");
            break;
          case "guests":
            if (value) next.set("g", String(value));
            else next.delete("g");
            break;
          case "minBedrooms":
            if (value !== null && value !== undefined) next.set("br", String(value));
            else next.delete("br");
            break;
          case "priceMin":
          case "priceMax": {
            const min = key === "priceMin" ? Number(value) : filters.priceMin;
            const max = key === "priceMax" ? Number(value) : filters.priceMax;
            if (min === PRICE_DEFAULT_MIN && max === PRICE_DEFAULT_MAX) {
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
    [setParams, filters.priceMin, filters.priceMax],
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
      ["dest", "ci", "co", "g", "br", "p", "a", "ib", "sort", "view"].forEach((k) => sp.delete(k));
    });
  }, [setParams]);

  const results = useMemo(() => applyFilters(homes, filters, sort), [homes, filters, sort]);

  const isFiltering =
    filters.destinations.length > 0 ||
    filters.guests !== null ||
    filters.minBedrooms !== null ||
    filters.priceMin !== PRICE_DEFAULT_MIN ||
    filters.priceMax !== PRICE_DEFAULT_MAX ||
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
    DEFAULTS: DEFAULT_FILTERS,
  };
}

function paramKey(key: keyof HomesFilters): string {
  switch (key) {
    case "destinations":
      return "dest";
    case "amenities":
      return "a";
    default:
      return key;
  }
}

function applyFilters(items: Home[], filters: HomesFilters, sort: HomesSort): Home[] {
  const filtered = items.filter((h) => {
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
