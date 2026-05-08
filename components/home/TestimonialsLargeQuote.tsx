"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/motion/Reveal";
import { easeOutExpo } from "@/lib/motion";

type Quote = { text: string; name: string; context: string };

export function TestimonialsLargeQuote() {
  const t = useTranslations("home.testimonials");
  const quotes = (t.raw("quotes") as unknown as Quote[]) ?? [];
  const prefersReduced = useReducedMotion();
  const [index, setIndex] = useState(0);

  const current = quotes[index];

  if (!current) return null;

  return (
    <section className="relative bg-stone-100 py-24 lg:py-36">
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10">
        <Reveal as="header" className="mb-12 lg:mb-16">
          <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 text-h2-mobile lg:text-h2 leading-tight tracking-tight-heading font-medium text-balance max-w-3xl">
            {t("title")}
          </h2>
        </Reveal>

        <div className="grid grid-cols-12 gap-8 items-center min-h-[42vh]">
          <blockquote className="col-span-12 lg:col-span-10">
            <AnimatePresence mode="wait">
              <motion.p
                key={index}
                initial={prefersReduced ? false : { opacity: 0, y: 12 }}
                animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
                exit={prefersReduced ? undefined : { opacity: 0, y: -12 }}
                transition={prefersReduced ? undefined : { duration: 0.5, ease: easeOutExpo }}
                className="text-h2-mobile lg:text-display leading-tight tracking-tight-display font-medium text-balance"
              >
                <span className="text-butter font-artistic italic me-2">“</span>
                {current.text}
                <span className="text-butter font-artistic italic ms-2">”</span>
              </motion.p>
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.footer
                key={`meta-${index}`}
                initial={prefersReduced ? false : { opacity: 0 }}
                animate={prefersReduced ? undefined : { opacity: 1 }}
                exit={prefersReduced ? undefined : { opacity: 0 }}
                transition={prefersReduced ? undefined : { duration: 0.5, delay: 0.15 }}
                className="mt-10 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6"
              >
                <p className="text-base font-medium text-navy">{current.name}</p>
                <p className="text-sm text-navy/55">{current.context}</p>
              </motion.footer>
            </AnimatePresence>
          </blockquote>
        </div>

        <div className="mt-10 flex items-center justify-between gap-4">
          <p className="text-xs text-navy/50 tabular-nums">
            {String(index + 1).padStart(2, "0")} / {String(quotes.length).padStart(2, "0")}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIndex((i) => (i - 1 + quotes.length) % quotes.length)}
              aria-label="Previous"
              className="grid h-12 w-12 place-items-center rounded-full border border-navy/20 hover:bg-navy/5 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 rtl:scale-x-[-1]" />
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => (i + 1) % quotes.length)}
              aria-label="Next"
              className="grid h-12 w-12 place-items-center rounded-full border border-navy/20 hover:bg-navy/5 transition-colors"
            >
              <ChevronRight className="h-4 w-4 rtl:scale-x-[-1]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
