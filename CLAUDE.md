---
project: Travelholic Website
locale: en, ar (RTL)
deployTarget: Vercel
---

# CLAUDE.md — Travelholic Website

> Project memory for Claude Code. Read first when entering a new session.
> The single business KPI: **shift bookings from OTAs (Airbnb, Booking.com) to direct.** Every decision serves that.

## 1. Stack (locked — do not add anything without asking)

- **Framework**: Next.js 15 (App Router, Server Components default, Server Actions for forms)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS + CSS variables, shadcn/ui
- **Motion**: Framer Motion (component-level), GSAP + ScrollTrigger (hero pin + 1–2 narrative pins only)
- **i18n**: next-intl, locale-routed `/en` and `/ar`
- **Forms**: Zod + React Hook Form + Server Actions
- **Maps**: Leaflet + React-Leaflet (OpenStreetMap, no key)
- **Icons**: lucide-react (no emoji as UI)
- **Date**: date-fns
- **Fonts**: next/font/local (self-hosted in `/public/fonts/`)

## 2. Brand tokens (locked — match Colors.pdf exactly)

| Role | Token | Hex |
|---|---|---|
| Surface light (default bg) | `stone` | `#EFEDE5` |
| Primary text / surface dark | `navy` | `#00273E` |
| Accent — depth | `maroon` | `#4A1212` |
| Accent — natural | `olive` | `#51553C` |
| Accent — warmth | `butter` | `#F2E6B7` |

Default theme = light editorial (Stone bg, Navy text). Dark variant = Navy bg, Stone text, Butter accents (used on Hero closer + booking dialog).

## 3. Identity

- **Name (EN)**: TRAVELHOLIC
- **Name (AR)**: تراڤل هوليك  *(uses ڤ — confirmed canonical, matches designer's stamps)*
- **Slogan**: *Homes Not Rooms* / *بيوت لا غرف*
- **Heritage anchor (secondary)**: *إكرام الضيف* (woven into About + experience pages, not splashed across home)
- **Vocabulary lock**: a property = **a Home** (never "unit," "property," "listing"); a booking = **a stay**; a guest = **a guest**

## 4. Typography (locked)

- **EN headings + body + accent**: Inter (self-hosted woff2, weights 400/500/600/700). Permanent — Dunbar Low and Dotcirful from the brief are commercial/Adobe-licensed and not licensed for self-hosting; user approved Inter as the standing choice.
- **EN artistic**: Playwrite CC TZ — italic flourishes only, never paragraphs (Google Fonts, self-host OK).
- **AR all weights**: Myriad Arabic (user provided `MyriadArabic-Regular.otf` → `/public/fonts/`); fallback `Noto Naskh Arabic`.

Type scale (rem; desktop / mobile): `display 5.5/4.0 · h1 3.75/2.75 · h2 2.75/2.0 · h3 2.0/1.5 · h4 1.5/1.25 · body-lg 1.125 · body 1.0 · small 0.875 · micro 0.75`. Line-height: display 1.05, headings 1.15, body 1.6. Letter-spacing: display -0.03em, headings -0.02em, eyebrows 0.18em uppercase.

## 5. Voice + copy rules

Concierge, not startup. Sentence case. CTAs verb-first, two words: *Book direct · See homes · Plan stay · Save vs OTA*.
- **Banned phrases**: *seamless · revolutionary · cutting-edge · elevate your stay · unlock · unparalleled*
- **No Lorem ipsum**, ever. Real copy or `// REVIEW: copy` placeholder.
- **All AR strings**: tag `// REVIEW: native-AR copy required` — initial AR is best-effort translation; native reviewer must approve before launch.

## 6. File conventions

- All copy in `/messages/{en,ar}.json` — **no hardcoded strings**. Grep on `/components/**` for English literals must return zero non-trivial hits.
- Tailwind: **logical properties only** — `ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`. Never `ml-`, `mr-`, `left-`, `right-`. ESLint rule enforces.
- Cards `rounded-2xl` to `rounded-3xl`, never sharp.
- Buttons: pill `rounded-full` with three variants — primary (Navy on Stone), ghost (Navy outline), accent (Butter on Navy).
- Hover: subtle `scale-[1.015]` + shadow lift; never garish.
- Easing token: `ease-out-expo` = `cubic-bezier(0.22, 1, 0.36, 1)`.
- Reveal-on-scroll: `whileInView` with `{ once: true, margin: "-15%" }`.
- All motion respects `prefers-reduced-motion`.

## 7. Anti-patterns — DO NOT produce

- Centered hero stack with two buttons (AI-startup default)
- Purple/blue gradients
- Glassmorphism stacks
- Generic stock photos of "diverse smiling people"
- Floating 3D blob shapes
- Emoji used as iconography
- Auto-rotating testimonial sliders (use Sonder large-quote pattern)

## 8. Environment

- **Node**: locally installed at `.tools/node/bin/` (project-local v20.18.1). All shell commands prepend `export PATH="/Users/rashadreda/Travelholic Website/.tools/node/bin:$PATH"` or use absolute paths.
- **Working dir**: `/Users/rashadreda/Travelholic Website`

## 9. Commit conventions

Conventional commits per phase:
- `feat: phase 1 — foundation, i18n, design system`
- `feat: phase 2 — marketing pages`
- `feat: phase 3 — booking surface`
- `feat: phase 4 — polish, seo, deploy`

Each phase ends with build + lint + typecheck all green.

## 10. Phase checklist

- [x] **Phase 0** — Bootstrap: Node installed locally, CLAUDE.md created
- [x] **Phase 1** — Foundation: Next.js 15.1.6 + Tailwind 3.4 + tokens + Inter (next/font/google) + Myriad Arabic (local) + i18n/RTL via next-intl 4 + brand components + 13 route stubs + 14 mock homes across 7 real destinations + branded 404/500 + WhatsApp FAB. `npm run build` ✓, `lint` ✓, `typecheck` ✓. dir flips correctly. Currency switch (EGP/USD) cookie-persistent. WhatsApp FAB renders `aria-disabled` until `NEXT_PUBLIC_WHATSAPP_NUMBER` is set.

  **Real Travelholic geography (locked from user 2026-05-09):**
  - **New Cairo** (area) → 4 destinations: Lotus (6 listings, near Mivida), AUC (6), Near CFC (3), 90th Street (8)
  - **Golden Gates** (area, on the Mokattam–Nasr City corridor) → 3 destinations: GG Buildings (15), GG Villas (2), Nomads (2)
  - **42 bookable listings** total across 7 destinations. `homeCount` = bookable listings (not total units). Mock data ships 14 representative listings.
- [x] **Phase 2** — Marketing pages shipped. Home (11 sections — Hero with WordReveal + inline booking widget, FeaturedDestinations asymmetric NC/GG groupings, FeaturedHomes scroll-snap with OTA savings strip, WhyTravelholic 4 pillars, TechEnabledSection with parallax phones, TestimonialsLargeQuote Sonder-style, PartnerWall, StoriesStrip, AppStripSection, ClosingCTA with newsletter, HomeFAQ with the 8 Egypt-specific items). About (8 sections — hero, founder note, values, philosophy, draw-on-scroll timeline, stats, team, careers). Destinations index (filter chips + Leaflet map with Travelholic-themed pins) + 7 destination detail pages. Experiences (8 cards). Stories index (category filter) + detail (prose-lg + related). Contact (Zod-validated form via Server Action + map embed + FAQ). App landing (3-phone hero + capabilities + FAQ). Newsletter Server Action wired in Footer + ClosingCTA + Story detail. All animations respect `prefers-reduced-motion`. Build/lint/typecheck green; smoke test of every route returns 200.
- [x] **Phase 3** — Booking surface shipped. Homes listing with sticky desktop filter rail + mobile filter Sheet, URL-synced state (dest/ci/co/g/br/p/a/ib/sort/view — shareable), 5-mode sort, grid/map toggle (Leaflet with Travelholic-pin Popups). Home detail page: 1-large+4-thumb gallery with full-screen lightbox (kbd nav + swipe rail), title block, OtaPriceCompareStrip (the wedge — direct vs OTA per-night + total savings over chosen nights), HomeHighlights chip row, description, categorized amenities grid with show-all dialog, Leaflet nearby map with category-iconed places, house rules, cancellation policy, reviews block (5-row score breakdown + paginated cards with source badges), 6-question Egypt FAQ, similar homes strip. Sticky right-rail booking widget on desktop with reactive `bookingMath.ts` (auto-applied weekly/monthly discounts); mobile bottom-bar opens full-screen Sheet with the same widget. 3-step BookingDialog: confirm → Zod-validated guest form → success with WhatsApp deep-link prefilled (home + dates + total + ref). POST /api/booking — Zod-validated, posts to `BOOKING_WEBHOOK_URL` when set, returns `{ok, ref}`. Build/lint/typecheck green; smoke test confirms /api/booking valid → `{ok,ref:"TH-..."}`, invalid → 400 with field errors.
- [x] **Phase 4** — Polish, SEO, deploy prep shipped. JSON-LD on all conversion-relevant pages (Organization + WebSite + FAQPage on home; LodgingBusiness + BreadcrumbList + FAQPage on home detail; BreadcrumbList on destination detail; BlogPosting + BreadcrumbList on story detail; LocalBusiness + FAQPage on contact). Dynamic `app/sitemap.ts` (~80 entries, both locales, hreflang per URL incl. x-default). Dynamic `app/robots.ts`. Edge-runtime per-page OG images (1200×630) for default + home detail + destination detail + story detail — brand-styled. Cookie consent banner (`TH_CONSENT` cookie) gates GA + Meta Pixel via `<Analytics>` — no third-party scripts inject until "Accept all". A11y: `aria-live` on testimonials carousel + contact form result. Bumped Next 15.1.6 → 15.1.12 (CVE-2025-66478 patched). README.md complete. Build/lint/typecheck green. Vercel deploy is a manual step — see README §"Deploy to Vercel".

After each phase: explicit user approval ("approved phase N, continue") before proceeding.

### Phase 1 deviations from brief (logged)

- Brief listed `next-intl` v3; we shipped v4 (App Router native, React 19 compatible). API patterns are equivalent.
- Brief listed `tailwind.config.ts` syntax; we shipped Tailwind 3.4 (which uses `tailwind.config.ts`). `create-next-app@latest` defaults to Tailwind 4 + Next 16; we explicitly downgraded `package.json` to Next 15.1.6 + Tailwind 3.4.17 to honor the locked stack.
- Playwrite CC TZ font deferred — not surfaced in Phase 1 (artistic font is for italic flourishes only, used in Phase 2 hero + closer). When Phase 2 starts, decide: ship Playwrite IT (closest free Google Fonts equivalent) or skip.
- Logo / KeyholeMark / StampOval are SVG recreations from the designer's PDFs. They're token-aware (accept `tone` prop). Final pixel-perfect SVG conversion of the bilingual oval lockup is a Phase 2 polish item (current `StampOval` uses `textPath` for arched text — looks decent but worth a vector-trace pass).
- Next.js 15.1.6 has a published security advisory (CVE-2025-66478). Bump to a patched 15.1.x or 15.2.x before Phase 4 deploy.
- ESLint installed at v8.57.1 (matches `eslint-config-next@15.1.6`). v8 is end-of-life per a deprecation warning during install. Acceptable for now; Phase 4 polish can revisit.

## 11. Known REVIEW items to track

- [ ] All AR strings — native review pre-launch (see `messages/ar.review.md`)
- [ ] Photography — currently picsum placeholders; real assets to be supplied
- [ ] Partner logos — placeholder logos with `// REVIEW: real partner logos required`
- [ ] `NEXT_PUBLIC_WHATSAPP_NUMBER` — placeholder until provided; FAB renders `aria-disabled` when unset
- [ ] `BOOKING_WEBHOOK_URL` — placeholder until MBN PMS integration

## 12. Egypt-specific FAQ (must include site-wide)

1. *Can I stay with my partner?* — Egyptian law: marriage cert required for Arab passport holders; non-Arab welcome without.
2. *Visitors allowed?* — Same-gender allowed; mixed-gender only 1st/2nd-degree relatives, otherwise public areas.
3. *Payment methods?* — Meeza, intl cards, bank transfer, EGP and USD.
4. *Long-stay pricing?* — Weekly + monthly auto-applied at booking.
5. *Pets?* — Per Home policy.
6. *Airport pickup?* — Available via Experiences.
7. *Wi-Fi/remote work?* — Fast fiber ≥100 Mbps, dedicated workspaces in most.
8. *Smart check-in?* — Mobile key via app + keypad backup.

## 13. Performance budgets (verified Phase 4)

- Lighthouse mobile: Performance ≥90 · A11y ≥95 · BP ≥95 · SEO ≥95
- LCP <2.5s · CLS <0.05 · INP <200ms
- All images via `next/image` with explicit `sizes`, `priority` only on hero, blurred placeholders
- WCAG 2.1 AA minimum
