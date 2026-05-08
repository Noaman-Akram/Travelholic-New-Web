"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { PropertyCard } from "@/components/home-card/PropertyCard";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { homes, destinations } from "@/lib/data";
import type { AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";

export function FeaturedHomes() {
  const t = useTranslations("home.featured");
  const locale = useLocale() as AppLocale;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  // Take all homes that have OTA pricing (the savings story is the whole point) — fall back to top-rated otherwise.
  const featured = homes
    .filter((h) => h.pricing.otaPriceEGP)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 8);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    function update() {
      if (!el) return;
      setCanScrollPrev(el.scrollLeft > 4);
      setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  function scroll(direction: "prev" | "next") {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.85 * (direction === "next" ? 1 : -1);
    const adjusted = locale === "ar" ? -amount : amount;
    el.scrollBy({ left: adjusted, behavior: "smooth" });
  }

  return (
    <section className="relative bg-stone-100 py-20 lg:py-28">
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10">
        <Reveal as="header" className="mb-10 lg:mb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="max-w-3xl">
            <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55">
              {t("eyebrow")}
            </p>
            <h2 className="mt-3 text-h2-mobile lg:text-h2 leading-tight tracking-tight-heading font-medium text-balance">
              {t("title")}
            </h2>
            <p className="mt-5 max-w-2xl text-body-lg leading-relaxed text-navy/70 text-pretty">
              {t("subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/homes">{t("viewAll")}</Link>
            </Button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scroll("prev")}
                aria-label="Previous"
                disabled={!canScrollPrev}
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-full border border-navy/20 bg-stone transition-opacity",
                  !canScrollPrev && "opacity-30",
                )}
              >
                <ChevronLeft className="h-4 w-4 rtl:scale-x-[-1]" />
              </button>
              <button
                type="button"
                onClick={() => scroll("next")}
                aria-label="Next"
                disabled={!canScrollNext}
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-full border border-navy/20 bg-stone transition-opacity",
                  !canScrollNext && "opacity-30",
                )}
              >
                <ChevronRight className="h-4 w-4 rtl:scale-x-[-1]" />
              </button>
            </div>
          </div>
        </Reveal>
      </div>

      <div
        ref={scrollerRef}
        className="no-scrollbar flex gap-5 lg:gap-6 overflow-x-auto px-5 sm:px-6 lg:px-8 xl:px-10 snap-x snap-mandatory"
      >
        {featured.map((home) => {
          const dest = destinations.find((d) => d.slug === home.destinationSlug);
          return (
            <div
              key={home.slug}
              className="snap-start shrink-0 w-[85vw] sm:w-[55vw] md:w-[42vw] lg:w-[30vw] xl:w-[24vw] max-w-md"
            >
              <PropertyCard home={home} destinationName={dest?.name} />
            </div>
          );
        })}
        <div className="shrink-0 w-1" aria-hidden="true" />
      </div>
    </section>
  );
}
