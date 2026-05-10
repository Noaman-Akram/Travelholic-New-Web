/**
 * Typed analytics wrappers — fire to GA4, Meta Pixel, and Google Ads in one call.
 *
 * Every wrapper no-ops when:
 *   - SSR (no window)
 *   - Consent not granted (window.gtag / window.fbq absent → Analytics.tsx
 *     never injected the scripts)
 *   - The relevant ID env var is unset
 *
 * Call from client components only.
 */

type Currency = "EGP" | "USD";

export type AnalyticsSurface =
  | "fab"
  | "navbar"
  | "footer"
  | "closing-cta"
  | "booking-success"
  | "story"
  | "home-detail"
  | "homes-listing"
  | "destination";

const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
const ADS_BOOKING_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_BOOKING_LABEL;

function gtag(...args: unknown[]): void {
  if (typeof window === "undefined") return;
  window.gtag?.(...args);
}

function fbq(...args: unknown[]): void {
  if (typeof window === "undefined") return;
  window.fbq?.(...args);
}

export function trackBookingSubmitted(params: {
  ref: string;
  homeSlug: string;
  homeName?: string;
  hostifyId?: number;
  nights: number;
  totalEGP: number;
  currency: Currency;
  status: "lead" | "pending" | "accepted";
}): void {
  const { ref, homeSlug, homeName, hostifyId, nights, totalEGP, currency, status } = params;

  gtag("event", "purchase", {
    transaction_id: ref,
    value: totalEGP,
    currency,
    items: [
      {
        item_id: homeSlug,
        item_name: homeName ?? homeSlug,
        item_category: "stay",
        item_variant: hostifyId ? String(hostifyId) : undefined,
        quantity: nights,
        price: nights > 0 ? totalEGP / nights : totalEGP,
      },
    ],
    booking_status: status,
  });

  fbq("track", "Purchase", {
    value: totalEGP,
    currency,
    content_ids: [homeSlug],
    content_type: "product",
    contents: [{ id: homeSlug, quantity: nights }],
    num_items: nights,
  });

  if (ADS_ID && ADS_BOOKING_LABEL) {
    gtag("event", "conversion", {
      send_to: `${ADS_ID}/${ADS_BOOKING_LABEL}`,
      value: totalEGP,
      currency,
      transaction_id: ref,
    });
  }
}

export function trackBookingStarted(params: {
  homeSlug: string;
  homeName?: string;
  hostifyId?: number;
  surface: AnalyticsSurface;
}): void {
  const { homeSlug, homeName, hostifyId, surface } = params;

  gtag("event", "begin_checkout", {
    items: [
      {
        item_id: homeSlug,
        item_name: homeName ?? homeSlug,
        item_category: "stay",
        item_variant: hostifyId ? String(hostifyId) : undefined,
      },
    ],
    surface,
  });

  fbq("track", "InitiateCheckout", {
    content_ids: [homeSlug],
    content_type: "product",
  });
}

export function trackContactSubmitted(params: { intent?: string }): void {
  gtag("event", "generate_lead", {
    method: "contact_form",
    intent: params.intent,
  });
  fbq("track", "Lead", { content_name: "contact_form" });
}

export function trackNewsletterSubscribed(params: { surface: AnalyticsSurface }): void {
  gtag("event", "sign_up", { method: "newsletter", surface: params.surface });
  fbq("track", "Subscribe", { content_name: "newsletter", source: params.surface });
}

export function trackWhatsAppClicked(params: { surface: AnalyticsSurface }): void {
  gtag("event", "whatsapp_click", { surface: params.surface });
  fbq("track", "Contact", { method: "whatsapp", source: params.surface });
}
