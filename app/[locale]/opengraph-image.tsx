import { ImageResponse } from "next/og";
import type { AppLocale } from "@/i18n/routing";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export const alt = "Travelholic — Homes Not Rooms";

const STONE = "#EFEDE5";
const NAVY = "#00273E";
const BUTTER = "#F2E6B7";

export default async function OpengraphImage({
  params,
}: {
  params: { locale: AppLocale };
}) {
  const isAr = params.locale === "ar";
  const headline = isAr ? "بيوت لا غرف." : "Homes, not rooms.";
  const wordmark = isAr ? "تراڤل هوليك" : "TRAVELHOLIC";
  const dir = isAr ? "rtl" : "ltr";

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
          direction: dir,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Top: brand + keyhole mark */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg viewBox="0 0 100 140" width="56" height="78" fill={NAVY}>
            <rect x="30" y="20" width="40" height="40" rx="1" />
            <path d="M 36 60 H 64 L 80 120 H 20 Z" />
          </svg>
          <span
            style={{
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            {wordmark}
          </span>
        </div>

        {/* Middle: headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <p
            style={{
              fontSize: 18,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: `${NAVY}99`,
              margin: 0,
            }}
          >
            {isAr ? "شقق فندقية · القاهرة" : "Serviced apartments · Cairo"}
          </p>
          <h1
            style={{
              fontSize: 110,
              lineHeight: 1.05,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              margin: 0,
              maxWidth: "85%",
            }}
          >
            {headline}
          </h1>
        </div>

        {/* Bottom: chip strip + butter accent */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p style={{ fontSize: 24, color: `${NAVY}AA`, margin: 0 }}>
            {isAr ? "احجز مباشرة. وفّر مقابل المنصّات." : "Book direct. Save vs OTAs."}
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "14px 28px",
              borderRadius: 9999,
              background: BUTTER,
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
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
