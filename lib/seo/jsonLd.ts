import type { Destination, Home, Story } from "@/lib/data/types";
import type { AppLocale } from "@/i18n/routing";

const FALLBACK_SITE_URL = "http://localhost:3000";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? FALLBACK_SITE_URL;
}

function localeUrl(locale: AppLocale, path = ""): string {
  const base = siteUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}/${locale}${path ? cleanPath : ""}`;
}

export type JsonLdValue = Record<string, unknown>;

/**
 * Site-wide Organization markup. Embed once on the home page.
 */
export function organization(locale: AppLocale): JsonLdValue {
  const url = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${url}#organization`,
    name: "Travelholic",
    alternateName: locale === "ar" ? "تراڤل هوليك" : "Travelholic",
    url,
    logo: `${url}/brand/logo-light.png`,
    description:
      "Travelholic — premium serviced apartments across New Cairo and Golden Gates. Book direct, save vs OTAs.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Cairo",
      addressRegion: "Cairo Governorate",
      addressCountry: "EG",
    },
    sameAs: [],
  };
}

/**
 * WebSite for site name + search. Embed once on the home page.
 */
export function website(locale: AppLocale): JsonLdValue {
  const url = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url}#website`,
    url,
    name: "Travelholic",
    inLanguage: locale === "ar" ? "ar-EG" : "en-EG",
    publisher: { "@id": `${url}#organization` },
  };
}

/**
 * LodgingBusiness markup for a single Home.
 */
export function lodgingBusiness(
  home: Home,
  destination: Destination | undefined,
  locale: AppLocale,
): JsonLdValue {
  const url = localeUrl(locale, `/homes/${home.slug}`);
  const amenities = home.amenities.map((key) => ({
    "@type": "LocationFeatureSpecification",
    name: key,
    value: true,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "@id": url,
    name: home.title[locale],
    description: home.description[locale],
    url,
    image: home.gallery.slice(0, 6).map((g) => g.src),
    address: {
      "@type": "PostalAddress",
      addressLocality: destination?.areaName[locale] ?? "Cairo",
      addressRegion: "Cairo Governorate",
      addressCountry: "EG",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: home.coordinates.lat,
      longitude: home.coordinates.lng,
    },
    priceRange: priceRangeFor(home),
    starRating: { "@type": "Rating", ratingValue: home.rating.toFixed(1), bestRating: "5" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: home.rating.toFixed(1),
      reviewCount: home.reviewCount,
      bestRating: "5",
    },
    amenityFeature: amenities,
    review: home.reviews.slice(0, 3).map((r) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating.toFixed(1),
        bestRating: "5",
      },
      author: { "@type": "Person", name: r.guestName },
      reviewBody: r.text[locale],
      datePublished: r.date,
    })),
  };
}

/**
 * LocalBusiness for the contact page (different intent than LodgingBusiness).
 */
export function localBusiness(locale: AppLocale): JsonLdValue {
  const url = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${url}#contact`,
    name: "Travelholic",
    image: `${url}/brand/logo-light.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "220B, South Academy, New Cairo",
      addressLocality: "Cairo",
      addressRegion: "Cairo Governorate",
      addressCountry: "EG",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 30.0356762,
      longitude: 31.4281785,
    },
    email: "hello@travelholiceg.com",
    telephone: "+20 111 222 0844",
    url: localeUrl(locale, "/contact"),
    openingHours: "Mo,Tu,We,Th,Fr,Sa,Su 00:00-24:00",
  };
}

export type BreadcrumbItem = { name: string; href: string };

export function breadcrumbList(items: BreadcrumbItem[], locale: AppLocale): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: localeUrl(locale, item.href),
    })),
  };
}

export type FAQItem = { q: string; a: string };

export function faqPage(items: FAQItem[]): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function blogPosting(story: Story, locale: AppLocale): JsonLdValue {
  const url = localeUrl(locale, `/stories/${story.slug}`);
  const orgUrl = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: story.title[locale],
    description: story.excerpt[locale],
    image: story.cover,
    datePublished: story.publishedAt,
    dateModified: story.publishedAt,
    author: { "@id": `${orgUrl}#organization`, name: "Travelholic" },
    publisher: { "@id": `${orgUrl}#organization` },
    inLanguage: locale === "ar" ? "ar-EG" : "en-EG",
  };
}

function priceRangeFor(home: Home): string {
  const min = home.pricing.nightlyEGP;
  const ota = home.pricing.otaPriceEGP ?? min;
  const max = Math.max(min, ota);
  return `EGP ${min.toLocaleString()}–${max.toLocaleString()}`;
}
