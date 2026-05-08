"use client";

import Image from "next/image";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Heart, Star, Users, Bed, Bath } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/lib/currency/context";
import { formatPrice } from "@/lib/utils/formatPrice";
import { cn } from "@/lib/utils/cn";
import type { Home } from "@/lib/data/types";
import type { AppLocale } from "@/i18n/routing";

export function PropertyCard({
  home,
  destinationName,
  className,
}: {
  home: Home;
  destinationName?: { en: string; ar: string };
  className?: string;
}) {
  const t = useTranslations("common");
  const locale = useLocale() as AppLocale;
  const { currency } = useCurrency();
  const [hoverIndex, setHoverIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const images = home.gallery.slice(0, 4);
  const direct = formatPrice(home.pricing.nightlyEGP, currency, locale);
  const ota = home.pricing.otaPriceEGP
    ? formatPrice(home.pricing.otaPriceEGP, currency, locale)
    : null;
  const savings =
    home.pricing.otaPriceEGP &&
    home.pricing.otaPriceEGP > home.pricing.nightlyEGP
      ? home.pricing.otaPriceEGP - home.pricing.nightlyEGP
      : 0;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl bg-stone shadow-editorial transition-shadow duration-300 ease-out-expo hover:shadow-editorial-lg",
        className,
      )}
      onMouseEnter={() => setHoverIndex(1 % images.length)}
      onMouseLeave={() => setHoverIndex(0)}
    >
      <Link
        href={`/homes/${home.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-navy/10"
      >
        {images.map((image, index) => (
          <Image
            key={image.src}
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={cn(
              "object-cover transition-opacity duration-500 ease-out-expo",
              hoverIndex === index ? "opacity-100" : "opacity-0",
              index === 0 && hoverIndex === 0 && "opacity-100",
            )}
          />
        ))}

        <button
          type="button"
          aria-label="Favorite"
          aria-pressed={isFavorite}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsFavorite((v) => !v);
          }}
          className="absolute end-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-stone/90 backdrop-blur transition-transform hover:scale-110"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              isFavorite ? "fill-maroon text-maroon" : "text-navy",
            )}
          />
        </button>

        {savings > 0 ? (
          <div className="absolute start-4 top-4 rounded-full bg-butter px-3 py-1 text-[11px] font-medium uppercase tracking-eyebrow text-navy">
            {t("save")}{" "}
            {formatPrice(savings, currency, locale)} {t("vsAirbnb")}
          </div>
        ) : null}

        {home.status === "limited" ? (
          <div className="absolute bottom-4 start-4 rounded-full bg-navy/90 px-3 py-1 text-[11px] uppercase tracking-eyebrow text-stone">
            Limited
          </div>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {destinationName ? (
          <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55">
            {destinationName[locale]}
          </p>
        ) : null}
        <Link
          href={`/homes/${home.slug}`}
          className="mt-1.5 block text-h4-mobile lg:text-h4 font-medium leading-tight tracking-tight-heading text-balance hover:opacity-80 transition-opacity"
        >
          {home.title[locale]}
        </Link>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-navy/65">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {t("guests", { count: home.capacity.guests })}
          </span>
          <span className="inline-flex items-center gap-1">
            <Bed className="h-3.5 w-3.5" />
            {t("bedrooms", { count: home.capacity.bedrooms })}
          </span>
          <span className="inline-flex items-center gap-1">
            <Bath className="h-3.5 w-3.5" />
            {t("baths", { count: home.capacity.baths })}
          </span>
          <span className="inline-flex items-center gap-1 text-navy/80">
            <Star className="h-3.5 w-3.5 fill-butter text-butter" />
            {home.rating.toFixed(1)}
            <span className="text-navy/50">({home.reviewCount})</span>
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div className="flex flex-col">
            <p className="flex items-baseline gap-2">
              <span className="text-xl font-semibold text-navy">{direct}</span>
              <span className="text-xs text-navy/55">{t("perNight")}</span>
            </p>
            {ota ? (
              <p className="text-xs text-navy/45 line-through mt-0.5">
                {ota} {t("vsAirbnb")}
              </p>
            ) : null}
          </div>
          <Button asChild variant="primary" size="sm">
            <Link href={`/homes/${home.slug}`}>{t("bookDirect")}</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
