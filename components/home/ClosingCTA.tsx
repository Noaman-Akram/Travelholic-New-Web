"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/Reveal";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { subscribeNewsletter } from "@/app/actions/newsletter";

export function ClosingCTA() {
  const t = useTranslations("home.closing");
  const tNl = useTranslations("footer.newsletter");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const formData = new FormData(e.currentTarget);
    const result = await subscribeNewsletter(formData);
    setStatus(result.ok ? "success" : "error");
    if (result.ok) e.currentTarget.reset();
  }

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim();
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello Travelholic — I'd like to book a stay.")}`
    : undefined;

  return (
    <section className="relative bg-navy text-stone py-24 lg:py-36 overflow-hidden">
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10">
        <Reveal as="header" className="max-w-5xl">
          <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-butter">
            {t("eyebrow")}
          </p>
          <h2 className="mt-4 text-display-mobile lg:text-display font-medium tracking-tight-display leading-[1.05] text-balance">
            {t("title")}{" "}
            <span className="text-butter font-artistic italic">{t("titleAccent")}</span>
          </h2>
          <p className="mt-8 max-w-2xl text-body-lg leading-relaxed text-stone/80 text-pretty">
            {t("subtitle")}
          </p>
        </Reveal>

        <Reveal className="mt-12 flex flex-col sm:flex-row gap-3">
          <Button asChild variant="accent" size="lg">
            <Link href="/homes">{t("primaryCta")}</Link>
          </Button>
          {whatsappHref ? (
            <Button asChild variant="ghost" size="lg" className="border-stone/40 text-stone hover:bg-stone/10">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                {t("secondaryCta")}
              </a>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="lg"
              className="border-stone/40 text-stone/70 hover:bg-stone/5 cursor-not-allowed"
              aria-disabled
              onClick={(e) => e.preventDefault()}
            >
              {t("secondaryCta")}
            </Button>
          )}
        </Reveal>

        <Reveal className="mt-16 lg:mt-20 max-w-xl">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2" aria-label={tNl("title")}>
            <label htmlFor="closing-newsletter" className="sr-only">
              {tNl("placeholder")}
            </label>
            <input
              id="closing-newsletter"
              name="email"
              type="email"
              required
              placeholder={tNl("placeholder")}
              className="flex-1 rounded-full bg-stone/10 border border-stone/20 px-5 py-3 text-sm text-stone placeholder-stone/55 focus:outline-none focus:ring-2 focus:ring-butter focus:border-butter"
            />
            <button
              type="submit"
              disabled={status === "submitting"}
              className="rounded-full bg-butter text-navy px-6 py-3 text-sm font-medium hover:bg-butter-300 transition-colors disabled:opacity-60"
            >
              {tNl("submit")}
            </button>
          </form>
          {status === "success" ? (
            <p className="mt-3 text-sm text-butter">{tNl("success")}</p>
          ) : null}
          {status === "error" ? (
            <p className="mt-3 text-sm text-stone/85">{tNl("error")}</p>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
