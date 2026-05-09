import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";
import { getDestinationBySlug } from "@/lib/data";
import { getHomeBySlug, getAllHomes, homesFallback } from "@/lib/data/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { HomeGalleryHero } from "@/components/property/HomeGalleryHero";
import { HomeStickyBooking } from "@/components/property/HomeStickyBooking";
import { HomeMobileBooking } from "@/components/property/HomeMobileBooking";
import { OtaPriceCompareStrip } from "@/components/property/OtaPriceCompareStrip";
import { HomeHighlights } from "@/components/property/HomeHighlights";
import { HomeAmenitiesGrid } from "@/components/property/HomeAmenitiesGrid";
import { HomeNearbyMap } from "@/components/property/HomeNearbyMap";
import { HomeReviews } from "@/components/property/HomeReviews";
import { SimilarHomes } from "@/components/property/SimilarHomes";
import { FAQAccordion } from "@/components/property/FAQAccordion";
import { JsonLd } from "@/components/seo/JsonLd";
import { lodgingBusiness, breadcrumbList, faqPage } from "@/lib/seo/jsonLd";

type Props = { params: Promise<{ locale: AppLocale; slug: string }> };
type FAQItem = { q: string; a: string };

export async function generateStaticParams() {
  // Pre-render all live Hostify homes at build time. Falls back to bundled
  // mock data when Hostify is unreachable (e.g. CI without an API key).
  const all = await getAllHomes();
  const list = all.length > 0 ? all : homesFallback;
  return list.flatMap((h) =>
    (["en", "ar"] as const).map((locale) => ({ locale, slug: h.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const home = await getHomeBySlug(slug);
  if (!home) return {};
  const t = await getTranslations({ locale, namespace: "homeDetail" });
  const title = home.title[locale];
  return {
    title: t("metaTitle", { title }),
    description: t("metaDescription", { title }),
  };
}

export default async function HomeDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const home = await getHomeBySlug(slug);
  if (!home) notFound();

  const destination = getDestinationBySlug(home.destinationSlug);
  const t = await getTranslations("homeDetail");
  const tStatus = await getTranslations("homeDetail.status");
  const tFaq = await getTranslations("home.faq");
  const faqItems = (tFaq.raw("items") as unknown as FAQItem[])?.slice(0, 6) ?? [];

  return (
    <>
      <JsonLd
        data={[
          lodgingBusiness(home, destination, locale),
          breadcrumbList(
            [
              { name: "Travelholic", href: "/" },
              { name: "Homes", href: "/homes" },
              {
                name: destination?.name[locale] ?? home.destinationSlug,
                href: `/destinations/${home.destinationSlug}`,
              },
              { name: home.title[locale], href: `/homes/${home.slug}` },
            ],
            locale,
          ),
          faqPage(faqItems),
        ]}
      />
      {/* Top: title + gallery */}
      <section className="bg-stone pt-6 pb-10 lg:pb-14">
        <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10">
          <Reveal>
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 mb-3">
              <Link
                href={`/destinations/${home.destinationSlug}`}
                className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55 hover:text-navy"
              >
                {destination?.name[locale] ?? home.destinationSlug}
                {destination ? ` · ${destination.areaName[locale]}` : null}
              </Link>
              {home.instantBook ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-butter px-3 py-1 text-[11px] uppercase tracking-eyebrow text-navy">
                  {tStatus("instantBook")}
                </span>
              ) : null}
            </div>

            <h1 className="text-h1-mobile lg:text-h1 leading-tight tracking-tight-heading font-medium text-balance max-w-4xl">
              {home.title[locale]}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-navy/70">
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-butter text-butter" />
                <span className="font-medium text-navy">{home.rating.toFixed(1)}</span>
                <span className="text-navy/55">·</span>
                <span>{home.reviewCount} reviews</span>
              </span>
              <span aria-hidden className="text-navy/30">·</span>
              <span>
                {home.capacity.guests} guests · {home.capacity.bedrooms} bed ·{" "}
                {home.capacity.beds} beds · {home.capacity.baths} bath
              </span>
            </div>
          </Reveal>

          <div className="mt-8">
            <HomeGalleryHero images={home.gallery} />
          </div>
        </div>
      </section>

      {/* Body: 12-col grid with sticky booking on right */}
      <section className="bg-stone pb-32 lg:pb-24">
        <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10">
          <div className="grid grid-cols-12 gap-10 lg:gap-16 items-start">
            {/* Main column */}
            <div className="col-span-12 lg:col-span-7 xl:col-span-8 space-y-14">
              {home.pricing.otaPriceEGP ? (
                <OtaPriceCompareStrip home={home} />
              ) : null}

              <HomeHighlights home={home} />

              <Reveal>
                <section>
                  <h2 className="text-h3-mobile lg:text-h3 leading-tight tracking-tight-heading font-medium mb-5">
                    {t("description")}
                  </h2>
                  <p className="text-body-lg leading-relaxed text-navy/80 text-pretty">
                    {home.description[locale]}
                  </p>
                </section>
              </Reveal>

              <Reveal>
                <HomeAmenitiesGrid home={home} />
              </Reveal>

              <Reveal>
                <HomeNearbyMap home={home} />
              </Reveal>

              <Reveal>
                <section>
                  <h3 className="text-h3-mobile lg:text-h3 leading-tight tracking-tight-heading font-medium mb-6">
                    {t("houseRules.title")}
                  </h3>
                  <ul className="space-y-2 text-body text-navy/80">
                    {home.houseRules[locale].map((rule, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-2 h-1 w-1 rounded-full bg-navy/40" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </Reveal>

              <Reveal>
                <section>
                  <h3 className="text-h3-mobile lg:text-h3 leading-tight tracking-tight-heading font-medium mb-4">
                    {t("cancellation.title")}
                  </h3>
                  <p className="text-body leading-relaxed text-navy/75 text-pretty max-w-2xl">
                    {t("cancellation.body")}
                  </p>
                </section>
              </Reveal>

              <HomeReviews home={home} />

              <Reveal>
                <section>
                  <h3 className="text-h3-mobile lg:text-h3 leading-tight tracking-tight-heading font-medium mb-6">
                    {t("faqTitle")}
                  </h3>
                  <FAQAccordion items={faqItems} />
                </section>
              </Reveal>
            </div>

            {/* Sticky booking column (desktop) */}
            <div className="hidden lg:block col-span-5 xl:col-span-4">
              <div className="sticky top-28">
                <HomeStickyBooking home={home} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <SimilarHomes current={home} />

      {/* Mobile sticky bottom bar */}
      <HomeMobileBooking home={home} />
    </>
  );
}
