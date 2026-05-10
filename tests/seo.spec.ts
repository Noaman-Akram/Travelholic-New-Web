import { test, expect } from "@playwright/test";

/**
 * SEO + structured data — the things ad/marketing platforms rely on
 * and that are easy to break with a bad copy edit.
 */

test.describe("SEO + JSON-LD", () => {
  test("home page has Organization + WebSite + FAQPage JSON-LD", async ({ page }) => {
    const resp = await page.goto("/en", { waitUntil: "domcontentloaded" });
    expect(resp?.ok()).toBeTruthy();

    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    const types = ld.flatMap((s) => {
      try {
        const parsed = JSON.parse(s);
        return Array.isArray(parsed) ? parsed.map((p) => p["@type"]) : [parsed["@type"]];
      } catch {
        return [];
      }
    });
    expect(types).toEqual(expect.arrayContaining(["Organization", "WebSite", "FAQPage"]));
  });

  test("home detail has LodgingBusiness + BreadcrumbList", async ({ page }) => {
    await page.goto("/en/homes/queen-1br-apt-mokkatam");
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    const blob = ld.join("\n");
    expect(blob).toContain("LodgingBusiness");
    expect(blob).toContain("BreadcrumbList");
  });

  test("contact page has LocalBusiness with real address + phone", async ({ page }) => {
    await page.goto("/en/contact");
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    const blob = ld.join("\n");
    expect(blob).toContain("LocalBusiness");
    expect(blob).toContain("220B, South Academy, New Cairo");
    expect(blob).toMatch(/\+?20.?111.?222.?0844/);
    expect(blob).toContain("hello@travelholiceg.com");
  });

  test("OG metadata present on home + home detail", async ({ page }) => {
    for (const path of ["/en", "/en/homes/queen-1br-apt-mokkatam"]) {
      await page.goto(path);
      await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
      await expect(page.locator('meta[property="og:description"]')).toHaveCount(1);
      await expect(page.locator('meta[property="og:type"]')).toHaveCount(1);
    }
  });

  test("hreflang alternates present on home", async ({ page }) => {
    await page.goto("/en");
    const en = page.locator('link[rel="alternate"][hreflang="en"]');
    const ar = page.locator('link[rel="alternate"][hreflang="ar"]');
    const xDefault = page.locator('link[rel="alternate"][hreflang="x-default"]');
    await expect(en).toHaveCount(1);
    await expect(ar).toHaveCount(1);
    await expect(xDefault).toHaveCount(1);
  });
});
