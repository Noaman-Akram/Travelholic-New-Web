"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { KeyholeMark } from "@/components/brand/KeyholeMark";
import { trackBookingSubmitted } from "@/lib/analytics/track";

type StatusResponse =
  | {
      ok: true;
      state: "confirmed";
      confirmationCode: string;
      hostifyReservationId?: number;
      paidAt?: string;
      homeSlug?: string;
      nights?: number;
      totalEGP?: number;
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
}: {
  merchantOrderId: string | null;
}) {
  const t = useTranslations("bookingResult");
  const [view, setView] = useState<View>({ kind: "loading" });
  const stoppedRef = useRef(false);
  const conversionFiredRef = useRef(false);

  useEffect(() => {
    if (!merchantOrderId) {
      setView({ kind: "error", reason: "missing-ref" });
      return;
    }

    const startedAt = Date.now();

    async function poll() {
      if (stoppedRef.current) return;
      try {
        const res = await fetch(`/api/payment/status?ref=${encodeURIComponent(merchantOrderId!)}`, {
          cache: "no-store",
        });
        const data = (await res.json()) as StatusResponse;

        if (stoppedRef.current) return;

        if (data.ok && "state" in data && data.state === "confirmed") {
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
  }, [merchantOrderId]);

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

