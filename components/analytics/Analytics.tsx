"use client";

import { useEffect } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useConsent } from "@/lib/cookies/consent";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const META_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

/**
 * Loads GA4 + Google Ads + Meta Pixel only after the user accepts non-essential
 * cookies. Until then, no third-party scripts are injected.
 *
 * Env vars (all NEXT_PUBLIC_*, all optional):
 *   - NEXT_PUBLIC_GA_ID                   GA4 Measurement ID `G-…`
 *   - NEXT_PUBLIC_META_PIXEL_ID           Meta Pixel ID (15–16 digits)
 *   - NEXT_PUBLIC_GOOGLE_ADS_ID           Google Ads ID `AW-…`
 *   - NEXT_PUBLIC_GOOGLE_ADS_BOOKING_LABEL Conversion label (used in track.ts)
 */
export function Analytics() {
  const { value } = useConsent();

  if (value !== "all") return null;
  if (!GA_ID && !META_ID && !ADS_ID) return null;

  const hasGtag = Boolean(GA_ID || ADS_ID);
  const gtagBootstrapId = GA_ID ?? ADS_ID;

  return (
    <>
      {hasGtag ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gtagBootstrapId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            ${GA_ID ? `gtag('config', '${GA_ID}', { anonymize_ip: true, send_page_view: true });` : ""}
            ${ADS_ID ? `gtag('config', '${ADS_ID}');` : ""}`}
          </Script>
        </>
      ) : null}

      {META_ID ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_ID}');fbq('track','PageView');`}
        </Script>
      ) : null}

      <RouteChangeTracker />
    </>
  );
}

/**
 * App Router doesn't fire a pageview on client-side navigation by default —
 * gtag.js and fbq both auto-track only the first paint. This component
 * listens to pathname + search changes and re-fires page_view / PageView.
 */
function RouteChangeTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const search = searchParams?.toString();
    const url = search ? `${pathname}?${search}` : pathname;

    if (GA_ID && window.gtag) {
      window.gtag("event", "page_view", {
        page_path: url,
        page_location: window.location.href,
        page_title: document.title,
      });
    }

    if (META_ID && window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [pathname, searchParams]);

  return null;
}
