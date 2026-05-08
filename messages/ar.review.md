# Arabic copy review checklist

> All AR strings in `ar.json` are best-effort translations and **must be reviewed by a native speaker before launch**. This file lists the open items.

## High-priority strings to review

### Brand voice
- [ ] `common.tagline` — "بيوت لا غرف" (homes not rooms). Concierge tone. Confirm idiomatic.
- [ ] `home.heroSubline` — Confirm "هروبات الصحراء" reads naturally for Egyptian audience (vs more standard "وجهات صحراوية").
- [ ] `footer.tagline` — "احجز معنا مباشرة، دائمًا." Tone check.
- [ ] `whatsapp.tooltip` — "نردّ في دقائق". Casual but professional.

### CTAs
- [ ] `nav.book` — "احجز مباشرة". Verb-first per voice rules. Consider "احجز الآن" alternative.
- [ ] `whatsapp.ctaPrimary` — "احجز عبر واتساب". Confirm.
- [ ] `errors.notFound.primaryCta` — "العودة إلى البيوت".

### Identity
- [ ] **Brand spelling**: All AR uses `تراڤل هوليك` (with ڤ). Confirmed against designer's stamps.
- [ ] `errors.notFound.title` — "هذا البيت لم يعد متاحًا." Tone check (we used "بيت" / home, not "غرفة" / room — consistent with vocabulary lock).

### Egypt-specific FAQ (Phase 2)
- [ ] All eight Egypt-specific FAQ items will be added in Phase 2 — flag for native review at that point.

### Numerical / cultural
- [ ] `footer.rights` — "{year} ترافل هوليك" — note the body uses `ترافل` (with ف) here while the brand uses `تراڤل` (with ڤ). Verify which feels right for legal/copyright line. May want to standardize on `تراڤل هوليك` everywhere.
- [ ] EGP currency label "ج.م" vs "جنيه مصري" — confirm preferred.

## General review pass

When a native reviewer goes through `ar.json`, look for:
1. Tone consistency — concierge, not startup. No corporate stiffness, no over-casual slang.
2. Banned phrases (EN equivalents): the EN voice rules forbid *seamless · revolutionary · cutting-edge · elevate · unlock · unparalleled* — equivalent AR clichés to avoid: *تجربة استثنائية، نقلة نوعية، نرتقي بإقامتك، نطلق العنان*.
3. Diacritics — generally avoid except where needed for clarity (we've added shadda/sukun where it helps reading).
4. Number rendering — verify EGP/USD currency labels render properly with our formatPrice util in `lib/utils/formatPrice.ts`.
