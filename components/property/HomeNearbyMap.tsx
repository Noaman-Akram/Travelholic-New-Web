"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import {
  Coffee,
  UtensilsCrossed,
  Train,
  Waves,
  Building2,
  Cross,
  type LucideIcon,
} from "lucide-react";
import type { Home } from "@/lib/data/types";

const SingleMap = dynamic(() => import("./SingleHomeMap").then((m) => m.SingleHomeMap), {
  ssr: false,
  loading: () => <div className="h-[360px] lg:h-[460px] rounded-3xl bg-stone-200 animate-pulse" />,
});

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  cafe: Coffee,
  restaurant: UtensilsCrossed,
  metro: Train,
  beach: Waves,
  mall: Building2,
  hospital: Cross,
};

export function HomeNearbyMap({ home }: { home: Home }) {
  const t = useTranslations("homeDetail.nearby");
  const tCategories = useTranslations("homeDetail.nearbyCategories");

  return (
    <section>
      <h3 className="text-h3-mobile lg:text-h3 leading-tight tracking-tight-heading font-medium">
        {t("title")}
      </h3>
      <p className="mt-3 max-w-xl text-body text-navy/70">{t("subtitle")}</p>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <SingleMap home={home} />
        </div>
        <ul className="lg:col-span-2 space-y-3">
          {home.nearbyPlaces.map((place) => {
            const Icon = CATEGORY_ICONS[place.category] ?? Building2;
            return (
              <li
                key={`${place.name}-${place.distanceKm}`}
                className="flex items-center justify-between gap-4 rounded-2xl bg-stone-100 ring-1 ring-navy/8 px-4 py-3.5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="h-4 w-4 text-navy/70 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-navy truncate">{place.name}</p>
                    <p className="text-[11px] uppercase tracking-eyebrow text-navy/50">
                      {tCategories(place.category)}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-navy/65 tabular-nums shrink-0">
                  {t("kmAway", { km: place.distanceKm.toFixed(1) })}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
