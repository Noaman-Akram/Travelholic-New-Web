import type { AppLocale } from "@/i18n/routing";

export type AppCurrency = "EGP" | "USD";

const USD_PER_EGP = 0.0205;

export function formatPriceEGP(amountEGP: number, locale: AppLocale): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(amountEGP)));
}

export function formatPriceUSD(amountEGP: number, locale: AppLocale): string {
  const usd = amountEGP * USD_PER_EGP;
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(usd)));
}

export function formatPrice(
  amountEGP: number,
  currency: AppCurrency,
  locale: AppLocale,
): string {
  return currency === "EGP"
    ? formatPriceEGP(amountEGP, locale)
    : formatPriceUSD(amountEGP, locale);
}
