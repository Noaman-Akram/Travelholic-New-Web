"use client";

import { useTranslations } from "next-intl";
import { Grid2x2, Map, SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useHomesFilters } from "./useHomesFilters";
import { HomesFilters } from "./HomesFilters";
import { cn } from "@/lib/utils/cn";

export function HomesTopBar() {
  const t = useTranslations("homes");
  const { results, view, setView, sort, setSort } = useHomesFilters();

  return (
    <div className="sticky top-16 lg:top-20 z-20 bg-stone/95 backdrop-blur-md border-b border-navy/10">
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Mobile filter trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="lg:hidden inline-flex items-center gap-2 rounded-full border border-navy/20 bg-stone px-4 py-2 text-sm font-medium hover:bg-navy/5 transition-colors"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {t("filters.title")}
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[88svh] rounded-t-3xl overflow-y-auto pb-24">
              <SheetTitle className="sr-only">{t("filters.title")}</SheetTitle>
              <HomesFilters inSheet />
              <SheetClose asChild>
                <Button variant="primary" size="lg" className="fixed inset-x-5 bottom-5 sm:inset-x-8">
                  {t("filters.showResults", { count: results.length })}
                </Button>
              </SheetClose>
            </SheetContent>
          </Sheet>

          <p className="text-sm text-navy/70">
            {t("results.count", { count: results.length })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            aria-label={t("sort.label")}
            value={sort}
            onChange={(e) =>
              setSort(e.target.value as Parameters<typeof setSort>[0])
            }
            className="rounded-full bg-stone ring-1 ring-navy/15 px-4 py-2 text-sm font-medium hover:bg-navy/5 transition-colors focus:outline-none focus:ring-navy"
          >
            <option value="recommended">{t("sort.recommended")}</option>
            <option value="priceLow">{t("sort.priceLow")}</option>
            <option value="priceHigh">{t("sort.priceHigh")}</option>
            <option value="ratingHigh">{t("sort.ratingHigh")}</option>
            <option value="newest">{t("sort.newest")}</option>
          </select>

          <div role="tablist" className="hidden sm:flex items-center rounded-full bg-stone-100 ring-1 ring-navy/10 p-1">
            <button
              role="tab"
              aria-selected={view === "grid"}
              type="button"
              onClick={() => setView("grid")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-eyebrow transition-colors",
                view === "grid" ? "bg-navy text-stone" : "text-navy/65 hover:text-navy",
              )}
            >
              <Grid2x2 className="h-3.5 w-3.5" />
              {t("view.grid")}
            </button>
            <button
              role="tab"
              aria-selected={view === "map"}
              type="button"
              onClick={() => setView("map")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-eyebrow transition-colors",
                view === "map" ? "bg-navy text-stone" : "text-navy/65 hover:text-navy",
              )}
            >
              <Map className="h-3.5 w-3.5" />
              {t("view.map")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
