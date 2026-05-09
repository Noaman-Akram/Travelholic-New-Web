import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getDestinationBySlug } from "@/lib/data";
import type { AppLocale } from "@/i18n/routing";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export const alt = "Travelholic destination";

const STONE = "#EFEDE5";
const NAVY = "#00273E";
const BUTTER = "#F2E6B7";

export default async function DestinationOgImage({
  params,
}: {
  params: { locale: AppLocale; slug: string };
}) {
  const dest = getDestinationBySlug(params.slug);
  if (!dest) notFound();
  const isAr = params.locale === "ar";
  const name = dest.name[params.locale];
  const area = dest.areaName[params.locale];
  const pitch = dest.shortPitch[params.locale];
  const homesLabel = `${dest.homeCount} ${isAr ? "بيت" : "homes"}`;

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
          background: NAVY,
          color: STONE,
          direction: isAr ? "rtl" : "ltr",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg viewBox="0 0 100 140" width="48" height="67" fill={STONE}>
            <rect x="30" y="20" width="40" height="40" rx="1" />
            <path d="M 36 60 H 64 L 80 120 H 20 Z" />
          </svg>
          <span
            style={{
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: `${STONE}CC`,
            }}
          >
            {isAr ? "تراڤل هوليك" : "TRAVELHOLIC"}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <span
            style={{
              fontSize: 18,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: BUTTER,
            }}
          >
            {area}
          </span>
          <h1
            style={{
              fontSize: 110,
              lineHeight: 1.05,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            {name}.
          </h1>
          <p
            style={{
              fontSize: 26,
              lineHeight: 1.5,
              maxWidth: "75%",
              margin: 0,
              color: `${STONE}CC`,
            }}
          >
            {pitch}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "12px 26px",
              borderRadius: 9999,
              background: BUTTER,
              fontSize: 22,
              fontWeight: 600,
              color: NAVY,
            }}
          >
            {homesLabel}
          </div>
          <span style={{ fontSize: 18, color: `${STONE}99`, letterSpacing: "0.16em", textTransform: "uppercase" }}>
            travelholic.com
          </span>
        </div>
      </div>
    ),
    size,
  );
}
