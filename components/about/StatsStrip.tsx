import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/Reveal";

type Stat = { number: string; label: string };

export function StatsStrip() {
  const t = useTranslations("about.stats");
  const items = (t.raw("items") as unknown as Stat[]) ?? [];

  return (
    <section className="relative bg-stone py-16 lg:py-24 border-y border-navy/10">
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10">
        <Reveal>
          <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55 mb-10 lg:mb-14">
            {t("eyebrow")}
          </p>
        </Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-8">
          {items.map((stat, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div>
                <p className="text-display-mobile lg:text-display font-medium tracking-tight-display leading-[1.05] tabular-nums">
                  {stat.number}
                </p>
                <p className="mt-3 text-sm uppercase tracking-eyebrow text-navy/60">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
