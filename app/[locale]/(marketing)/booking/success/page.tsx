import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";
import { BookingSuccessClient } from "./client";

type Props = {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<{ ref?: string; response?: string; params?: string }>;
};

export type RedirectPaymentDetails = {
  merchantOrderId?: string;
  paymentgwOrderId?: string;
  orderStatus?: string;
  paymentMethod?: string;
  totalAmount?: number;
  netAmount?: number;
  currency?: string;
  paidAt?: string;
};

export const metadata: Metadata = {
  title: "Booking confirmed",
  // No-index — this is a private confirmation page, not for SEO.
  robots: { index: false, follow: false },
};

export default async function BookingSuccessPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { ref, response, params: superpayParams } = await searchParams;
  setRequestLocale(locale);

  const redirectDetails = getPaymentDetailsFromResponse(response ?? superpayParams);
  const merchantOrderId = ref ?? redirectDetails?.merchantOrderId ?? null;

  return (
    <BookingSuccessClient
      merchantOrderId={merchantOrderId}
      initialPayment={redirectDetails}
    />
  );
}

function getPaymentDetailsFromResponse(response?: string): RedirectPaymentDetails | null {
  if (!response) return null;

  try {
    const normalized = response.replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(normalized, "base64").toString("utf8");
    const parsed = JSON.parse(json) as Record<string, unknown>;
    return {
      merchantOrderId: stringOrUndefined(parsed.merchantOrderId),
      paymentgwOrderId: stringOrUndefined(parsed.paymentgwOrderId),
      orderStatus: stringOrUndefined(parsed.orderStatus),
      paymentMethod: stringOrUndefined(parsed.paymentMethod),
      totalAmount: numberOrUndefined(parsed.totalAmount),
      netAmount: numberOrUndefined(parsed.netAmount),
      currency: stringOrUndefined(parsed.currency),
      paidAt: stringOrUndefined(parsed.updatedTime) ?? stringOrUndefined(parsed.creationTime),
    };
  } catch {
    return null;
  }
}

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function numberOrUndefined(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
