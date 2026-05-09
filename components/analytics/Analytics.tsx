"use client";

import Script from "next/script";
import { useConsent } from "@/lib/cookies/consent";

/**
 * Loads GA + Meta Pixel only after the user accepts non-essential cookies.
 * Until then, no third-party scripts are injected.
 *
 * Set NEXT_PUBLIC_GA_ID and/or NEXT_PUBLIC_META_PIXEL_ID to enable.
 */
export function Analytics() {
  const { value } = useConsent();
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const metaId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  if (value !== "all") return null;

  return (
    <>
      {gaId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', { anonymize_ip: true });`}
          </Script>
        </>
      ) : null}

      {metaId ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaId}');fbq('track','PageView');`}
        </Script>
      ) : null}
    </>
  );
}
