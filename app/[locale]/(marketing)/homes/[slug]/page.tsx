import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";
import type { AppLocale } from "@/i18n/routing";
import { getHomeBySlug, homes } from "@/lib/data";

type Props = { params: Promise<{ locale: AppLocale; slug: string }> };

export function generateStaticParams() {
  return homes.flatMap((h) =>
    (["en", "ar"] as const).map((locale) => ({ locale, slug: h.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const home = getHomeBySlug(slug);
  if (!home) return {};
  const t = await getTranslations({ locale, namespace: "homeDetail" });
  const title = home.title[locale];
  return {
    title: t("metaTitle", { title }),
    description: t("metaDescription", { title }),
  };
}

export default async function HomeDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const home = getHomeBySlug(slug);
  if (!home) notFound();
  const t = await getTranslations("homeDetail");
  return (
    <PagePlaceholder
      eyebrow={`Home · ${home.destinationSlug}`}
      heading={home.title[locale]}
      body={`${home.description[locale]} — ${t("phasePlaceholder")}`}
      locale={locale}
    />
  );
}
