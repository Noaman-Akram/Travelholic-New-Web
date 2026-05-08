import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";
import { HomeHero } from "@/components/home/HomeHero";
import { FeaturedDestinations } from "@/components/home/FeaturedDestinations";
import { FeaturedHomes } from "@/components/home/FeaturedHomes";
import { WhyTravelholic } from "@/components/home/WhyTravelholic";
import { TechEnabledSection } from "@/components/home/TechEnabledSection";
import { TestimonialsLargeQuote } from "@/components/home/TestimonialsLargeQuote";
import { PartnerWall } from "@/components/home/PartnerWall";
import { StoriesStrip } from "@/components/home/StoriesStrip";
import { AppStripSection } from "@/components/home/AppStripSection";
import { ClosingCTA } from "@/components/home/ClosingCTA";
import { HomeFAQ } from "@/components/home/HomeFAQ";

type LocaleParams = { locale: AppLocale };

export async function generateMetadata({
  params,
}: {
  params: Promise<LocaleParams>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function HomePage({
  params,
}: {
  params: Promise<LocaleParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="-mt-16 lg:-mt-20">
      <HomeHero />
      <FeaturedDestinations />
      <FeaturedHomes />
      <WhyTravelholic />
      <TechEnabledSection />
      <TestimonialsLargeQuote />
      <PartnerWall locale={locale} />
      <StoriesStrip />
      <AppStripSection />
      <ClosingCTA />
      <HomeFAQ />
    </div>
  );
}
