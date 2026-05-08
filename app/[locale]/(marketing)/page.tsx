import { getTranslations, setRequestLocale } from "next-intl/server";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";
import type { AppLocale } from "@/i18n/routing";

type LocaleParams = { locale: AppLocale };

export default async function HomePage({
  params,
}: {
  params: Promise<LocaleParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  return (
    <PagePlaceholder
      eyebrow={t("heroEyebrow")}
      heading={t("heroHeadline")}
      body={`${t("heroSubline")} — ${t("phasePlaceholder")}`}
      locale={locale}
    />
  );
}
