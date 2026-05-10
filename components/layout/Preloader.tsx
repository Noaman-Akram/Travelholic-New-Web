"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { KeyholeMark } from "@/components/brand/KeyholeMark";
import { Wordmark } from "@/components/brand/Wordmark";

const COOKIE_NAME = "TH_PRELOADER_SEEN";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const VISIBLE_MS = 1400;

/**
 * First-visit preloader: shows the brand mark + slogan, fades out after
 * ~1.4s. Subsequent navigations don't show it (cookie-gated). Respects
 * prefers-reduced-motion. Locale-aware: wordmark + slogan switch between
 * Inter and Myriad Arabic via the Wordmark component.
 */
export function Preloader({ locale }: { locale: "en" | "ar" }) {
  const [show, setShow] = useState(false);
  const t = useTranslations("common");

  useEffect(() => {
    if (typeof document === "undefined") return;
    const seen = document.cookie
      .split("; ")
      .some((c) => c.startsWith(`${COOKIE_NAME}=`));
    if (seen) return;
    setShow(true);
    // Mark seen immediately so a refresh while the preloader is up
    // still suppresses it next time.
    document.cookie = `${COOKIE_NAME}=1; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
    const t = window.setTimeout(() => setShow(false), VISIBLE_MS);
    return () => window.clearTimeout(t);
  }, []);

  const slogan = (() => {
    try {
      return t("tagline");
    } catch {
      return locale === "ar" ? "بيوت لا غرف" : "Homes Not Rooms";
    }
  })();

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="th-preloader"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden="true"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-stone motion-reduce:transition-none"
        >
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.05,
            }}
            className="flex flex-col items-center gap-3 motion-reduce:transition-none"
          >
            <KeyholeMark tone="navy" size={56} />
            <Wordmark tone="navy" size="lg" locale={locale} />
            <span
              className={
                locale === "ar"
                  ? "mt-1 font-arabic text-sm text-navy/55"
                  : "mt-1 text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55"
              }
            >
              {slogan}
            </span>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
