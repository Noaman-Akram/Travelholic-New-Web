import type { Metadata } from "next";
import { AlertCircle } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<{ ref?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "paymentResult" });
  return {
    title: t("failure.metaTitle"),
    description: t("failure.metaDescription"),
  };
}

export default async function SuperPayFailurePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { ref } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("paymentResult");

  return (
    <section className="mx-auto flex min-h-[70svh] max-w-screen-md flex-col items-center justify-center px-5 py-20 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-maroon/10 text-maroon">
        <AlertCircle className="h-7 w-7" />
      </div>
      <p className="mt-8 text-eyebrow font-medium uppercase tracking-eyebrow text-navy/55">
        {t("failure.eyebrow")}
      </p>
      <h1 className="mt-3 text-h2-mobile leading-tight tracking-tight-heading lg:text-h2">
        {t("failure.title")}
      </h1>
      <p className="mt-5 max-w-xl text-body-lg leading-relaxed text-navy/70">
        {t("failure.body")}
      </p>
      {ref ? (
        <p className="mt-8 inline-flex items-baseline gap-2 rounded-full bg-stone-100 px-4 py-2 text-xs uppercase tracking-eyebrow text-navy/65 ring-1 ring-navy/10">
          <span className="text-navy/45">{t("refLabel")}</span>
          <span className="font-mono text-navy">{ref}</span>
        </p>
      ) : null}
    </section>
  );
}
