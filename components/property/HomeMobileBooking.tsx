"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCurrency } from "@/lib/currency/context";
import { formatPrice } from "@/lib/utils/formatPrice";
import { HomeStickyBooking } from "./HomeStickyBooking";
import type { Home } from "@/lib/data/types";
import type { AppLocale } from "@/i18n/routing";

/**
 * Mobile-only floating bottom bar that opens a full-screen Sheet
 * containing the same HomeStickyBooking widget used on desktop.
 */
export function HomeMobileBooking({ home }: { home: Home }) {
  const t = useTranslations("homeDetail.mobileBar");
  const tPanel = useTranslations("homeDetail.panel");
  const locale = useLocale() as AppLocale;
  const { currency } = useCurrency();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-30 bg-stone/95 backdrop-blur-md border-t border-navy/10 px-5 py-3 flex items-center justify-between gap-3 shadow-[0_-8px_24px_-12px_rgba(0,39,62,0.18)]">
        <div className="flex flex-col leading-tight">
          <p className="text-xs uppercase tracking-eyebrow text-navy/55">{t("from")}</p>
          <p className="flex items-baseline gap-1.5">
            <span className="text-base font-semibold tabular-nums">
              {formatPrice(home.pricing.nightlyEGP, currency, locale)}
            </span>
            <span className="text-xs text-navy/55">{tPanel("perNight")}</span>
          </p>
        </div>

        <SheetTrigger asChild>
          <button
            type="button"
            className="rounded-full bg-navy text-stone px-6 py-3 text-sm font-medium transition-colors hover:bg-navy-700"
          >
            {t("reserve")}
          </button>
        </SheetTrigger>
      </div>

      <SheetContent
        side="bottom"
        className="h-[92svh] rounded-t-3xl overflow-y-auto"
      >
        <SheetTitle className="sr-only">{tPanel("bookDirect")}</SheetTitle>
        <div className="pt-2">
          <HomeStickyBooking home={home} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
