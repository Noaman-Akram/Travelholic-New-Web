"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/Reveal";
import { StoryCard } from "@/components/home-card/StoryCard";
import { stories } from "@/lib/data";
import { cn } from "@/lib/utils/cn";
import type { StoryCategory } from "@/lib/data/types";

type Filter = "all" | StoryCategory;

const FILTER_KEYS: Filter[] = [
  "all",
  "neighborhood",
  "local-culture",
  "travel-tips",
  "inside-travelholic",
];

export function StoriesClient() {
  const t = useTranslations("stories.filters");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    return filter === "all" ? stories : stories.filter((s) => s.category === filter);
  }, [filter]);

  return (
    <section className="bg-stone pb-24 lg:pb-32">
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10">
        <Reveal>
          <div className="flex flex-wrap items-center gap-2 mb-12 lg:mb-16">
            {FILTER_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                aria-pressed={filter === key}
                className={cn(
                  "rounded-full px-4 py-2 text-xs uppercase tracking-eyebrow font-medium transition-colors duration-200 ease-out-expo",
                  filter === key
                    ? "bg-navy text-stone"
                    : "bg-stone border border-navy/20 text-navy hover:bg-navy/5",
                )}
              >
                {t(key)}
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal variant="stagger">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10">
            {filtered.map((s, i) => (
              <Reveal key={s.slug} delay={i * 0.04}>
                <StoryCard story={s} size="md" />
              </Reveal>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
