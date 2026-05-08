import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/Reveal";
import { DestinationCard } from "@/components/home-card/DestinationCard";
import { Link } from "@/i18n/navigation";
import { destinations } from "@/lib/data";
import { ArrowUpRight } from "lucide-react";

export function FeaturedDestinations() {
  const t = useTranslations("home.destinations");

  // Asymmetric 7-card grid: split by area, with the 4 NC destinations visually grouped.
  const newCairo = destinations.filter((d) => d.area === "new-cairo");
  const goldenGates = destinations.filter((d) => d.area === "golden-gates");

  return (
    <section className="relative bg-stone py-20 lg:py-28">
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10">
        <Reveal as="header" className="mb-12 lg:mb-16 max-w-3xl">
          <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 text-h2-mobile lg:text-h2 leading-tight tracking-tight-heading font-medium text-balance">
            {t("title")}
          </h2>
          <p className="mt-5 max-w-2xl text-body-lg leading-relaxed text-navy/70 text-pretty">
            {t("subtitle")}
          </p>
        </Reveal>

        {/* New Cairo block */}
        <Reveal variant="stagger" className="mb-12 lg:mb-16">
          <div className="flex items-baseline justify-between mb-5">
            <h3 className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/60">
              {t("newCairo")}
            </h3>
            <Link
              href="/destinations"
              className="inline-flex items-center gap-1.5 text-sm text-navy/70 hover:text-navy transition-colors"
            >
              <span>All</span>
              <ArrowUpRight className="h-3.5 w-3.5 rtl:scale-x-[-1]" />
            </Link>
          </div>
          <div className="grid grid-cols-12 gap-5 lg:gap-6">
            {newCairo[0] && (
              <Reveal className="col-span-12 lg:col-span-6">
                <DestinationCard destination={newCairo[0]} size="lg" />
              </Reveal>
            )}
            <div className="col-span-12 lg:col-span-6 grid grid-cols-2 gap-5 lg:gap-6">
              {newCairo.slice(1, 4).map((d, i) => (
                <Reveal
                  key={d.slug}
                  className={i === 0 ? "col-span-2" : "col-span-1"}
                  delay={(i + 1) * 0.06}
                >
                  <DestinationCard destination={d} size="md" />
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Golden Gates block */}
        <Reveal variant="stagger">
          <div className="flex items-baseline justify-between mb-5">
            <h3 className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/60">
              {t("goldenGates")}
            </h3>
            <Link
              href="/destinations"
              className="inline-flex items-center gap-1.5 text-sm text-navy/70 hover:text-navy transition-colors"
            >
              <span>All</span>
              <ArrowUpRight className="h-3.5 w-3.5 rtl:scale-x-[-1]" />
            </Link>
          </div>
          <div className="grid grid-cols-12 gap-5 lg:gap-6">
            {goldenGates.map((d, i) => (
              <Reveal
                key={d.slug}
                className={i === 0 ? "col-span-12 lg:col-span-6" : "col-span-12 sm:col-span-6 lg:col-span-3"}
                delay={i * 0.06}
              >
                <DestinationCard destination={d} size={i === 0 ? "lg" : "md"} />
              </Reveal>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
