import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";
import { BookingSuccessClient } from "./client";

type Props = {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<{ ref?: string }>;
};

export const metadata: Metadata = {
  title: "Booking confirmed",
  // No-index — this is a private confirmation page, not for SEO.
  robots: { index: false, follow: false },
};

export default async function BookingSuccessPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { ref } = await searchParams;
  setRequestLocale(locale);

  return <BookingSuccessClient merchantOrderId={ref ?? null} />;
}
