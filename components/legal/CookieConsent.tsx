"use client";

import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useConsent } from "@/lib/cookies/consent";
import { easeOutExpo } from "@/lib/motion";

export function CookieConsent() {
  const t = useTranslations("cookies");
  const { value, hydrated, set } = useConsent();
  const prefersReduced = useReducedMotion();

  if (!hydrated || value !== "unset") return null;

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-label={t("title")}
        initial={prefersReduced ? false : { opacity: 0, y: 24 }}
        animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
        exit={prefersReduced ? undefined : { opacity: 0, y: 24 }}
        transition={prefersReduced ? undefined : { duration: 0.4, ease: easeOutExpo, delay: 0.6 }}
        className="fixed bottom-4 inset-x-4 sm:start-6 sm:end-auto sm:max-w-md z-40"
      >
        <div className="rounded-3xl bg-stone shadow-editorial-lg ring-1 ring-navy/10 p-5 sm:p-6">
          <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55">
            {t("title")}
          </p>
          <p className="mt-3 text-sm text-navy/85 leading-relaxed text-pretty">
            {t("body")}
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => set("all")}
              className="rounded-full bg-navy text-stone px-5 py-2.5 text-sm font-medium hover:bg-navy-700 transition-colors"
            >
              {t("acceptAll")}
            </button>
            <button
              type="button"
              onClick={() => set("essential")}
              className="rounded-full border border-navy/20 bg-transparent text-navy px-5 py-2.5 text-sm font-medium hover:bg-navy/5 transition-colors"
            >
              {t("essentialOnly")}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
