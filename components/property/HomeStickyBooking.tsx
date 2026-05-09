"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { differenceInCalendarDays } from "date-fns";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/lib/currency/context";
import { formatPrice } from "@/lib/utils/formatPrice";
import { calcBookingPricing } from "@/lib/utils/bookingMath";
import { BookingDialog } from "./BookingDialog";
import { bookingDeepLink } from "@/lib/hostify/transform";
import type { Home } from "@/lib/data/types";
import type { AppLocale } from "@/i18n/routing";

type HomeWithHostify = Home & { hostifyPrimaryId?: number };

function formatISODate(date: Date): string {
  return date.toISOString().split("T")[0] ?? "";
}

export function HomeStickyBooking({ home }: { home: Home }) {
  const t = useTranslations("homeDetail.panel");
  const tCommon = useTranslations("common");
  const locale = useLocale() as AppLocale;
  const { currency } = useCurrency();

  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const threeNights = new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000);

  const [checkIn, setCheckIn] = useState<string>(formatISODate(tomorrow));
  const [checkOut, setCheckOut] = useState<string>(formatISODate(threeNights));
  const [guests, setGuests] = useState<number>(2);
  const [dialogOpen, setDialogOpen] = useState(false);

  const pricing = useMemo(() => {
    if (!checkIn || !checkOut) return null;
    const ci = new Date(checkIn);
    const co = new Date(checkOut);
    if (differenceInCalendarDays(co, ci) <= 0) return null;
    return calcBookingPricing({
      checkIn: ci,
      checkOut: co,
      nightlyEGP: home.pricing.nightlyEGP,
      weeklyDiscountPct: home.pricing.weeklyDiscountPct,
      monthlyDiscountPct: home.pricing.monthlyDiscountPct,
      cleaningFeeEGP: home.pricing.cleaningFeeEGP,
      otaPriceEGP: home.pricing.otaPriceEGP,
    });
  }, [checkIn, checkOut, home.pricing]);

  const labelTone = "text-[10px] uppercase tracking-eyebrow text-navy/55 font-medium";
  const cellClass = "px-4 py-3.5";

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim();
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        `Hi Travelholic — interested in ${home.title.en}, ${checkIn} to ${checkOut}, ${guests} guests.`,
      )}`
    : undefined;

  return (
    <>
      <aside className="rounded-3xl bg-stone shadow-editorial-lg ring-1 ring-navy/10 p-6 lg:p-7">
        {/* Headline price */}
        <div className="flex items-baseline justify-between gap-3 pb-5 border-b border-navy/10">
          <p className="flex items-baseline gap-2">
            <span className="text-h3-mobile lg:text-h3 font-semibold tabular-nums">
              {formatPrice(home.pricing.nightlyEGP, currency, locale)}
            </span>
            <span className="text-sm text-navy/55">{t("perNight")}</span>
          </p>
          {home.pricing.otaPriceEGP ? (
            <span className="text-xs text-navy/45 line-through tabular-nums">
              {formatPrice(home.pricing.otaPriceEGP, currency, locale)}
            </span>
          ) : null}
        </div>

        {/* Date + guest fields */}
        <div className="mt-5 rounded-2xl ring-1 ring-navy/10 overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-navy/10 rtl:divide-x-reverse">
            <label className={cellClass} htmlFor={`hb-ci-${home.slug}`}>
              <span className={labelTone}>{t("perNight") /* placeholder */ ? "" : ""}</span>
              <span className={labelTone}>Check in</span>
              <input
                id={`hb-ci-${home.slug}`}
                type="date"
                value={checkIn}
                min={formatISODate(today)}
                onChange={(e) => setCheckIn(e.target.value)}
                className="mt-1 w-full bg-transparent text-sm text-navy focus:outline-none"
              />
            </label>
            <label className={cellClass} htmlFor={`hb-co-${home.slug}`}>
              <span className={labelTone}>Check out</span>
              <input
                id={`hb-co-${home.slug}`}
                type="date"
                value={checkOut}
                min={checkIn || formatISODate(today)}
                onChange={(e) => setCheckOut(e.target.value)}
                className="mt-1 w-full bg-transparent text-sm text-navy focus:outline-none"
              />
            </label>
          </div>
          <div className={`${cellClass} border-t border-navy/10`}>
            <p className={labelTone}>Guests</p>
            <div className="mt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setGuests((v) => Math.max(1, v - 1))}
                className="grid h-7 w-7 place-items-center rounded-full bg-navy/5 hover:bg-navy/10 transition-colors disabled:opacity-30"
                disabled={guests <= 1}
                aria-label="Remove a guest"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="text-sm font-medium tabular-nums">
                {tCommon("guests", { count: guests })}
              </span>
              <button
                type="button"
                onClick={() => setGuests((v) => Math.min(home.capacity.guests, v + 1))}
                className="grid h-7 w-7 place-items-center rounded-full bg-navy/5 hover:bg-navy/10 transition-colors disabled:opacity-30"
                disabled={guests >= home.capacity.guests}
                aria-label="Add a guest"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Pricing breakdown */}
        {pricing ? (
          <div className="mt-5 space-y-2 text-sm">
            <Row
              label={t("subtotal", { nights: pricing.nights })}
              value={formatPrice(pricing.subtotalEGP, currency, locale)}
            />
            {pricing.appliedDiscountKind !== "none" ? (
              <Row
                label={
                  pricing.appliedDiscountKind === "monthly"
                    ? t("monthlyDiscount", { percent: home.pricing.monthlyDiscountPct })
                    : t("weeklyDiscount", { percent: home.pricing.weeklyDiscountPct })
                }
                value={`− ${formatPrice(pricing.discountEGP, currency, locale)}`}
                muted
              />
            ) : null}
            <Row
              label={t("cleaningFee")}
              value={formatPrice(pricing.cleaningFeeEGP, currency, locale)}
              muted
            />
            <div className="border-t border-navy/10 pt-3 mt-3 flex items-baseline justify-between font-medium">
              <span>{t("total")}</span>
              <span className="text-base tabular-nums">
                {formatPrice(pricing.totalEGP, currency, locale)}
              </span>
            </div>
            {pricing.savingsVsOtaEGP ? (
              <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-butter px-3 py-1.5 text-[11px] uppercase tracking-eyebrow text-navy">
                {t("savesYou", {
                  amount: formatPrice(pricing.savingsVsOtaEGP, currency, locale),
                })}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-5 text-sm text-navy/55">{t("selectDates")}</p>
        )}

        {/* CTAs */}
        <div className="mt-6 space-y-2">
          {(() => {
            const hostifyId = (home as HomeWithHostify).hostifyPrimaryId;
            if (hostifyId) {
              const href = bookingDeepLink({
                hostifyId,
                checkIn,
                checkOut,
                guests,
              });
              return (
                <Button
                  asChild
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    {t("bookDirect")}
                  </a>
                </Button>
              );
            }
            return (
              <Button
                type="button"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={!pricing}
                onClick={() => setDialogOpen(true)}
              >
                {t("bookDirect")}
              </Button>
            );
          })()}

          {whatsappHref ? (
            <Button asChild variant="ghost" size="lg" className="w-full">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                {t("viaWhatsapp")}
              </a>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="lg"
              className="w-full opacity-60 cursor-not-allowed"
              aria-disabled
              onClick={(e) => e.preventDefault()}
            >
              {t("viaWhatsapp")}
            </Button>
          )}
        </div>

        <p className="mt-4 text-center text-[11px] text-navy/45">{t("noPaymentNow")}</p>
      </aside>

      {pricing ? (
        <BookingDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          home={home}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={guests}
          pricing={pricing}
        />
      ) : null}
    </>
  );
}

function Row({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <p className={`flex items-baseline justify-between ${muted ? "text-navy/65" : ""}`}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </p>
  );
}
