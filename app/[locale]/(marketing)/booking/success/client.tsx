"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, Loader2, AlertCircle, Download } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { KeyholeMark } from "@/components/brand/KeyholeMark";
import { trackBookingSubmitted } from "@/lib/analytics/track";
import type { RedirectPaymentDetails } from "./page";

type PaymentDetails = RedirectPaymentDetails & {
  confirmationCode?: string;
  hostifyReservationId?: number;
  homeSlug?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  nights?: number;
};

type StatusResponse =
  | {
      ok: true;
      state: "confirmed";
      confirmationCode: string;
      hostifyReservationId?: number;
      paidAt?: string;
      homeSlug?: string;
      checkIn?: string;
      checkOut?: string;
      guests?: number;
      nights?: number;
      totalEGP?: number;
      paymentgwOrderId?: string;
      orderStatus?: string;
      paymentMethod?: string;
    }
  | { ok: true; state: "pending"; orderStatus?: string; reason?: string }
  | { ok: true; state: "failed"; orderStatus?: string }
  | { ok: false; state?: "paid-no-reservation" | "error"; error: string; paymentgwOrderId?: string }
  | { ok: false; error: string };

type View =
  | { kind: "loading" }
  | { kind: "confirmed"; code: string; reservationId?: number }
  | { kind: "pending" }
  | { kind: "failed"; reason: string }
  | { kind: "paid-no-reservation"; paymentgwOrderId?: string }
  | { kind: "error"; reason: string };

const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 90_000;

export function BookingSuccessClient({
  merchantOrderId,
  bookingToken,
  initialPayment,
}: {
  merchantOrderId: string | null;
  bookingToken: string | null;
  initialPayment: RedirectPaymentDetails | null;
}) {
  const t = useTranslations("bookingResult");
  const locale = useLocale();
  const [view, setView] = useState<View>({ kind: "loading" });
  const [payment, setPayment] = useState<PaymentDetails>(initialPayment ?? {});
  const stoppedRef = useRef(false);
  const conversionFiredRef = useRef(false);
  const initialOrderStatus = initialPayment?.orderStatus;

  useEffect(() => {
    if (!merchantOrderId) {
      setView({ kind: "error", reason: "missing-ref" });
      return;
    }

    // SuperPay signals failure in its redirect params. Skip polling immediately.
    const spStatus = initialOrderStatus;
    if (spStatus === "FAILURE" || spStatus === "FAILED" || spStatus === "CANCELLED") {
      setView({ kind: "failed", reason: spStatus });
      return;
    }

    const startedAt = Date.now();

    async function poll() {
      if (stoppedRef.current) return;
      try {
        const params = new URLSearchParams({ ref: merchantOrderId! });
        if (bookingToken) params.set("bt", bookingToken);
        const res = await fetch(`/api/payment/status?${params.toString()}`, {
          cache: "no-store",
        });
        const data = (await res.json()) as StatusResponse;

        if (stoppedRef.current) return;

        if (data.ok && "state" in data && data.state === "confirmed") {
          setPayment((current) => ({
            ...current,
            merchantOrderId: merchantOrderId ?? current.merchantOrderId,
            confirmationCode: data.confirmationCode,
            hostifyReservationId: data.hostifyReservationId,
            paidAt: data.paidAt ?? current.paidAt,
            homeSlug: data.homeSlug ?? current.homeSlug,
            checkIn: data.checkIn ?? current.checkIn,
            checkOut: data.checkOut ?? current.checkOut,
            guests: data.guests ?? current.guests,
            nights: data.nights ?? current.nights,
            totalAmount: data.totalEGP ?? current.totalAmount,
            currency: current.currency ?? "EGP",
            paymentgwOrderId: data.paymentgwOrderId ?? current.paymentgwOrderId,
            orderStatus: data.orderStatus ?? current.orderStatus,
            paymentMethod: data.paymentMethod ?? current.paymentMethod,
          }));
          setView({
            kind: "confirmed",
            code: data.confirmationCode,
            reservationId: data.hostifyReservationId,
          });
          if (!conversionFiredRef.current) {
            conversionFiredRef.current = true;
            trackBookingSubmitted({
              ref: data.confirmationCode || merchantOrderId!,
              homeSlug: data.homeSlug ?? "unknown",
              hostifyId: data.hostifyReservationId,
              nights: data.nights ?? 0,
              totalEGP: data.totalEGP ?? 0,
              currency: "EGP",
              status: "accepted",
            });
          }
          stoppedRef.current = true;
          return;
        }
        if (data.ok && "state" in data && data.state === "failed") {
          setView({ kind: "failed", reason: ("orderStatus" in data && data.orderStatus) || "failed" });
          stoppedRef.current = true;
          return;
        }
        if (!data.ok && "state" in data && data.state === "paid-no-reservation") {
          setPayment((current) => ({
            ...current,
            merchantOrderId: merchantOrderId ?? current.merchantOrderId,
            paymentgwOrderId: "paymentgwOrderId" in data ? data.paymentgwOrderId : current.paymentgwOrderId,
          }));
          setView({
            kind: "paid-no-reservation",
            paymentgwOrderId: "paymentgwOrderId" in data ? data.paymentgwOrderId : undefined,
          });
          stoppedRef.current = true;
          return;
        }
        if (!data.ok && data.error === "not-found") {
          setView({ kind: "error", reason: "not-found" });
          stoppedRef.current = true;
          return;
        }

        // Still pending — keep polling unless we've timed out.
        if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
          setView({ kind: "pending" });
          stoppedRef.current = true;
          return;
        }
        setView({ kind: "loading" });
        setTimeout(poll, POLL_INTERVAL_MS);
      } catch {
        if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
          setView({ kind: "error", reason: "network" });
          stoppedRef.current = true;
          return;
        }
        setTimeout(poll, POLL_INTERVAL_MS);
      }
    }

    poll();
    return () => {
      stoppedRef.current = true;
    };
  }, [merchantOrderId, bookingToken, initialOrderStatus]);

  return (
    <main className="min-h-[80vh] bg-stone py-24 lg:py-32">
      <div className="mx-auto max-w-screen-md px-5 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8">
            <KeyholeMark tone="navy" className="h-14 w-14" />
          </div>

          {view.kind === "loading" ? (
            <>
              <Loader2 className="h-10 w-10 text-navy/55 mb-6 motion-safe:animate-spin" />
              <h1 className="text-h2-mobile lg:text-h2 leading-tight tracking-tight-heading font-medium mb-4">
                {t("loading.title")}
              </h1>
              <p className="text-body-lg text-navy/70 max-w-md">{t("loading.body")}</p>
            </>
          ) : null}

          {view.kind === "confirmed" ? (
            <>
              <div className="h-16 w-16 rounded-full bg-navy text-stone flex items-center justify-center mb-6">
                <Check className="h-8 w-8" strokeWidth={2.5} />
              </div>
              <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55 mb-3">
                {t("confirmed.eyebrow")}
              </p>
              <h1 className="text-h2-mobile lg:text-h2 leading-tight tracking-tight-heading font-medium mb-4">
                {t("confirmed.title")}
              </h1>
              <p className="text-body-lg text-navy/70 max-w-md mb-8 text-pretty">
                {t("confirmed.body")}
              </p>
              <div className="rounded-3xl bg-stone-100 ring-1 ring-navy/8 px-8 py-6 mb-10">
                <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55 mb-2">
                  {t("confirmed.codeLabel")}
                </p>
                <p className="text-h3-mobile lg:text-h3 font-medium tabular-nums tracking-tight-heading">
                  {view.code || merchantOrderId || "—"}
                </p>
              </div>
              <PaymentReceiptCard
                details={payment}
                locale={locale}
                labels={{
                  title: t("receipt.title"),
                  bookingRef: t("receipt.bookingRef"),
                  paymentRef: t("receipt.paymentRef"),
                  amount: t("receipt.amount"),
                  method: t("receipt.method"),
                  paidAt: t("receipt.paidAt"),
                  stay: t("receipt.stay"),
                  guests: t("receipt.guests"),
                  download: t("receipt.download"),
                }}
              />
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button asChild variant="primary" size="lg">
                  <Link href="/homes">{t("confirmed.browseMore")}</Link>
                </Button>
                <Button asChild variant="ghost" size="lg">
                  <Link href="/">{t("confirmed.home")}</Link>
                </Button>
              </div>
            </>
          ) : null}

          {view.kind === "pending" ? (
            <>
              <Loader2 className="h-10 w-10 text-navy/55 mb-6 motion-safe:animate-spin" />
              <h1 className="text-h2-mobile lg:text-h2 leading-tight tracking-tight-heading font-medium mb-4">
                {t("pending.title")}
              </h1>
              <p className="text-body-lg text-navy/70 max-w-md text-pretty">
                {t("pending.body", { ref: merchantOrderId ?? "" })}
              </p>
            </>
          ) : null}

          {view.kind === "failed" ? (
            <>
              <AlertCircle className="h-12 w-12 text-maroon mb-6" />
              <h1 className="text-h2-mobile lg:text-h2 leading-tight tracking-tight-heading font-medium mb-4">
                {t("failed.title")}
              </h1>
              <p className="text-body-lg text-navy/70 max-w-md mb-8 text-pretty">
                {t("failed.body")}
              </p>
              <div className="flex gap-3">
                <Button asChild variant="primary" size="lg">
                  <Link href="/homes">{t("failed.tryAgain")}</Link>
                </Button>
              </div>
            </>
          ) : null}

          {view.kind === "paid-no-reservation" ? (
            <>
              <AlertCircle className="h-12 w-12 text-butter mb-6" />
              <h1 className="text-h2-mobile lg:text-h2 leading-tight tracking-tight-heading font-medium mb-4">
                {t("paidNoRes.title")}
              </h1>
              <p className="text-body-lg text-navy/70 max-w-md text-pretty">
                {t("paidNoRes.body", { ref: merchantOrderId ?? "" })}
              </p>
              <PaymentReceiptCard
                details={{
                  ...payment,
                  merchantOrderId: merchantOrderId ?? payment.merchantOrderId,
                  paymentgwOrderId: view.paymentgwOrderId ?? payment.paymentgwOrderId,
                }}
                locale={locale}
                labels={{
                  title: t("receipt.title"),
                  bookingRef: t("receipt.bookingRef"),
                  paymentRef: t("receipt.paymentRef"),
                  amount: t("receipt.amount"),
                  method: t("receipt.method"),
                  paidAt: t("receipt.paidAt"),
                  stay: t("receipt.stay"),
                  guests: t("receipt.guests"),
                  download: t("receipt.download"),
                }}
              />
            </>
          ) : null}

          {view.kind === "error" ? (
            <>
              <AlertCircle className="h-10 w-10 text-navy/55 mb-6" />
              <h1 className="text-h2-mobile lg:text-h2 leading-tight tracking-tight-heading font-medium mb-4">
                {t("error.title")}
              </h1>
              <p className="text-body-lg text-navy/70 max-w-md text-pretty">
                {t("error.body")}
              </p>
              <Button asChild variant="ghost" size="lg" className="mt-8">
                <Link href="/homes">{t("error.cta")}</Link>
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}

function PaymentReceiptCard({
  details,
  labels,
  locale,
}: {
  details: PaymentDetails;
  labels: {
    title: string;
    bookingRef: string;
    paymentRef: string;
    amount: string;
    method: string;
    paidAt: string;
    stay: string;
    guests: string;
    download: string;
  };
  locale: string;
}) {
  const rows = [
    { label: labels.bookingRef, value: details.merchantOrderId ?? details.confirmationCode },
    { label: labels.paymentRef, value: details.paymentgwOrderId },
    {
      label: labels.amount,
      value: formatReceiptAmount(details.totalAmount ?? details.netAmount, details.currency, locale),
    },
    { label: labels.method, value: details.paymentMethod },
    { label: labels.paidAt, value: formatReceiptDate(details.paidAt, locale) },
    {
      label: labels.stay,
      value: details.checkIn && details.checkOut ? `${details.checkIn} → ${details.checkOut}` : undefined,
    },
    {
      label: labels.guests,
      value: typeof details.guests === "number" ? String(details.guests) : undefined,
    },
  ].filter((row): row is { label: string; value: string } => Boolean(row.value));

  if (rows.length === 0) return null;

  return (
    <div className="w-full max-w-xl rounded-3xl bg-stone-100 ring-1 ring-navy/8 px-6 py-5 mb-8 text-start">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-base font-medium">{labels.title}</h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => downloadReceipt(details, labels, locale)}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {labels.download}
        </Button>
      </div>
      <dl className="divide-y divide-navy/10">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-4 py-3">
            <dt className="text-sm text-navy/55">{row.label}</dt>
            <dd className="text-sm font-medium text-navy tabular-nums text-end">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function downloadReceipt(details: PaymentDetails, labels: Record<string, string>, locale: string) {
  const lines = [
    "Travelholic",
    labels.title,
    "",
    `${labels.bookingRef}: ${details.merchantOrderId ?? details.confirmationCode ?? ""}`,
    `${labels.paymentRef}: ${details.paymentgwOrderId ?? ""}`,
    `${labels.amount}: ${formatReceiptAmount(details.totalAmount ?? details.netAmount, details.currency, locale) ?? ""}`,
    `${labels.method}: ${details.paymentMethod ?? ""}`,
    `${labels.paidAt}: ${formatReceiptDate(details.paidAt, locale) ?? ""}`,
    `${labels.stay}: ${details.checkIn && details.checkOut ? `${details.checkIn} -> ${details.checkOut}` : ""}`,
    `${labels.guests}: ${typeof details.guests === "number" ? details.guests : ""}`,
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `travelholic-receipt-${details.merchantOrderId ?? "booking"}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function formatReceiptAmount(amount: number | undefined, currency: string | undefined, locale: string) {
  if (typeof amount !== "number") return undefined;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency ?? "EGP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatReceiptDate(value: string | undefined, locale: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
