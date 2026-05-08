"use client";

import { useTranslations } from "next-intl";
import { useCurrency } from "@/lib/currency/context";
import { cn } from "@/lib/utils/cn";

export function CurrencySwitch({
  className,
  variant = "compact",
}: {
  className?: string;
  variant?: "compact" | "block";
}) {
  const t = useTranslations("common.currency");
  const { currency, setCurrency } = useCurrency();
  const next = currency === "EGP" ? "USD" : "EGP";

  return (
    <button
      type="button"
      onClick={() => setCurrency(next)}
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-eyebrow",
        "border border-navy/20 bg-transparent text-navy hover:bg-navy/5",
        "transition-colors duration-200 ease-out-expo",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 focus-visible:ring-offset-stone",
        variant === "block" && "w-full px-4 py-2 text-sm",
        className,
      )}
      aria-label={`${t("label")}: ${currency} → ${next}`}
    >
      <span className="opacity-100">{currency === "EGP" ? t("egp") : t("usd")}</span>
      <span aria-hidden="true" className="mx-1.5 opacity-40">⇄</span>
      <span className="opacity-60">{currency === "EGP" ? t("usd") : t("egp")}</span>
    </button>
  );
}
