import type { MetadataRoute } from "next";
import { destinations, stories } from "@/lib/data";
import { getAllHomes } from "@/lib/data/server";

const STATIC_PATHS = [
  "",
  "/about",
  "/destinations",
  "/homes",
  "/experiences",
  "/stories",
  "/contact",
  "/app",
  "/privacy",
  "/terms",
] as const;

const LOCALES = ["en", "ar"] as const;

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
}

function withAlternates(path: string): MetadataRoute.Sitemap[number]["alternates"] {
  const base = siteUrl();
  return {
    languages: {
      en: `${base}/en${path}`,
      ar: `${base}/ar${path}`,
      "x-default": `${base}/en${path}`,
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];
  const homes = await getAllHomes();

  for (const path of STATIC_PATHS) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${base}/${locale}${path}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: path === "" ? 1.0 : 0.8,
        alternates: withAlternates(path),
      });
    }
  }

  for (const d of destinations) {
    const path = `/destinations/${d.slug}`;
    for (const locale of LOCALES) {
      entries.push({
        url: `${base}/${locale}${path}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.85,
        alternates: withAlternates(path),
      });
    }
  }

  for (const h of homes) {
    const path = `/homes/${h.slug}`;
    for (const locale of LOCALES) {
      entries.push({
        url: `${base}/${locale}${path}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.9,
        alternates: withAlternates(path),
      });
    }
  }

  for (const s of stories) {
    const path = `/stories/${s.slug}`;
    for (const locale of LOCALES) {
      entries.push({
        url: `${base}/${locale}${path}`,
        lastModified: new Date(s.publishedAt),
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: withAlternates(path),
      });
    }
  }

  return entries;
}
