import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import { PropertyCard } from "@/components/home-card/PropertyCard";
import { destinations } from "@/lib/data";
import { getAllHomes } from "@/lib/data/server";
import type { Home } from "@/lib/data/types";

export async function SimilarHomes({ current }: { current: Home }) {
  const t = await getTranslations("homeDetail.similar");
  const homes = await getAllHomes();

  const similar = homes
    .filter((h) => h.slug !== current.slug)
    .map((h) => ({
      home: h,
      score:
        (h.destinationSlug === current.destinationSlug ? 4 : 0) +
        (Math.abs(h.pricing.nightlyEGP - current.pricing.nightlyEGP) < 1500 ? 2 : 0) +
        (h.type === current.type ? 2 : 0) +
        (h.capacity.bedrooms === current.capacity.bedrooms ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((entry) => entry.home);

  if (similar.length === 0) return null;

  return (
    <section className="bg-stone-100 py-20 lg:py-28">
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10">
        <Reveal as="header" className="mb-10 lg:mb-14 max-w-3xl">
          <h2 className="text-h2-mobile lg:text-h2 leading-tight tracking-tight-heading font-medium text-balance">
            {t("title")}
          </h2>
          <p className="mt-4 max-w-xl text-body-lg leading-relaxed text-navy/70 text-pretty">
            {t("subtitle")}
          </p>
        </Reveal>

        <Reveal variant="stagger">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {similar.map((h, i) => {
              const dest = destinations.find((d) => d.slug === h.destinationSlug);
              return (
                <Reveal key={h.slug} delay={i * 0.04}>
                  <PropertyCard home={h} destinationName={dest?.name} />
                </Reveal>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
