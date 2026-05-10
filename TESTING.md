# Travelholic — testing playbook

Two tracks:
- **Automated** (Playwright) — covers what a machine can check reliably: route 200s, JSON-LD shape, dialog progression, API contracts.
- **Manual** (this checklist) — covers what only a human can judge: visual polish, AR copy reads naturally, real-device feel, edge cases of the booking + payment flow.

Run automation **first**, then walk the manual checklist on a fresh build.

---

## 1. Automated suite (Playwright)

### Prereq
The site must be running locally on `http://localhost:3000` (or set `PLAYWRIGHT_BASE_URL`).

```sh
# in one terminal
npm run dev          # or npm run build && npm run start for prod build

# in another
npx playwright test                       # all tests, both viewports
npx playwright test tests/smoke.spec.ts   # just route smoke
npx playwright test --project=chromium-desktop
npx playwright test --ui                  # interactive
```

### What's covered

| File | What it asserts |
|---|---|
| `tests/smoke.spec.ts` | Every public route in EN and AR returns 200, has an `<h1>`, sets `<html dir>` correctly, no console errors / page errors |
| `tests/booking.spec.ts` | Home detail renders, Reserve opens the dialog, step 1 → 2 progresses, step 2 form rejects invalid email |
| `tests/i18n.spec.ts` | EN ↔ AR locale switch flips `dir` + preserves the path; currency toggle sets `TH_CURRENCY` cookie |
| `tests/seo.spec.ts` | JSON-LD presence (Organization + WebSite + FAQPage on home, LodgingBusiness + BreadcrumbList on home detail, LocalBusiness on contact); OG metadata; hreflang alternates |
| `tests/api.spec.ts` | `GET /api/fx` returns usable rate; `/api/booking/quote` rejects missing params; `/api/booking` rejects malformed payloads |

---

## 2. Manual checklist

Walk this end-to-end **on a real phone** (iOS Safari + Android Chrome) and **a desktop browser** (Chrome + Safari) before each push to production.

### 2.1 First impression
- [ ] **Preloader** fires on first visit (clear cookies → reload `/en`). KeyholeMark + wordmark + "Homes Not Rooms" tagline fade in then out within ~2s. Does NOT show on subsequent reloads (cookie-gated).
- [ ] **Hero video / image** on home loads sharply, no LCP jank, no horizontal scrollbar.
- [ ] **Logo lockup** in navbar: SVG keyhole + wordmark same color, transparent, blends into hero. AR version uses Myriad Arabic (rounded calligraphic strokes).
- [ ] **Page transitions**: navigate between home → destinations → home detail — global fade/slide is smooth, no white flash.

### 2.2 Navigation + i18n
- [ ] Click "العربية" → URL becomes `/ar/...`, content + dir flip to RTL within ~300ms.
- [ ] Refresh after switching → locale persists (cookie).
- [ ] Click "English" → returns to LTR.
- [ ] **AR pages read naturally** — pause on each page (home, about, contact, home detail) and confirm AR copy isn't word-salad translation. Flag awkward phrasing in `messages/ar.review.md`.
- [ ] Currency toggle EGP ↔ USD updates all visible prices on the page (homes index, home detail).
- [ ] Refresh → currency persists.

### 2.3 Homes index
- [ ] Filter sidebar collapses on mobile (Sheet).
- [ ] Destination filter pills toggle correctly; URL `?dest=lotus,auc` is shareable.
- [ ] Date / guests / bedrooms / price / amenities filters narrow the list.
- [ ] Sort dropdown (recommended / price low / price high / rating / newest) works.
- [ ] Grid ↔ Map toggle: map shows 7 distinct district pins with correct counts. Click a pin → popup with district info + link to destination page.

### 2.4 Home detail
- [ ] Gallery: 1-large + 4-thumb layout. Click any photo → full-screen lightbox. Keyboard nav (← → Esc) works. Mobile: swipe rail.
- [ ] **OTA savings strip** shows your direct price vs the OTA price for the chosen nights, with total savings.
- [ ] Amenities grid renders icons + labels; "Show all" opens a modal listing categorised amenities.
- [ ] **Sticky booking widget** (desktop): dates / guests / nights / discounts / total update reactively; "Available · live quote" pill flips to "Unavailable" for unavailable dates.
- [ ] **Mobile bottom bar**: total + Reserve CTA always visible; opening the Sheet shows the same widget.
- [ ] WhatsApp FAB does NOT overlap the mobile reserve bar.
- [ ] Nearby places map: real OSM tiles, category-iconed pins, correct centering.
- [ ] Reviews block: score breakdown + paginated reviews + source badges (Airbnb, Booking.com, direct).
- [ ] FAQ accordion: 6 Egypt-specific items render + expand.

### 2.5 Booking + payment flow (Super Pay sandbox)
- [ ] Click Reserve → step 1 (Confirm your stay): home thumbnail + name + dest + dates + guests + EGP totals (3 nights + cleaning + total).
- [ ] Continue → step 2 (Tell us about you): first/last/email/phone/country/notes/terms checkbox all required.
- [ ] Form rejects: blank fields, invalid email, missing terms.
- [ ] Submit valid form → step 3 (Payment): EGP-only note + PCI DSS reassurance + "Continue to payment" CTA.
- [ ] Continue to payment → redirects to SuperPay hosted iframe at `merchant.super-pay.com/sp/pay/...`
- [ ] **Use the SuperPay sandbox card**: `5123450000000008`, expiry `01/39`, CVV `123`, name `test`.
- [ ] Successful payment → returns to `/booking/success?ref=...` — polling fetches status → shows the **Hostify confirmation code** (e.g. `THXXXXXX`) when `PAY_COMPLETED`.
- [ ] Reservation appears in your Hostify dashboard under "Direct" source within ~10s.
- [ ] **Cancel inside the iframe** → returns to `/booking/cancelled` — no Hostify reservation created, no charge.
- [ ] **Decline path**: try a known-bad card (any number that fails Luhn) — `/booking/cancelled` with failure copy.

### 2.6 Contact + footer
- [ ] Contact form submits via the Server Action; you see a confirmation pill.
- [ ] Phone link is clickable and opens dialer with `+20 111 222 0844`.
- [ ] Email link opens mail app with `hello@travelholiceg.com`.
- [ ] Map iframe shows the New Cairo office marker.
- [ ] Footer newsletter submit shows confirmation; no console error.

### 2.7 Performance + a11y
- [ ] Chrome Lighthouse mobile (incognito): Performance ≥90, A11y ≥95, BP ≥95, SEO ≥95.
- [ ] LCP < 2.5s, CLS < 0.05, INP < 200ms.
- [ ] Tab through the home page — focus rings visible, focus order logical.
- [ ] Skip-to-content link works (Tab on page load → Enter).
- [ ] Reduced motion: enable in OS → reload → preloader + page transitions are instant/static, no slide animation.
- [ ] Run axe / Wave on home + home detail — zero serious violations.

### 2.8 Regression sanity (do last)
- [ ] All 7 destination pages load with real Hostify photos as the hero (no picsum).
- [ ] FX rate visible in EGP totals is fresh (not the static fallback) — check `/api/fx` returns `source: "frankfurter"` or `er-api` (not `static-fallback`).
- [ ] Cookie consent banner shows on first visit, "Accept all" injects GA / Meta Pixel scripts only after consent. Reject → no third-party scripts in DevTools Network.

---

## 3. Pre-production gates

Before pushing `prod-merge` → `main`:

- [ ] `npm run build` clean
- [ ] `npm run lint` clean
- [ ] `npx playwright test` all green
- [ ] Manual checklist sections 2.1–2.4 + 2.5 (sandbox card path) walked on at least one real device
- [ ] No `// REVIEW:` comments touching user-facing copy that you haven't either addressed or accepted
- [ ] Production env vars confirmed set on the deploy target: `HOSTIFY_API_KEY`, `SUPERPAY_*` (LIVE values), `EGP_PER_USD_FALLBACK`, `NEXT_PUBLIC_WHATSAPP_NUMBER`

---

## 4. After deploy smoke

In the live production environment, before announcing:

- [ ] `/en` and `/ar` both return 200 over public DNS
- [ ] Make one real reservation with a real card for the smallest possible amount, then refund via Hostify dashboard. Confirm:
  - SuperPay charges + appears in your merchant portal
  - Hostify reservation lands with `accepted` status and correct guest details
  - Confirmation page shows the right ref
  - Refund flows back through both systems
- [ ] If analytics IDs are set: open GA4 DebugView and Meta Pixel Helper, confirm pageview + purchase events fire in real time
