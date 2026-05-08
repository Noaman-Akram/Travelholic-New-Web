import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";
import type { AppLocale } from "@/i18n/routing";
import { getDestinationBySlug, destinations } from "@/lib/data";

type Props = { params: Promise<{ locale: AppLocale; slug: string }> };

export function generateStaticParams() {
  // Phase 1: pre-render the six destination detail pages per locale at build time.
  return destinations.flatMap((d) =>
    (["en", "ar"] as const).map((locale) => ({ locale, slug: d.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const destination = getDestinationBySlug(slug);
  if (!destination) return {};
  const t = await getTranslations({ locale, namespace: "destinationDetail" });
  const name = destination.name[locale];
  return {
    title: t("metaTitle", { name }),
    description: t("metaDescription", { name }),
  };
}

export default async function DestinationDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const destination = getDestinationBySlug(slug);
  if (!destination) notFound();
  const t = await getTranslations("destinationDetail");
  const name = destination.name[locale];
  const pitch = destination.shortPitch[locale];
  return (
    <PagePlaceholder
      eyebrow={`Destination · ${name}`}
      heading={name}
      body={`${pitch} — ${t("phasePlaceholder")}`}
      locale={locale}
    />
  );
}
