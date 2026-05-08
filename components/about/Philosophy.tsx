import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/Reveal";
import { StampDivider } from "@/components/brand/StampDivider";

export function Philosophy() {
  const t = useTranslations("about.philosophy");
  return (
    <section className="relative bg-navy text-stone py-24 lg:py-36">
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10">
        <Reveal as="header" className="text-center max-w-4xl mx-auto">
          <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-butter">
            {t("eyebrow")}
          </p>
          <h2 className="mt-6 text-h2-mobile lg:text-display font-medium tracking-tight-display leading-[1.05] text-balance">
            {t("title")}
          </h2>
          <StampDivider tone="stone" className="my-10 lg:my-14 mx-auto max-w-md" />
          <p className="text-h4-mobile lg:text-h3 leading-relaxed text-stone/80 text-pretty font-normal">
            {t("body")}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
