"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useCurrency } from "@/lib/currency/context";
import { formatPrice } from "@/lib/utils/formatPrice";
import { cn } from "@/lib/utils/cn";
import type { Destination } from "@/lib/data/types";
import type { AppLocale } from "@/i18n/routing";

export function DestinationCard({
  destination,
  size = "md",
  className,
}: {
  destination: Destination;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const t = useTranslations("destinations");
  const locale = useLocale() as AppLocale;
  const { currency } = useCurrency();

  const aspectClass = {
    sm: "aspect-[4/3]",
    md: "aspect-[5/4]",
    lg: "aspect-[3/4] lg:aspect-[5/6]",
  }[size];

  const titleSizeClass = {
    sm: "text-h4-mobile lg:text-h4",
    md: "text-h3-mobile lg:text-h3",
    lg: "text-h2-mobile lg:text-h2",
  }[size];

  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className={cn(
        "group relative block overflow-hidden rounded-3xl bg-navy/5",
        aspectClass,
        className,
      )}
    >
      <Image
        src={destination.heroImage}
        alt={destination.name[locale]}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/30 to-transparent" />

      <div className="relative z-10 flex h-full flex-col justify-end p-6 lg:p-8 text-stone">
        <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-stone/75">
          {destination.areaName[locale]}
        </p>
        <h3
          className={cn(
            "mt-2 leading-tight tracking-tight-heading font-medium text-balance",
            titleSizeClass,
          )}
        >
          {destination.name[locale]}
        </h3>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="text-sm text-stone/85">
            <p>{t("homesIn", { count: destination.homeCount })}</p>
            <p className="text-xs text-stone/65 mt-1">
              {t("from")}{" "}
              {formatPrice(destination.startingNightlyEGP, currency, locale)}
            </p>
          </div>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone/15 backdrop-blur transition-transform duration-300 ease-out-expo group-hover:scale-110 group-hover:bg-butter group-hover:text-navy">
            <ArrowUpRight className="h-4 w-4 rtl:scale-x-[-1]" />
          </span>
        </div>
      </div>
    </Link>
  );
}
