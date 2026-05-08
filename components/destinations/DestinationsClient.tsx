"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/Reveal";
import { DestinationCard } from "@/components/home-card/DestinationCard";
import { destinations } from "@/lib/data";
import { cn } from "@/lib/utils/cn";
import type { AreaSlug } from "@/lib/data/types";

const DestinationsMap = dynamic(
  () => import("./DestinationsMap").then((m) => m.DestinationsMap),
  { ssr: false, loading: () => <div className="h-[420px] lg:h-[560px] rounded-3xl bg-stone-200 animate-pulse" /> },
);

type Filter = "all" | AreaSlug;

export function DestinationsClient() {
  const t = useTranslations("destinations");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = filter === "all" ? destinations : destinations.filter((d) => d.area === filter);

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: t("filters.all") },
    { key: "new-cairo", label: t("filters.newCairo") },
    { key: "golden-gates", label: t("filters.goldenGates") },
  ];

  return (
    <>
      {/* Filter chips */}
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10 mt-12 mb-10">
        <Reveal>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55 me-3 hidden sm:inline">
              {t("filters.label")}
            </span>
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                aria-pressed={filter === f.key}
                className={cn(
                  "rounded-full px-4 py-2 text-xs uppercase tracking-eyebrow font-medium transition-colors duration-200 ease-out-expo",
                  filter === f.key
                    ? "bg-navy text-stone"
                    : "bg-stone border border-navy/20 text-navy hover:bg-navy/5",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </Reveal>
      </div>

      {/* Cards grid */}
      <section className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10 mb-20 lg:mb-28">
        <Reveal variant="stagger">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {filtered.map((d, i) => (
              <Reveal key={d.slug} delay={i * 0.04}>
                <DestinationCard destination={d} size="md" />
              </Reveal>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Map */}
      <section className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10 pb-24 lg:pb-32">
        <Reveal as="header" className="mb-8">
          <h2 className="text-h3-mobile lg:text-h3 leading-tight tracking-tight-heading font-medium">
            {t("mapTitle")}
          </h2>
        </Reveal>
        <Reveal>
          <DestinationsMap filtered={filtered} />
        </Reveal>
      </section>
    </>
  );
}
