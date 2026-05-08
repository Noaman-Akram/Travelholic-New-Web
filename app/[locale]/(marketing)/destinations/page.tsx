import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";
import { Reveal } from "@/components/motion/Reveal";
import { DestinationsClient } from "@/components/destinations/DestinationsClient";

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "destinations" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function DestinationsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("destinations");

  return (
    <>
      <section className="bg-stone pt-12 lg:pt-20 pb-4">
        <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10">
          <Reveal as="header">
            <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55">
              {t("heroEyebrow")}
            </p>
            <h1 className="mt-6 text-h1-mobile lg:text-h1 font-medium tracking-tight-heading leading-tight text-balance max-w-4xl">
              {t("heroHeadline")}
            </h1>
            <p className="mt-6 max-w-2xl text-body-lg leading-relaxed text-navy/75 text-pretty">
              {t("heroSubline")}
            </p>
          </Reveal>
        </div>
      </section>

      <DestinationsClient />
    </>
  );
}
