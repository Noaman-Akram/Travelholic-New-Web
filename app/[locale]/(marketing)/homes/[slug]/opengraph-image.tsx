import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getDestinationBySlug } from "@/lib/data";
import { getAllHomes } from "@/lib/data/server";
import type { AppLocale } from "@/i18n/routing";

// Edge can't import server-only modules cleanly; nodejs is fast enough
// since OG images are cached aggressively at the edge anyway.
export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export const alt = "Travelholic home";

const STONE = "#EFEDE5";
const NAVY = "#00273E";
const BUTTER = "#F2E6B7";

export default async function HomeOgImage({
  params,
}: {
  params: { locale: AppLocale; slug: string };
}) {
  const all = await getAllHomes();
  const home = all.find((h) => h.slug === params.slug);
  if (!home) notFound();
  const destination = getDestinationBySlug(home.destinationSlug);
  const isAr = params.locale === "ar";

  const title = home.title[params.locale];
  const destLabel = destination
    ? `${destination.name[params.locale]} · ${destination.areaName[params.locale]}`
    : home.destinationSlug;
  const priceLabel = `${home.pricing.nightlyEGP.toLocaleString()} EGP / ${isAr ? "ليلة" : "night"}`;
  const otaLabel = home.pricing.otaPriceEGP
    ? `${home.pricing.otaPriceEGP.toLocaleString()} EGP ${isAr ? "على Airbnb" : "on Airbnb"}`
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          background: STONE,
          color: NAVY,
          direction: isAr ? "rtl" : "ltr",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Left: image-ish (we use a colored panel; runtime can't fetch external picsum reliably) */}
        <div
          style={{
            width: "44%",
            background: NAVY,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg viewBox="0 0 100 140" width="180" height="252" fill={STONE}>
            <rect x="30" y="20" width="40" height="40" rx="1" />
            <path d="M 36 60 H 64 L 80 120 H 20 Z" />
          </svg>
        </div>

        {/* Right: text */}
        <div
          style={{
            width: "56%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px 56px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <span
              style={{
                fontSize: 18,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: `${NAVY}AA`,
              }}
            >
              {destLabel}
            </span>
            <h1
              style={{
                fontSize: 64,
                lineHeight: 1.08,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              {title}
            </h1>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                alignSelf: "flex-start",
                padding: "10px 22px",
                borderRadius: 9999,
                background: BUTTER,
                fontSize: 28,
                fontWeight: 600,
                color: NAVY,
              }}
            >
              {priceLabel}
            </div>
            {otaLabel ? (
              <span
                style={{
                  fontSize: 18,
                  color: `${NAVY}80`,
                  textDecoration: "line-through",
                }}
              >
                {otaLabel}
              </span>
            ) : null}

            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 16 }}>
              <svg viewBox="0 0 100 140" width="40" height="56" fill={NAVY}>
                <rect x="30" y="20" width="40" height="40" rx="1" />
                <path d="M 36 60 H 64 L 80 120 H 20 Z" />
              </svg>
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                }}
              >
                {isAr ? "تراڤل هوليك" : "TRAVELHOLIC"}
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
