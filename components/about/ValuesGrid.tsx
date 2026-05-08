import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/Reveal";

type Value = { title: string; body: string };

export function ValuesGrid() {
  const t = useTranslations("about.values");
  const items = (t.raw("items") as unknown as Value[]) ?? [];

  return (
    <section className="relative bg-stone py-20 lg:py-32">
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10">
        <Reveal as="header" className="mb-12 lg:mb-16 max-w-3xl">
          <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 text-h2-mobile lg:text-h2 leading-tight tracking-tight-heading font-medium text-balance">
            {t("title")}
          </h2>
        </Reveal>

        <Reveal variant="stagger">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
            {items.map((value, i) => (
              <Reveal key={i} className="flex flex-col">
                <span className="font-artistic italic text-3xl text-butter mb-6">
                  0{i + 1}
                </span>
                <h3 className="text-h3-mobile lg:text-h3 leading-tight tracking-tight-heading font-medium text-balance">
                  {value.title}
                </h3>
                <p className="mt-4 text-body-lg leading-relaxed text-navy/75 text-pretty">
                  {value.body}
                </p>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
