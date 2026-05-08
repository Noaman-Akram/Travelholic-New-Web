import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/Reveal";
import { StampDivider } from "@/components/brand/StampDivider";

type Pillar = { number: string; title: string; body: string };

export function WhyTravelholic() {
  const t = useTranslations("home.why");
  // Cast through unknown because next-intl's t.raw isn't typed for arrays of objects.
  const pillars = (t.raw("pillars") as unknown as Pillar[]) ?? [];

  return (
    <section className="relative bg-stone py-20 lg:py-32">
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10">
        <Reveal as="header" className="mb-12 lg:mb-20 max-w-3xl">
          <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 text-h2-mobile lg:text-h2 leading-tight tracking-tight-heading font-medium text-balance">
            {t("title")}
          </h2>
        </Reveal>

        <div className="space-y-2 lg:space-y-4">
          {pillars.map((pillar, i) => (
            <div key={pillar.number}>
              <Reveal>
                <article className="grid grid-cols-12 gap-6 py-10 lg:py-14">
                  <div className="col-span-12 lg:col-span-2">
                    <span className="font-artistic italic text-h2-mobile lg:text-h2 text-navy/30 leading-none tabular-nums">
                      {pillar.number}
                    </span>
                  </div>
                  <h3 className="col-span-12 lg:col-span-5 text-h3-mobile lg:text-h3 leading-tight tracking-tight-heading font-medium text-balance">
                    {pillar.title}
                  </h3>
                  <p className="col-span-12 lg:col-span-5 text-body-lg leading-relaxed text-navy/75 text-pretty">
                    {pillar.body}
                  </p>
                </article>
              </Reveal>
              {i < pillars.length - 1 ? <StampDivider tone="navy" /> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
