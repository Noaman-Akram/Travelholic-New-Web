"use client";

import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/Reveal";
import { PropertyCard } from "@/components/home-card/PropertyCard";
import { Button } from "@/components/ui/button";
import { destinations } from "@/lib/data";
import { useHomesFilters } from "./useHomesFilters";

export function HomesGrid() {
  const t = useTranslations("homes.results");
  const { results, isFiltering, clearAll } = useHomesFilters();

  if (results.length === 0) {
    return (
      <div className="text-center py-24 max-w-md mx-auto">
        <p className="text-h3-mobile lg:text-h3 leading-tight tracking-tight-heading font-medium">
          {t("empty")}
        </p>
        <p className="mt-3 text-body text-navy/65">{t("emptyBody")}</p>
        {isFiltering ? (
          <Button variant="primary" size="md" className="mt-6" onClick={clearAll}>
            {t("emptyCta")}
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
      {results.map((h, i) => {
        const dest = destinations.find((d) => d.slug === h.destinationSlug);
        return (
          <Reveal key={h.slug} delay={Math.min(i, 8) * 0.03}>
            <PropertyCard home={h} destinationName={dest?.name} />
          </Reveal>
        );
      })}
    </div>
  );
}
