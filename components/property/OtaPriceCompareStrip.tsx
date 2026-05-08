"use client";

import { useLocale, useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/Reveal";
import { useCurrency } from "@/lib/currency/context";
import { formatPrice } from "@/lib/utils/formatPrice";
import type { Home } from "@/lib/data/types";
import type { AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";

/**
 * The wedge — direct vs OTA price banner. Travelholic's primary conversion lever.
 * Shows when a home has `pricing.otaPriceEGP` set.
 */
export function OtaPriceCompareStrip({
  home,
  nights,
  className,
}: {
  home: Home;
  nights?: number;
  className?: string;
}) {
  const t = useTranslations("homeDetail.ota");
  const locale = useLocale() as AppLocale;
  const { currency } = useCurrency();

  if (!home.pricing.otaPriceEGP) return null;

  const direct = home.pricing.nightlyEGP;
  const ota = home.pricing.otaPriceEGP;
  const savingsPerNight = Math.max(0, ota - direct);
  const effectiveNights = Math.max(1, nights ?? 1);
  const totalSavings = savingsPerNight * effectiveNights;
  const otaPercent = Math.round(((ota - direct) / direct) * 100);

  return (
    <Reveal>
      <div
        className={cn(
          "rounded-3xl bg-butter ring-1 ring-butter-300 p-5 sm:p-7",
          className,
        )}
      >
        <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/70">
          {t("title")}
        </p>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-3 items-end">
          <div>
            <p className="text-xs uppercase tracking-eyebrow text-navy/65 font-medium">
              {t("directLabel")}
            </p>
            <p className="mt-2 flex items-baseline gap-2">
              <span className="text-h2-mobile lg:text-h3 font-semibold text-navy tabular-nums">
                {formatPrice(direct, currency, locale)}
              </span>
              <span className="text-xs text-navy/55">{t("perNight")}</span>
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-eyebrow text-navy/55 font-medium">
              {t("otaLabel")}
            </p>
            <p className="mt-2 flex items-baseline gap-2">
              <span className="text-lg font-medium text-navy/55 tabular-nums line-through">
                {formatPrice(ota, currency, locale)}
              </span>
              <span className="text-xs text-navy/45">+{otaPercent}%</span>
            </p>
          </div>

          <div className="rounded-2xl bg-navy text-stone p-4">
            <p className="text-xs uppercase tracking-eyebrow text-stone/65 font-medium">
              {t("savings")}
            </p>
            <p className="mt-1 text-lg lg:text-xl font-semibold tabular-nums">
              {formatPrice(totalSavings, currency, locale)}
            </p>
            {nights && nights > 1 ? (
              <p className="mt-1 text-[11px] text-stone/65">
                {t("totalSavings", {
                  amount: formatPrice(totalSavings, currency, locale),
                  nights,
                })}
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-stone/65">
                {formatPrice(savingsPerNight, currency, locale)} {t("perNight")}
              </p>
            )}
          </div>
        </div>

        <p className="mt-4 text-[11px] text-navy/45">
          {t("footnote", { date: new Date().toISOString().slice(0, 10) })}
        </p>
      </div>
    </Reveal>
  );
}
