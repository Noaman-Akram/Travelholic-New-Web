import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getStoryBySlug } from "@/lib/data";
import type { AppLocale } from "@/i18n/routing";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export const alt = "Travelholic story";

const STONE = "#EFEDE5";
const NAVY = "#00273E";
const BUTTER = "#F2E6B7";

const CATEGORY_LABELS: Record<string, { en: string; ar: string }> = {
  neighborhood: { en: "Neighborhood", ar: "الحيّ" },
  "local-culture": { en: "Local culture", ar: "ثقافة محلية" },
  "travel-tips": { en: "Travel tips", ar: "نصائح سفر" },
  "inside-travelholic": { en: "Inside Travelholic", ar: "من داخل تراڤل هوليك" },
};

export default async function StoryOgImage({
  params,
}: {
  params: { locale: AppLocale; slug: string };
}) {
  const story = getStoryBySlug(params.slug);
  if (!story) notFound();
  const isAr = params.locale === "ar";
  const title = story.title[params.locale];
  const cat = CATEGORY_LABELS[story.category]?.[params.locale] ?? story.category;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: STONE,
          color: NAVY,
          direction: isAr ? "rtl" : "ltr",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg viewBox="0 0 100 140" width="48" height="67" fill={NAVY}>
            <rect x="30" y="20" width="40" height="40" rx="1" />
            <path d="M 36 60 H 64 L 80 120 H 20 Z" />
          </svg>
          <span
            style={{
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            {isAr ? "حكايات" : "Stories"}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <span
            style={{
              fontSize: 18,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: `${NAVY}99`,
            }}
          >
            {cat} · {story.readMinutes} {isAr ? "د" : "min read"}
          </span>
          <h1
            style={{
              fontSize: 78,
              lineHeight: 1.1,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              margin: 0,
              maxWidth: "92%",
            }}
          >
            {title}
          </h1>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: NAVY,
            }}
          >
            {isAr ? "تراڤل هوليك" : "TRAVELHOLIC"}
          </span>
          <div
            style={{
              display: "inline-flex",
              padding: "10px 22px",
              borderRadius: 9999,
              background: BUTTER,
              fontSize: 18,
              fontWeight: 600,
              color: NAVY,
            }}
          >
            travelholic.com
          </div>
        </div>
      </div>
    ),
    size,
  );
}
