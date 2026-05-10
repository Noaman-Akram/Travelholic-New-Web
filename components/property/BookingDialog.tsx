"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, ArrowRight, ArrowLeft, Check, MessageCircle } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/lib/currency/context";
import { formatPrice } from "@/lib/utils/formatPrice";
import { easeOutExpo } from "@/lib/motion";
import type { BookingPricingResult } from "@/lib/utils/bookingMath";
import type { Home } from "@/lib/data/types";
import { homeHostifyPrimaryId } from "@/lib/data";
import type { AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";
import { trackBookingSubmitted, trackWhatsAppClicked } from "@/lib/analytics/track";

const GuestSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email(),
  phone: z.string().min(5).max(40),
  country: z.string().min(2).max(80),
  specialRequests: z.string().max(2000).optional().or(z.literal("")),
  agreeTerms: z.literal("on"),
});

type Step = 1 | 2 | 3;
type GuestData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  specialRequests: string;
};

export function BookingDialog({
  open,
  onOpenChange,
  home,
  checkIn,
  checkOut,
  guests,
  pricing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  home: Home;
  checkIn: string;
  checkOut: string;
  guests: number;
  pricing: BookingPricingResult;
}) {
  const t = useTranslations("bookingDialog");
  const locale = useLocale() as AppLocale;
  const { currency } = useCurrency();
  const prefersReduced = useReducedMotion();

  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [bookingRef, setBookingRef] = useState<string>("");
  const [bookingStatus, setBookingStatus] = useState<"lead" | "pending" | "accepted">("lead");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof GuestData | "agreeTerms", boolean>>>({});

  const handleClose = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      // Reset on close
      setTimeout(() => {
        setStep(1);
        setSubmitError(false);
        setFieldErrors({});
      }, 250);
    }
  };

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setSubmitError(false);
    setFieldErrors({});

    const raw = {
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      country: String(formData.get("country") ?? ""),
      specialRequests: String(formData.get("specialRequests") ?? ""),
      agreeTerms: formData.get("agreeTerms") === "on" ? "on" : "",
    };
    const parsed = GuestSchema.safeParse(raw);
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        firstName: !!flat.firstName,
        lastName: !!flat.lastName,
        email: !!flat.email,
        phone: !!flat.phone,
        country: !!flat.country,
        agreeTerms: !!flat.agreeTerms,
      });
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homeSlug: home.slug,
          checkIn,
          checkOut,
          nights: pricing.nights,
          guests,
          guest: parsed.data,
          pricing: {
            subtotalEGP: pricing.subtotalEGP,
            discountEGP: pricing.discountEGP,
            cleaningFeeEGP: pricing.cleaningFeeEGP,
            totalEGP: pricing.totalEGP,
            currency,
          },
          locale,
          source: "direct-website",
          timestamp: new Date().toISOString(),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        ref?: string;
        status?: "lead" | "pending" | "accepted";
        hostifyReservationId?: number;
        error?: string;
      };
      if (!res.ok || !json.ok) {
        setSubmitError(true);
        setSubmitting(false);
        return;
      }
      const finalRef = json.ref ?? generateRef(home.slug);
      const finalStatus = json.status ?? "lead";
      setBookingRef(finalRef);
      setBookingStatus(finalStatus);
      setStep(3);
      trackBookingSubmitted({
        ref: finalRef,
        homeSlug: home.slug,
        homeName: home.title.en,
        hostifyId: homeHostifyPrimaryId(home),
        nights: pricing.nights,
        totalEGP: pricing.totalEGP,
        currency,
        status: finalStatus,
      });
    } catch {
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  }

  const total = formatPrice(pricing.totalEGP, currency, locale);
  const savings = pricing.savingsVsOtaEGP
    ? formatPrice(pricing.savingsVsOtaEGP, currency, locale)
    : null;

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim();
  const whatsappHref = whatsappNumber && bookingRef
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        t("whatsappPrefill", {
          home: home.title[locale],
          checkIn,
          checkOut,
          guests,
          total,
          ref: bookingRef,
        }),
      )}`
    : undefined;

  const motionProps = prefersReduced
    ? {}
    : {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
        transition: { duration: 0.3, ease: easeOutExpo },
      };

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 sm:m-auto h-[92svh] sm:h-auto sm:max-h-[90vh] w-full sm:max-w-2xl sm:rounded-3xl bg-stone shadow-editorial-lg overflow-hidden flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:fade-out-0 sm:data-[state=open]:fade-in-0">
          <header className="flex items-center justify-between p-5 sm:p-6 border-b border-navy/10">
            <div>
              <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55">
                {step === 1 ? t("step1.eyebrow") : step === 2 ? t("step2.eyebrow") : t("step3.eyebrow")}
              </p>
              <Dialog.Title className="mt-1 text-h4-mobile lg:text-h4 font-medium leading-tight">
                {step === 1 ? t("step1.title") : step === 2 ? t("step2.title") : t("step3.title")}
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-navy/5 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </header>

          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div key="step1" {...motionProps} className="p-5 sm:p-7">
                  <div className="rounded-2xl bg-stone-100 ring-1 ring-navy/10 p-5 mb-6">
                    <div className="flex items-center gap-4">
                      <div
                        className="h-16 w-20 rounded-xl bg-navy/10 bg-cover bg-center shrink-0"
                        style={{
                          backgroundImage: `url(${home.gallery[0]?.src ?? ""})`,
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-base font-medium leading-tight truncate">
                          {home.title[locale]}
                        </p>
                        <p className="text-xs text-navy/55 mt-1">{home.destinationSlug}</p>
                      </div>
                    </div>
                  </div>

                  <dl className="grid grid-cols-3 gap-4 text-sm border-y border-navy/10 py-5">
                    <div>
                      <dt className="text-eyebrow uppercase tracking-eyebrow text-navy/55 text-[10px]">
                        {t("step1.checkIn")}
                      </dt>
                      <dd className="mt-1 font-medium">{checkIn}</dd>
                    </div>
                    <div>
                      <dt className="text-eyebrow uppercase tracking-eyebrow text-navy/55 text-[10px]">
                        {t("step1.checkOut")}
                      </dt>
                      <dd className="mt-1 font-medium">{checkOut}</dd>
                    </div>
                    <div>
                      <dt className="text-eyebrow uppercase tracking-eyebrow text-navy/55 text-[10px]">
                        {t("step1.guests")}
                      </dt>
                      <dd className="mt-1 font-medium">{guests}</dd>
                    </div>
                  </dl>

                  <div className="space-y-2 mt-5 text-sm">
                    <Row
                      label={t("step1.nights", { nights: pricing.nights })}
                      value={formatPrice(pricing.subtotalEGP, currency, locale)}
                    />
                    {pricing.discountEGP > 0 ? (
                      <Row
                        label={t("step1.discount")}
                        value={`− ${formatPrice(pricing.discountEGP, currency, locale)}`}
                        muted
                      />
                    ) : null}
                    <Row
                      label={t("step1.cleaningFee")}
                      value={formatPrice(pricing.cleaningFeeEGP, currency, locale)}
                      muted
                    />
                    <div className="border-t border-navy/10 pt-3 mt-3 flex items-baseline justify-between font-medium">
                      <span>{t("step1.total")}</span>
                      <span className="text-lg tabular-nums">{total}</span>
                    </div>
                    {savings ? (
                      <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-butter px-3 py-1.5 text-[11px] uppercase tracking-eyebrow text-navy">
                        {t("step1.savings", { amount: savings })}
                      </p>
                    ) : null}
                  </div>
                </motion.div>
              ) : step === 2 ? (
                <motion.form
                  key="step2"
                  {...motionProps}
                  id="bk-step2-form"
                  className="p-5 sm:p-7"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit(new FormData(e.currentTarget));
                  }}
                >
                  <p className="text-sm text-navy/70 mb-6 max-w-xl">{t("step2.subtitle")}</p>
                  <div className="grid grid-cols-2 gap-4 gap-y-5">
                    <Field
                      label={t("step2.firstName")}
                      name="firstName"
                      required
                      autoComplete="given-name"
                      error={fieldErrors.firstName ? t("step2.errors.firstName") : undefined}
                    />
                    <Field
                      label={t("step2.lastName")}
                      name="lastName"
                      required
                      autoComplete="family-name"
                      error={fieldErrors.lastName ? t("step2.errors.lastName") : undefined}
                    />
                    <Field
                      label={t("step2.email")}
                      name="email"
                      type="email"
                      required
                      className="col-span-2"
                      autoComplete="email"
                      error={fieldErrors.email ? t("step2.errors.email") : undefined}
                    />
                    <Field
                      label={t("step2.phone")}
                      name="phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      error={fieldErrors.phone ? t("step2.errors.phone") : undefined}
                    />
                    <Field
                      label={t("step2.country")}
                      name="country"
                      required
                      autoComplete="country-name"
                      placeholder={t("step2.countryPlaceholder")}
                      error={fieldErrors.country ? t("step2.errors.country") : undefined}
                    />
                    <Field
                      label={t("step2.specialRequests")}
                      name="specialRequests"
                      multiline
                      className="col-span-2"
                      placeholder={t("step2.specialRequestsPlaceholder")}
                    />
                  </div>

                  <label className="mt-6 flex items-start gap-3 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      required
                      className="mt-1 h-4 w-4 accent-navy"
                    />
                    <span className="text-navy/80">{t("step2.terms")}</span>
                  </label>
                  {fieldErrors.agreeTerms ? (
                    <p className="mt-2 text-xs text-maroon">{t("step2.errors.terms")}</p>
                  ) : null}

                  {submitError ? (
                    <p className="mt-4 text-sm text-maroon">{t("errors.submit")}</p>
                  ) : null}
                </motion.form>
              ) : (
                <motion.div key="step3" {...motionProps} className="p-5 sm:p-7 text-center">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-butter mt-4 mb-6">
                    <Check className="h-7 w-7 text-navy" />
                  </div>
                  <p className="mx-auto max-w-md text-body-lg leading-relaxed text-navy/80 text-pretty">
                    {bookingStatus === "pending"
                      ? t("step3.subtitlePending")
                      : t("step3.subtitle")}
                  </p>
                  {bookingRef ? (
                    <p className="mt-6 inline-flex items-baseline gap-2 rounded-full bg-stone-100 px-4 py-1.5 text-xs uppercase tracking-eyebrow text-navy/65">
                      <span className="text-navy/45">{t("step3.refLabel")}</span>
                      <span className="font-mono text-navy">{bookingRef}</span>
                    </p>
                  ) : null}
                  {bookingStatus === "pending" ? (
                    <p className="mt-4 mx-auto max-w-md text-xs text-navy/55">
                      {t("step3.paymentNote")}
                    </p>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <footer className="flex items-center justify-between gap-3 p-5 sm:p-6 border-t border-navy/10 bg-stone-100">
            {step === 1 ? (
              <>
                <span />
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => setStep(2)}
                >
                  {t("step1.continue")}
                  <ArrowRight className="h-4 w-4 ms-1 rtl:scale-x-[-1]" />
                </Button>
              </>
            ) : step === 2 ? (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="h-4 w-4 me-1 rtl:scale-x-[-1]" />
                  {t("step2.back")}
                </Button>
                <button
                  type="submit"
                  form="bk-step2-form"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-navy text-stone h-11 px-6 text-sm font-medium transition-colors hover:bg-navy-700 disabled:opacity-60"
                >
                  {submitting ? "…" : t("step2.reserve")}
                </button>
              </>
            ) : (
              <>
                {whatsappHref ? (
                  <Button asChild variant="ghost" size="md">
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackWhatsAppClicked({ surface: "booking-success" })}
                    >
                      <MessageCircle className="h-4 w-4 me-1.5" />
                      {t("step3.whatsappCta")}
                    </a>
                  </Button>
                ) : (
                  <span />
                )}
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => handleClose(false)}
                >
                  {t("step3.closeCta")}
                </Button>
              </>
            )}
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function generateRef(slug: string): string {
  const ts = Date.now().toString(36).toUpperCase().slice(-5);
  const slugSig = slug
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 4)
    .toUpperCase();
  return `TH-${slugSig}-${ts}`;
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

function Field({
  label,
  name,
  type = "text",
  required = false,
  autoComplete,
  multiline = false,
  className,
  placeholder,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  multiline?: boolean;
  className?: string;
  placeholder?: string;
  error?: string;
}) {
  const inputClass =
    "w-full bg-transparent border-0 border-b border-navy/15 px-0 py-2.5 text-base text-navy placeholder:text-navy/40 focus:outline-none focus:border-navy transition-colors";
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55">
        {label}
      </span>
      {multiline ? (
        <textarea
          name={name}
          rows={3}
          required={required}
          placeholder={placeholder}
          className={`${inputClass} resize-none`}
        />
      ) : (
        <input
          name={name}
          type={type}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={inputClass}
        />
      )}
      {error ? <span className="text-[11px] text-maroon">{error}</span> : null}
    </label>
  );
}
