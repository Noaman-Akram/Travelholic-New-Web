import { test, expect } from "@playwright/test";

/**
 * Smoke: every public route returns 200, with no console errors or
 * uncaught exceptions, in both locales.
 */

const ROUTES = [
  "/",
  "/homes",
  "/destinations",
  "/destinations/lotus",
  "/destinations/auc",
  "/destinations/near-cfc",
  "/destinations/ninetieth-street",
  "/destinations/gg-buildings",
  "/destinations/gg-villas",
  "/destinations/nomads",
  "/experiences",
  "/stories",
  "/about",
  "/contact",
  "/app",
  "/privacy",
  "/terms",
];

for (const locale of ["en", "ar"] as const) {
  test.describe(`smoke — /${locale}`, () => {
    for (const route of ROUTES) {
      const path = `/${locale}${route === "/" ? "" : route}`;
      test(`${path} renders cleanly`, async ({ page }) => {
        const consoleErrors: string[] = [];
        const pageErrors: string[] = [];
        page.on("console", (msg) => {
          // Tolerate dev-mode hydration warnings; fail on real errors.
          if (msg.type() === "error" && !/hydration/i.test(msg.text())) {
            consoleErrors.push(msg.text());
          }
        });
        page.on("pageerror", (err) => pageErrors.push(err.message));

        const resp = await page.goto(path, { waitUntil: "domcontentloaded" });
        expect(resp?.status(), `HTTP status for ${path}`).toBeLessThan(400);

        // Page should have an <h1> (every route ships a hero).
        await expect(page.locator("h1").first()).toBeVisible({ timeout: 10_000 });

        // dir attribute matches the locale.
        const dir = await page.locator("html").getAttribute("dir");
        expect(dir).toBe(locale === "ar" ? "rtl" : "ltr");

        expect(consoleErrors, `console errors on ${path}`).toEqual([]);
        expect(pageErrors, `uncaught errors on ${path}`).toEqual([]);
      });
    }
  });
}
