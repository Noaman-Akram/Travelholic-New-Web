"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Search, Minus, Plus } from "lucide-react";
import { destinations } from "@/lib/data";
import type { AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";

type Tone = "light" | "translucent";

export function BookingWidgetInline({
  tone = "translucent",
  className,
}: {
  tone?: Tone;
  className?: string;
}) {
  const t = useTranslations("booking");
  const locale = useLocale() as AppLocale;
  const router = useRouter();

  const [destination, setDestination] = useState<string>("");
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const [checkIn, setCheckIn] = useState<string>(formatISODate(today));
  const [checkOut, setCheckOut] = useState<string>(formatISODate(tomorrow));
  const [guests, setGuests] = useState<number>(2);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests) params.set("guests", String(guests));
    router.push(`/homes?${params.toString()}`);
  }

  const isLight = tone === "light";
  const fieldBg = isLight ? "bg-stone" : "bg-stone/95 backdrop-blur";
  const labelTone = "text-[10px] uppercase tracking-eyebrow text-navy/55 font-medium";

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "rounded-3xl shadow-editorial-lg ring-1 ring-navy/10 overflow-hidden",
        fieldBg,
        className,
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr_0.9fr_auto] divide-y lg:divide-y-0 lg:divide-x divide-navy/10 rtl:lg:divide-x-reverse">
        {/* Destination */}
        <div className="px-5 py-3.5 lg:py-4">
          <label htmlFor="bw-destination" className={labelTone}>
            {t("destination")}
          </label>
          <select
            id="bw-destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="mt-1 w-full bg-transparent text-sm font-medium text-navy focus:outline-none"
          >
            <option value="">{t("destinationAny")}</option>
            {destinations.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name[locale]} · {d.areaName[locale]}
              </option>
            ))}
          </select>
        </div>

        {/* Check-in */}
        <div className="px-5 py-3.5 lg:py-4">
          <label htmlFor="bw-checkin" className={labelTone}>
            {t("checkIn")}
          </label>
          <input
            id="bw-checkin"
            type="date"
            value={checkIn}
            min={formatISODate(today)}
            onChange={(e) => setCheckIn(e.target.value)}
            className="mt-1 w-full bg-transparent text-sm font-medium text-navy focus:outline-none"
          />
        </div>

        {/* Check-out */}
        <div className="px-5 py-3.5 lg:py-4">
          <label htmlFor="bw-checkout" className={labelTone}>
            {t("checkOut")}
          </label>
          <input
            id="bw-checkout"
            type="date"
            value={checkOut}
            min={checkIn || formatISODate(today)}
            onChange={(e) => setCheckOut(e.target.value)}
            className="mt-1 w-full bg-transparent text-sm font-medium text-navy focus:outline-none"
          />
        </div>

        {/* Guests */}
        <div className="px-5 py-3.5 lg:py-4">
          <p className={labelTone}>{t("guests")}</p>
          <div className="mt-1 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setGuests((v) => Math.max(1, v - 1))}
              aria-label={t("decrement")}
              className="grid h-7 w-7 place-items-center rounded-full bg-navy/5 hover:bg-navy/10 transition-colors disabled:opacity-30"
              disabled={guests <= 1}
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="text-sm font-medium text-navy tabular-nums">{guests}</span>
            <button
              type="button"
              onClick={() => setGuests((v) => Math.min(12, v + 1))}
              aria-label={t("increment")}
              className="grid h-7 w-7 place-items-center rounded-full bg-navy/5 hover:bg-navy/10 transition-colors disabled:opacity-30"
              disabled={guests >= 12}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="p-3 lg:p-3 flex items-stretch">
          <button
            type="submit"
            className="inline-flex w-full lg:w-auto items-center justify-center gap-2 rounded-2xl bg-navy text-stone px-6 py-3 text-sm font-medium hover:bg-navy-700 transition-colors duration-200 ease-out-expo"
          >
            <Search className="h-4 w-4" />
            <span>{t("find")}</span>
          </button>
        </div>
      </div>
    </form>
  );
}

function formatISODate(date: Date): string {
  return date.toISOString().split("T")[0] ?? "";
}
