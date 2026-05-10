"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { trackWhatsAppClicked } from "@/lib/analytics/track";

// REVIEW: WhatsApp number pending — env var NEXT_PUBLIC_WHATSAPP_NUMBER unset
// renders aria-disabled until provided.
export function WhatsAppFab() {
  const t = useTranslations("whatsapp");
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim();
  const enabled = Boolean(number);
  const [pulsed, setPulsed] = useState(false);

  // Pulse once on first scroll, then never again.
  useEffect(() => {
    if (pulsed) return;
    function onScroll() {
      if (window.scrollY > 200) {
        setPulsed(true);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pulsed]);

  const href = enabled
    ? `https://wa.me/${number}?text=${encodeURIComponent(
        "Hello Travelholic — I'd like to book a stay.",
      )}`
    : "#";

  return (
    <a
      href={href}
      target={enabled ? "_blank" : undefined}
      rel={enabled ? "noopener noreferrer" : undefined}
      aria-label={enabled ? t("fabLabel") : t("disabledLabel")}
      aria-disabled={!enabled || undefined}
      onClick={
        enabled
          ? () => trackWhatsAppClicked({ surface: "fab" })
          : (e) => e.preventDefault()
      }
      className={cn(
        "fixed bottom-6 end-6 z-30",
        "inline-flex items-center justify-center",
        "h-14 w-14 rounded-full shadow-editorial-lg",
        "bg-navy text-stone transition-transform duration-300 ease-out-expo",
        enabled ? "hover:scale-110 active:scale-95" : "opacity-60 cursor-not-allowed",
        !pulsed && enabled && "motion-safe:animate-pulse-soft",
      )}
    >
      <MessageCircle className="h-6 w-6" aria-hidden="true" />
      <span className="sr-only">
        {enabled ? t("fabLabel") : t("disabledLabel")}
      </span>
    </a>
  );
}
