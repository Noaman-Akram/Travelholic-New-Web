import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";
import type { AppLocale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "appPage" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function AppLandingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("appPage");
  return (
    <PagePlaceholder
      eyebrow="App"
      heading={t("heroHeadline")}
      body={t("phasePlaceholder")}
      locale={locale}
    />
  );
}
