# Travelholic — Website

A premium serviced-apartment site for Travelholic, operating in New Cairo and Golden Gates. The single business KPI: **shift bookings from OTAs (Airbnb, Booking.com) to direct.** Every design and engineering decision serves that.

Built with Next.js 15 + Tailwind 3 + next-intl 4. Bilingual (EN + AR with full RTL parity). Direct vs OTA price-compare strip front-and-centre on the home detail page.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15.1.12 (App Router, RSC, Server Actions) |
| Language | TypeScript strict |
| Styling | Tailwind 3.4 + CSS variables, shadcn/ui-style primitives |
| i18n | next-intl 4 (locale-routed `/en` and `/ar`) |
| Motion | Framer Motion 11 + GSAP 3 |
| Forms | Zod + React Hook Form |
| Maps | Leaflet + react-leaflet 5 (CARTO Light tiles, no API key) |
| Icons | lucide-react |
| Date | date-fns |
| Fonts | next/font (self-hosted at build time) |

## Brand tokens

```
stone   #EFEDE5    Surface light (default bg)
navy    #00273E    Primary text / surface dark
maroon  #4A1212    Accent — depth
olive   #51553C    Accent — natural
butter  #F2E6B7    Accent — warmth
```

Default theme is light editorial (Stone bg, Navy text). Dark variant (Navy bg, Stone text, Butter accents) used on the hero, closing CTA, philosophy callout, and the booking dialog.

## Folder structure

```
app/
  [locale]/
    (marketing)/    home, about, destinations, homes, experiences, stories, contact, app
    (legal)/        privacy, terms
    layout.tsx      locale-aware <html dir>, fonts, intl provider, currency provider, navbar, footer, FAB, cookie consent
    not-found.tsx   branded 404
    error.tsx       branded 500
    opengraph-image.tsx           default OG (1200×630)
  api/
    booking/route.ts             POST — Zod-validated lead webhook
  actions/
    newsletter.ts                Server Action
    contact.ts                   Server Action (Zod, field errors)
  sitemap.ts                     dynamic sitemap (both locales)
  robots.ts                      dynamic robots.txt
components/
  brand/        Logo, Wordmark, KeyholeMark (inline SVG, token-aware), StampDivider, StampOval
  layout/       Navbar, MobileMenu, LocaleSwitch, CurrencySwitch, Footer, FooterNewsletter, WhatsAppFab, PagePlaceholder
  home/         11 home-page sections (hero, featured destinations, why, tech, testimonials, partners, stories, app strip, closing, FAQ)
  about/        AboutHero, FounderNote, ValuesGrid, Philosophy, Timeline (draw-on-scroll), StatsStrip, TeamGrid, CareersCard
  destinations/ DestinationsClient (filter + map), DestinationsMap (Leaflet)
  homes/        useHomesFilters (URL state), HomesFilters, HomesTopBar, HomesGrid, HomesMap, HomesPageClient
  property/     HomeGalleryHero, HomeStickyBooking, HomeMobileBooking, BookingDialog (3-step), OtaPriceCompareStrip,
                HomeHighlights, HomeAmenitiesGrid, HomeNearbyMap, HomeReviews, SimilarHomes, FAQAccordion
  contact/      ContactForm
  stories/      StoriesClient
  motion/       Reveal, WordReveal (prefers-reduced-motion safe)
  legal/        CookieConsent
  analytics/    Analytics (gated by consent)
  seo/          JsonLd
  ui/           button, sheet, accordion (shadcn-style on Radix)
i18n/           routing.ts, request.ts, navigation.ts
lib/
  data/         types, destinations, homes, experiences, stories (bilingual mock data)
  motion/       easing tokens + variants
  utils/        cn, formatPrice (EGP/USD), bookingMath
  currency/     CurrencyContext (cookie-persisted)
  cookies/      consent
  seo/          jsonLd (Organization, LodgingBusiness, BreadcrumbList, FAQPage, BlogPosting, LocalBusiness)
messages/       en.json, ar.json, ar.review.md (native-AR review checklist)
public/
  fonts/        MyriadArabic-Regular.otf
  brand/        logo PNGs (placeholder + real on launch)
middleware.ts   next-intl locale middleware
tailwind.config.ts  brand tokens, type scale, easing, prose, no-scrollbar
```

## Locales + RTL

Every route lives under `app/[locale]/`. The locale layout sets `<html lang="…" dir="…">` based on the locale. **All copy** lives in `messages/{en,ar}.json`. The Arabic copy is best-effort — see [`messages/ar.review.md`](messages/ar.review.md) for the native-review checklist.

ESLint enforces logical Tailwind utilities (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`) outside `components/ui/**`. Physical utilities (`ml-`, `mr-`, `left-`, `right-`) trigger a warning so RTL parity stays honest.

## SEO

- **JSON-LD** on home (Organization + WebSite + FAQPage), home detail (LodgingBusiness + BreadcrumbList + FAQPage), destination detail (BreadcrumbList), story detail (BlogPosting + BreadcrumbList), contact (LocalBusiness + FAQPage). All builders in [`lib/seo/jsonLd.ts`](lib/seo/jsonLd.ts).
- **Sitemap.xml**: dynamic via `app/sitemap.ts`, both locales, `hreflang` alternates per URL, ~80 entries (10 static × 2 + 7 destinations × 2 + 14 homes × 2 + 6 stories × 2).
- **Robots.txt**: dynamic via `app/robots.ts`. Disallows `/api/` and `/_next/`. References the sitemap.
- **OG images** generated on the Edge runtime: root, home detail, destination detail, story detail. 1200×630, brand-styled with the keyhole mark + butter accent + locale-aware copy.
- **Per-page metadata**: title, description, canonical, hreflang (`en` + `ar` + `x-default`), OG, Twitter — all wired in `generateMetadata`.

## Booking flow

1. User picks dates + guests on the home detail sticky booking widget (or mobile bottom-bar).
2. Pricing math runs in [`lib/utils/bookingMath.ts`](lib/utils/bookingMath.ts) — auto-applies weekly (≥7 nights) or monthly (≥30 nights) discounts and computes savings vs OTA.
3. "Book direct" opens a 3-step Dialog: confirm → Zod-validated guest info → success.
4. The form posts to `POST /api/booking` (Zod-validated), which forwards to `BOOKING_WEBHOOK_URL` if set or logs locally.
5. Success returns `{ ok: true, ref: "TH-XXXX-YYYYY" }` and renders a WhatsApp deep-link prefilled with home + dates + guests + total + ref.

WhatsApp is a secondary CTA throughout — not a primary booking path. The OTA logos appear only as small social-proof badges on the home detail page.

## Animations

- All scroll reveals via shared `<Reveal>` wrapper — `whileInView` with `{ once: true, margin: "-15%" }`, fade-up default, 80ms stagger.
- Hero headline uses `<WordReveal>` for per-word mask reveal.
- Tech-enabled section uses Framer Motion `useScroll`/`useTransform` for parallax phone mockups.
- About timeline has a draw-on-scroll spine.
- Every motion entry checks `useReducedMotion()` and no-ops when the user prefers reduced motion.

## Accessibility

- Skip-to-content link in the layout.
- Focus rings: Navy on Stone surfaces, Butter on Navy surfaces (configured in `globals.css`).
- All forms have `<label>` associations and `role="status"` + `aria-live="polite"` on response messages.
- Carousel announcements use `aria-live="polite" aria-atomic="true"`.
- All images have meaningful `alt`. Lightbox has keyboard navigation (← → keys).

## Cookie consent + analytics

Custom on-tone banner in [`components/legal/CookieConsent.tsx`](components/legal/CookieConsent.tsx). Stores choice (`all` | `essential`) in `TH_CONSENT` cookie. Analytics scripts (Google Analytics + Meta Pixel) only inject after the user accepts non-essential cookies — see [`components/analytics/Analytics.tsx`](components/analytics/Analytics.tsx). Set `NEXT_PUBLIC_GA_ID` and `NEXT_PUBLIC_META_PIXEL_ID` to enable.

## Local development

This project ships with a local Node 20.18.1 install at `.tools/node/` (gitignored). Use the project's npm to keep the toolchain consistent:

```sh
# From the project root
.tools/node/bin/npm install
.tools/node/bin/npm run dev      # http://localhost:3000
.tools/node/bin/npm run build
.tools/node/bin/npm run start
.tools/node/bin/npm run lint
.tools/node/bin/npm run typecheck
```

If you have your own Node ≥20.18 on PATH, you can use plain `npm` instead.

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SITE_URL=https://travelholic.example
NEXT_PUBLIC_DEFAULT_LOCALE=en
NEXT_PUBLIC_WHATSAPP_NUMBER=20XXXXXXXXXX     # WhatsApp number (no leading +)
NEXT_PUBLIC_GA_ID=                           # Google Analytics — optional
NEXT_PUBLIC_META_PIXEL_ID=                   # Meta Pixel — optional
BOOKING_WEBHOOK_URL=                         # POST target for booking leads
NEWSLETTER_API_KEY=                          # Newsletter provider key
NEWSLETTER_LIST_ID=                          # Newsletter list ID
```

Until `NEXT_PUBLIC_WHATSAPP_NUMBER` is set, the WhatsApp FAB and "Reserve via WhatsApp" CTAs render `aria-disabled`. Until `BOOKING_WEBHOOK_URL` is set, booking leads log to the dev console only — they're not lost, but you'll need to read them from server logs.

## Deploy to Vercel

1. Push the project to a git remote (GitHub / GitLab / Bitbucket).
2. In the Vercel dashboard, create a new project and import the repo.
3. Build settings: Vercel auto-detects Next.js — defaults work. Output directory is `.next`. Install command: `npm install`. Build command: `next build`.
4. Set environment variables (see above). At minimum, `NEXT_PUBLIC_SITE_URL` should be the production domain.
5. Add the production domain in **Settings → Domains**.
6. After the first deploy, verify in production:
   - Both locales (`/en` and `/ar`) load with the right `<html dir>`.
   - Footer locale + currency switchers persist via cookies.
   - `/sitemap.xml` and `/robots.txt` render and contain the production URL.
   - `POST /api/booking` returns `{ ok, ref }` for a valid payload.
   - Cookie consent banner appears on first visit; analytics tags only fire after "Accept all".
   - OG images: open `<your-domain>/en/opengraph-image` in a browser to confirm.

Or via CLI:

```sh
npm i -g vercel
vercel link
vercel --prod
```

## Notable REVIEW items before launch

These are flagged in code with `// REVIEW:` comments and listed in [`messages/ar.review.md`](messages/ar.review.md):

- All AR copy is best-effort translation. Native review pass required.
- Brand spelling: AR uses `تراڤل هوليك` (with ڤ, matching the designer's stamps).
- Photography is `picsum.photos` placeholders. Real shoots replace these per home + destination.
- Founder portrait + team grid are `picsum` portraits. Replace with real photos.
- Partner wall is typographic placeholders (Hassan Allam, SODIC, Mivida, Palm Hills, etc.). Replace with real partner SVG marks when authorized.
- Hero is a Ken-Burns picsum image. Swap to a real muted MP4 loop in production.
- Phone mockups are SVG frames + picsum content. Swap to real product screenshots when the app exists.
- Reviews score breakdown is fabricated around `home.rating`. When real review data lands, swap in the actual breakdown.
- The OtaPriceCompareStrip footnote uses today's date as the comparison sample date. Phase-4-plus admin tooling should let operators set this per home.

## Phase log (project history)

- **Phase 1** — Foundation: stack, tokens, fonts, i18n/RTL, route stubs, mock data, branded errors, FAB. Real geography (NC + GG, 7 destinations, 42 listings) baked into mock data.
- **Phase 2** — Marketing: 11-section home page, About, Destinations index + 7 details, Experiences, Stories index + 6 details, Contact (Server Action), App landing.
- **Phase 3** — Booking surface: Homes listing with URL-synced filters + Leaflet map, Home detail (gallery, sticky widget, OtaPriceCompareStrip, similar), 3-step BookingDialog, `/api/booking` lead webhook.
- **Phase 4** — Polish & SEO: JSON-LD, sitemap, robots, hreflang, dynamic OG images, cookie consent + analytics gate, a11y polish, this README.

See `git log --oneline` for commit-level history.

## License

© 2026 Travelholic. All rights reserved.
