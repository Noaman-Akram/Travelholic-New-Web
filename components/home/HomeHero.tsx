"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { WordReveal } from "@/components/motion/WordReveal";
import { BookingWidgetInline } from "./BookingWidgetInline";
import { easeOutExpo } from "@/lib/motion";
import type { AppLocale } from "@/i18n/routing";

export function HomeHero() {
  const t = useTranslations("home");
  const locale = useLocale() as AppLocale;
  const prefersReduced = useReducedMotion();

  return (
    <section
      aria-labelledby="hero-headline"
      className="relative min-h-[100svh] overflow-hidden bg-navy text-stone"
    >
      {/* Background image with slow Ken-Burns */}
      <motion.div
        initial={prefersReduced ? false : { scale: 1.08 }}
        animate={prefersReduced ? undefined : { scale: 1 }}
        transition={prefersReduced ? undefined : { duration: 12, ease: easeOutExpo }}
        className="absolute inset-0"
      >
        <Image
          src="https://picsum.photos/seed/th-hero-cairo/2400/1500"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-navy/55 via-navy/40 to-navy/85"
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex min-h-[100svh] flex-col">
        <div className="flex-1 flex items-end pb-8 lg:pb-16">
          <div className="mx-auto w-full max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10 pt-32">
            <motion.p
              initial={prefersReduced ? false : { opacity: 0, y: 8 }}
              animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
              transition={prefersReduced ? undefined : { duration: 0.8, ease: easeOutExpo, delay: 0.2 }}
              className="text-eyebrow uppercase font-medium tracking-eyebrow text-stone/80"
            >
              {t("heroEyebrow")}
            </motion.p>

            <WordReveal
              text={t("heroHeadline")}
              as="h1"
              className="mt-5 text-display-mobile lg:text-display font-medium tracking-tight-display text-balance max-w-[18ch]"
            />

            <motion.p
              initial={prefersReduced ? false : { opacity: 0, y: 8 }}
              animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
              transition={prefersReduced ? undefined : { duration: 0.9, ease: easeOutExpo, delay: 1.0 }}
              id="hero-subline"
              className="mt-6 max-w-2xl text-body-lg leading-relaxed text-stone/85 text-pretty"
            >
              {t("heroSubline")}
            </motion.p>
          </div>
        </div>

        {/* Inline booking widget — anchored bottom */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 24 }}
          animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
          transition={prefersReduced ? undefined : { duration: 0.9, ease: easeOutExpo, delay: 1.2 }}
          className="mx-auto w-full max-w-screen-xl px-5 sm:px-6 lg:px-8 xl:px-10 pb-8 lg:pb-12"
        >
          <BookingWidgetInline tone="translucent" />
        </motion.div>
      </div>

      {locale === "ar" ? null : null /* placeholder to satisfy lint about unused locale */}
    </section>
  );
}
