"use client";

import { useLocale, useTranslations } from "next-intl";
import { destinations } from "@/lib/data";
import type { AmenityKey } from "@/lib/data/types";
import type { AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";
import { useHomesFilters, type HomesFilters as HomesFiltersState } from "./useHomesFilters";

const COMMON_AMENITIES: AmenityKey[] = [
  "wifi",
  "workspace",
  "smartLock",
  "kitchen",
  "pool",
  "gym",
  "parking",
  "balcony",
  "petFriendly",
  "ac",
];

export function HomesFilters({ inSheet = false }: { inSheet?: boolean }) {
  const t = useTranslations("homes.filters");
  const tAmenities = useTranslations("homeDetail.amenityLabels");
  const locale = useLocale() as AppLocale;
  const { filters, setFilter, clearAll, isFiltering, priceBounds } = useHomesFilters();

  const labelClass = "text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55";
  const containerClass = inSheet
    ? "space-y-7"
    : "space-y-7";

  return (
    <div className={containerClass}>
      <header className="flex items-center justify-between">
        <h2 className="text-h4-mobile lg:text-h4 font-medium leading-tight">{t("title")}</h2>
        {isFiltering ? (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs underline text-navy/65 hover:text-navy"
          >
            {t("clearAll")}
          </button>
        ) : null}
      </header>

      {/* Destinations */}
      <fieldset>
        <legend className={labelClass}>{t("destinations")}</legend>
        <ul className="mt-3 space-y-2">
          {destinations.map((d) => (
            <li key={d.slug}>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.destinations.includes(d.slug)}
                  onChange={(e) =>
                    setFilter(
                      "destinations",
                      e.target.checked
                        ? [...filters.destinations, d.slug]
                        : filters.destinations.filter((s) => s !== d.slug),
                    )
                  }
                  className="h-4 w-4 accent-navy"
                />
                <span className="text-sm text-navy/85">
                  {d.name[locale]}
                  <span className="text-navy/45 ms-1">· {d.areaName[locale]}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      {/* Dates */}
      <fieldset>
        <legend className={labelClass}>{t("dates")}</legend>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <label className="rounded-xl ring-1 ring-navy/15 px-3 py-2 cursor-pointer">
            <span className="block text-[10px] uppercase tracking-eyebrow text-navy/55">
              {t("checkIn")}
            </span>
            <input
              type="date"
              value={filters.checkIn ?? ""}
              onChange={(e) => setFilter("checkIn", e.target.value || null)}
              className="mt-1 w-full bg-transparent text-sm focus:outline-none"
            />
          </label>
          <label className="rounded-xl ring-1 ring-navy/15 px-3 py-2 cursor-pointer">
            <span className="block text-[10px] uppercase tracking-eyebrow text-navy/55">
              {t("checkOut")}
            </span>
            <input
              type="date"
              value={filters.checkOut ?? ""}
              min={filters.checkIn ?? undefined}
              onChange={(e) => setFilter("checkOut", e.target.value || null)}
              className="mt-1 w-full bg-transparent text-sm focus:outline-none"
            />
          </label>
        </div>
      </fieldset>

      {/* Guests + bedrooms */}
      <div className="grid grid-cols-2 gap-3">
        <fieldset>
          <legend className={labelClass}>{t("guests")}</legend>
          <select
            value={filters.guests ?? ""}
            onChange={(e) => setFilter("guests", e.target.value ? Number(e.target.value) : null)}
            className="mt-3 w-full rounded-xl ring-1 ring-navy/15 bg-transparent px-3 py-2.5 text-sm focus:outline-none focus:ring-navy"
          >
            <option value="">—</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </select>
        </fieldset>
        <fieldset>
          <legend className={labelClass}>{t("bedrooms")}</legend>
          <select
            value={filters.minBedrooms ?? ""}
            onChange={(e) =>
              setFilter("minBedrooms", e.target.value !== "" ? Number(e.target.value) : null)
            }
            className="mt-3 w-full rounded-xl ring-1 ring-navy/15 bg-transparent px-3 py-2.5 text-sm focus:outline-none focus:ring-navy"
          >
            <option value="">{t("bedroomsAny")}</option>
            <option value="0">Studio+</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
        </fieldset>
      </div>

      {/* Price */}
      <fieldset>
        <legend className={labelClass}>{t("priceRange")} · EGP</legend>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="rounded-xl ring-1 ring-navy/15 px-3 py-2">
            <span className="block text-[10px] uppercase tracking-eyebrow text-navy/55">
              {t("priceFrom")}
            </span>
            <input
              type="number"
              min={priceBounds.min}
              max={filters.priceMax}
              step={100}
              value={filters.priceMin}
              onChange={(e) =>
                setFilter("priceMin", clampPrice(Number(e.target.value), filters, priceBounds))
              }
              className="mt-1 w-full bg-transparent text-sm focus:outline-none tabular-nums"
            />
          </label>
          <label className="rounded-xl ring-1 ring-navy/15 px-3 py-2">
            <span className="block text-[10px] uppercase tracking-eyebrow text-navy/55">
              {t("priceTo")}
            </span>
            <input
              type="number"
              min={filters.priceMin}
              max={priceBounds.max}
              step={100}
              value={filters.priceMax}
              onChange={(e) =>
                setFilter(
                  "priceMax",
                  clampPrice(Number(e.target.value), filters, priceBounds, "max"),
                )
              }
              className="mt-1 w-full bg-transparent text-sm focus:outline-none tabular-nums"
            />
          </label>
        </div>
      </fieldset>

      {/* Amenities */}
      <fieldset>
        <legend className={labelClass}>{t("amenities")}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {COMMON_AMENITIES.map((key) => {
            const active = filters.amenities.includes(key);
            return (
              <label
                key={key}
                className={cn(
                  "cursor-pointer rounded-full px-3 py-1.5 text-xs uppercase tracking-eyebrow transition-colors",
                  active
                    ? "bg-navy text-stone"
                    : "bg-stone-100 text-navy ring-1 ring-navy/15 hover:bg-navy/5",
                )}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={active}
                  onChange={(e) =>
                    setFilter(
                      "amenities",
                      e.target.checked
                        ? [...filters.amenities, key]
                        : filters.amenities.filter((k) => k !== key),
                    )
                  }
                />
                {tAmenities(key)}
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Instant book */}
      <label className="flex items-center justify-between cursor-pointer">
        <span className="text-sm font-medium text-navy">{t("instantBook")}</span>
        <span className="relative inline-flex h-6 w-11 items-center">
          <input
            type="checkbox"
            checked={filters.instantBook}
            onChange={(e) => setFilter("instantBook", e.target.checked)}
            className="peer sr-only"
          />
          <span className="absolute inset-0 rounded-full bg-navy/15 peer-checked:bg-navy transition-colors" />
          <span className="absolute h-4 w-4 rounded-full bg-stone start-1 transition-transform peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5" />
        </span>
      </label>
    </div>
  );
}

function clampPrice(
  value: number,
  current: HomesFiltersState,
  bounds: { min: number; max: number },
  side: "min" | "max" = "min",
): number {
  if (Number.isNaN(value)) return side === "min" ? bounds.min : bounds.max;
  if (side === "min") {
    return Math.max(bounds.min, Math.min(value, current.priceMax - 100));
  }
  return Math.min(bounds.max, Math.max(value, current.priceMin + 100));
}
