import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";
import { HomesPageClient } from "@/components/homes/HomesPageClient";

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "homes" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function HomesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomesPageClient />;
}
