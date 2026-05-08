import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/Reveal";
import { FAQAccordion } from "@/components/property/FAQAccordion";

type FAQItem = { q: string; a: string };

export function HomeFAQ() {
  const t = useTranslations("home.faq");
  const items = (t.raw("items") as unknown as FAQItem[]) ?? [];

  return (
    <section className="relative bg-stone py-20 lg:py-32">
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid grid-cols-12 gap-8 lg:gap-16">
          <Reveal as="header" className="col-span-12 lg:col-span-4 lg:sticky lg:top-28 lg:self-start">
            <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55">
              {t("eyebrow")}
            </p>
            <h2 className="mt-3 text-h2-mobile lg:text-h2 leading-tight tracking-tight-heading font-medium text-balance">
              {t("title")}
            </h2>
            <p className="mt-5 max-w-md text-body-lg leading-relaxed text-navy/70 text-pretty">
              {t("subtitle")}
            </p>
          </Reveal>

          <Reveal className="col-span-12 lg:col-span-8">
            <FAQAccordion items={items} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
