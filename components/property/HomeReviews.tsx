"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import type { Home } from "@/lib/data/types";
import type { AppLocale } from "@/i18n/routing";

const PREVIEW = 4;

export function HomeReviews({ home }: { home: Home }) {
  const t = useTranslations("homeDetail.reviews");
  const tBreakdown = useTranslations("homeDetail.reviews.breakdown");
  const tSource = useTranslations("homeDetail.reviews.source");
  const locale = useLocale() as AppLocale;
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? home.reviews : home.reviews.slice(0, PREVIEW);

  // Compute illustrative score breakdown rounded around the headline rating
  const breakdown: { key: "cleanliness" | "comfort" | "communication" | "location" | "value"; score: number }[] = [
    { key: "cleanliness", score: clamp(home.rating + 0.05, 4.0, 5.0) },
    { key: "comfort", score: clamp(home.rating - 0.04, 4.0, 5.0) },
    { key: "communication", score: clamp(home.rating + 0.03, 4.0, 5.0) },
    { key: "location", score: clamp(home.rating - 0.02, 4.0, 5.0) },
    { key: "value", score: clamp(home.rating - 0.06, 4.0, 5.0) },
  ];

  return (
    <section>
      <header className="flex flex-wrap items-end justify-between gap-4 mb-10">
        <div>
          <h3 className="text-h3-mobile lg:text-h3 leading-tight tracking-tight-heading font-medium">
            {t("title")}
          </h3>
          <p className="mt-3 inline-flex items-baseline gap-2 text-base">
            <Star className="h-5 w-5 fill-butter text-butter relative top-0.5" />
            <span className="text-h4 font-semibold tabular-nums">
              {home.rating.toFixed(1)}
            </span>
            <span className="text-navy/55">·</span>
            <span className="text-navy/65">
              {t("scoreLabel", { rating: "", count: home.reviewCount }).replace(/^\s*·\s*/, "")}
            </span>
          </p>
        </div>
      </header>

      {/* Score breakdown */}
      <Reveal>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-5 mb-12">
          {breakdown.map((row) => (
            <li key={row.key}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-navy/70">{tBreakdown(row.key)}</span>
                <span className="font-medium tabular-nums">{row.score.toFixed(1)}</span>
              </div>
              <div className="mt-2 h-1 rounded-full bg-navy/10 overflow-hidden">
                <div
                  className="h-full bg-navy"
                  style={{ width: `${(row.score / 5) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </Reveal>

      {/* Review cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {visible.map((review, i) => (
          <Reveal key={i} delay={i * 0.04}>
            <article className="rounded-2xl bg-stone-100 ring-1 ring-navy/8 p-6">
              <header className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-base font-medium text-navy">{review.guestName}</p>
                  <p className="text-xs text-navy/55 mt-0.5">
                    {review.guestCountry} · {new Date(review.date).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", { month: "short", year: "numeric" })}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-navy/65 shrink-0">
                  <Star className="h-3 w-3 fill-butter text-butter" />
                  {review.rating.toFixed(1)}
                </span>
              </header>
              <p className="text-sm text-navy/85 leading-relaxed text-pretty">
                <span className="text-butter font-artistic italic me-1">“</span>
                {review.text[locale]}
                <span className="text-butter font-artistic italic ms-1">”</span>
              </p>
              <p className="mt-4 text-[10px] uppercase tracking-eyebrow text-navy/50">
                {tSource(review.source)}
              </p>
            </article>
          </Reveal>
        ))}
      </div>

      {home.reviews.length > PREVIEW ? (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-navy/20 px-5 py-2.5 text-sm font-medium hover:bg-navy/5 transition-colors"
        >
          {t("viewMore")}
        </button>
      ) : null}
    </section>
  );
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
