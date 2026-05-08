import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import type { AppLocale } from "@/i18n/routing";
import {
  destinations,
  getDestinationBySlug,
  getHomesByDestination,
} from "@/lib/data";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/home-card/PropertyCard";
import { DestinationCard } from "@/components/home-card/DestinationCard";
import { StampDivider } from "@/components/brand/StampDivider";

type Props = { params: Promise<{ locale: AppLocale; slug: string }> };

export function generateStaticParams() {
  return destinations.flatMap((d) =>
    (["en", "ar"] as const).map((locale) => ({ locale, slug: d.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const destination = getDestinationBySlug(slug);
  if (!destination) return {};
  const t = await getTranslations({ locale, namespace: "destinationDetail" });
  const name = destination.name[locale];
  return {
    title: t("metaTitle", { name }),
    description: t("metaDescription", { name }),
  };
}

export default async function DestinationDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const destination = getDestinationBySlug(slug);
  if (!destination) notFound();

  const t = await getTranslations("destinationDetail");
  const tDest = await getTranslations("destinations");
  const homes = getHomesByDestination(destination.slug);
  const otherInArea = destinations
    .filter((d) => d.area === destination.area && d.slug !== destination.slug)
    .slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative h-[80vh] min-h-[520px] overflow-hidden bg-navy text-stone">
        <Image
          src={destination.heroImage}
          alt={destination.name[locale]}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/30 to-navy/40" />
        <div className="relative z-10 mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10 h-full flex flex-col justify-end pb-12 lg:pb-20">
          <Reveal>
            <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-stone/80">
              {destination.areaName[locale]}
            </p>
            <h1 className="mt-4 text-display-mobile lg:text-display font-medium tracking-tight-display leading-[1.05] text-balance max-w-4xl">
              {destination.name[locale]}
            </h1>
            <p className="mt-6 max-w-2xl text-body-lg leading-relaxed text-stone/85 text-pretty">
              {destination.shortPitch[locale]}
            </p>
            <div className="mt-8 flex flex-wrap items-baseline gap-x-6 gap-y-2 text-sm text-stone/85">
              <span className="text-stone">
                {tDest("homesIn", { count: destination.homeCount })}
              </span>
              <span aria-hidden="true" className="text-stone/30">·</span>
              <span>
                {tDest("from")} {destination.startingNightlyEGP.toLocaleString()} EGP
                {locale === "ar" ? "" : ""} / night
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Neighborhood */}
      <section className="bg-stone py-20 lg:py-32">
        <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10">
          <div className="grid grid-cols-12 gap-8 lg:gap-16">
            <Reveal as="header" className="col-span-12 lg:col-span-4">
              <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55">
                {t("neighborhood.title")}
              </p>
              <h2 className="mt-3 text-h2-mobile lg:text-h2 leading-tight tracking-tight-heading font-medium text-balance">
                {t("neighborhood.subtitle")}
              </h2>
            </Reveal>
            <Reveal className="col-span-12 lg:col-span-8">
              <p className="text-body-lg lg:text-h4-mobile leading-relaxed text-navy/80 text-pretty">
                {destination.longDescription[locale]}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <StampDivider tone="navy" className="mx-auto max-w-screen-md px-6" />

      {/* Stay here */}
      <section className="bg-stone py-20 lg:py-28">
        <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10">
          <Reveal as="header" className="mb-12 lg:mb-16 max-w-3xl">
            <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55">
              {t("stayHere.title")}
            </p>
            <h2 className="mt-3 text-h2-mobile lg:text-h2 leading-tight tracking-tight-heading font-medium text-balance">
              {destination.name[locale]} — {destination.homeCount > 1 ? t("stayHere.title") : t("stayHere.title")}
            </h2>
            <p className="mt-5 max-w-2xl text-body-lg leading-relaxed text-navy/70 text-pretty">
              {t("stayHere.subtitle")}
            </p>
          </Reveal>

          {homes.length > 0 ? (
            <Reveal variant="stagger">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {homes.map((h, i) => (
                  <Reveal key={h.slug} delay={i * 0.04}>
                    <PropertyCard home={h} destinationName={destination.name} />
                  </Reveal>
                ))}
              </div>
            </Reveal>
          ) : (
            <p className="text-body text-navy/65">No mock listings for this destination yet.</p>
          )}

          <Reveal className="mt-12">
            <Button asChild variant="ghost" size="lg">
              <Link href="/homes" className="inline-flex items-center gap-2">
                {t("viewAllInArea", { area: destination.areaName[locale] })}
                <ArrowUpRight className="h-4 w-4 rtl:scale-x-[-1]" />
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>

      {/* Other destinations in area */}
      {otherInArea.length > 0 ? (
        <section className="bg-stone-100 py-20 lg:py-28">
          <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10">
            <Reveal as="header" className="mb-10 lg:mb-12">
              <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55">
                {destination.areaName[locale]}
              </p>
              <h2 className="mt-3 text-h3-mobile lg:text-h3 leading-tight tracking-tight-heading font-medium">
                Also in {destination.areaName[locale]}
              </h2>
            </Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {otherInArea.map((d) => (
                <DestinationCard key={d.slug} destination={d} size="md" />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
