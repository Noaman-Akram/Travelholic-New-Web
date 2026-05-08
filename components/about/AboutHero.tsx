import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/Reveal";

export function AboutHero() {
  const t = useTranslations("about");
  return (
    <section className="relative bg-stone pt-16 lg:pt-24 pb-20 lg:pb-28 overflow-hidden">
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid grid-cols-12 gap-8">
          <Reveal as="header" className="col-span-12 lg:col-span-9">
            <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55">
              {t("heroEyebrow")}
            </p>
            <h1 className="mt-6 text-display-mobile lg:text-display font-medium tracking-tight-display leading-[1.05] text-balance">
              {t("heroHeadline")}
            </h1>
            <p className="mt-8 max-w-2xl text-body-lg lg:text-h4-mobile leading-relaxed text-navy/75 text-pretty">
              {t("heroSubline")}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
