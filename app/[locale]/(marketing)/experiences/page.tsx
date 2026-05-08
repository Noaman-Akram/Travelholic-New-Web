import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";
import { experiences } from "@/lib/data";
import { Reveal } from "@/components/motion/Reveal";
import { ExperienceCard } from "@/components/home-card/ExperienceCard";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "experiences" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function ExperiencesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("experiences");

  return (
    <>
      <section className="bg-stone pt-12 lg:pt-20 pb-16 lg:pb-20">
        <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10">
          <Reveal as="header" className="max-w-4xl">
            <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55">
              {t("heroEyebrow")}
            </p>
            <h1 className="mt-6 text-h1-mobile lg:text-h1 font-medium tracking-tight-heading leading-tight text-balance">
              {t("heroHeadline")}
            </h1>
            <p className="mt-6 max-w-2xl text-body-lg leading-relaxed text-navy/75 text-pretty">
              {t("heroSubline")}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-stone pb-20 lg:pb-28">
        <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10">
          <Reveal variant="stagger">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
              {experiences.map((exp, i) => (
                <Reveal key={exp.slug} delay={i * 0.04}>
                  <ExperienceCard experience={exp} />
                </Reveal>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-navy text-stone py-24 lg:py-32">
        <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10 text-center">
          <Reveal as="header" className="max-w-3xl mx-auto">
            <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-butter">
              {t("closingEyebrow")}
            </p>
            <h2 className="mt-4 text-h1-mobile lg:text-h1 font-medium tracking-tight-display leading-[1.05] text-balance">
              {t("closingTitle")}
            </h2>
            <p className="mt-6 text-body-lg leading-relaxed text-stone/80 text-pretty">
              {t("closingBody")}
            </p>
            <div className="mt-10 flex justify-center">
              <Button asChild variant="accent" size="lg">
                <Link href="/contact">{t("closingCta")}</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
