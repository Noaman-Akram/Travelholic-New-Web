"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { subscribeNewsletter } from "@/app/actions/newsletter";
import { trackNewsletterSubscribed, type AnalyticsSurface } from "@/lib/analytics/track";

export function FooterNewsletter({
  surface = "footer",
}: {
  surface?: AnalyticsSurface;
} = {}) {
  const t = useTranslations("footer.newsletter");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const formData = new FormData(e.currentTarget);
    const result = await subscribeNewsletter(formData);
    setStatus(result.ok ? "success" : "error");
    if (result.ok) {
      e.currentTarget.reset();
      trackNewsletterSubscribed({ surface });
    }
  }

  return (
    <div className="w-full lg:max-w-md">
      <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/70">
        {t("title")}
      </p>
      <p className="mt-3 text-sm text-navy/80 leading-relaxed">{t("blurb")}</p>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2" aria-label={t("title")}>
        <label htmlFor="footer-newsletter" className="sr-only">
          {t("placeholder")}
        </label>
        <input
          id="footer-newsletter"
          name="email"
          type="email"
          required
          placeholder={t("placeholder")}
          className="flex-1 rounded-full bg-stone px-5 py-3 text-sm border border-navy/15 placeholder-navy/45 focus:outline-none focus:ring-2 focus:ring-navy"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="rounded-full bg-navy text-stone px-6 py-3 text-sm font-medium hover:bg-navy-700 transition-colors duration-200 disabled:opacity-60"
        >
          {t("submit")}
        </button>
      </form>
      {status === "success" ? (
        <p className="mt-2 text-xs text-olive">{t("success")}</p>
      ) : null}
      {status === "error" ? (
        <p className="mt-2 text-xs text-maroon">{t("error")}</p>
      ) : null}
    </div>
  );
}
