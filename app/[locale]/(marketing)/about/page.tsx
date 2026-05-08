import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";
import { AboutHero } from "@/components/about/AboutHero";
import { FounderNote } from "@/components/about/FounderNote";
import { ValuesGrid } from "@/components/about/ValuesGrid";
import { Philosophy } from "@/components/about/Philosophy";
import { Timeline } from "@/components/about/Timeline";
import { StatsStrip } from "@/components/about/StatsStrip";
import { TeamGrid } from "@/components/about/TeamGrid";
import { CareersCard } from "@/components/about/CareersCard";

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <AboutHero />
      <FounderNote />
      <ValuesGrid />
      <Philosophy />
      <Timeline />
      <StatsStrip />
      <TeamGrid locale={locale} />
      <CareersCard />
    </>
  );
}
