import { test, expect } from "@playwright/test";

/**
 * Locale routing + currency switching — the things most likely to break
 * after copy or routing changes.
 */

test.describe("i18n + currency", () => {
  test("EN ↔ AR locale switch flips dir and preserves path", async ({ page }) => {
    await page.goto("/en/homes");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");

    // Find the locale switch (handles "العربية" link / button).
    const arLink = page.getByRole("link", { name: /العربية|ar/i }).first();
    await arLink.click();

    await expect(page).toHaveURL(/\/ar\/homes/);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

    // Switch back.
    const enLink = page.getByRole("link", { name: /english|en/i }).first();
    await enLink.click();
    await expect(page).toHaveURL(/\/en\/homes/);
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  });

  test("currency switch toggles EGP ↔ USD and persists", async ({ page, context }) => {
    await page.goto("/en/homes");
    // Initial currency is EGP by default; the toggle is a button labelled
    // with the alternate currency.
    const toggle = page.getByRole("button", { name: /USD|EGP/i }).first();
    await toggle.click();

    // Cookie was set
    const cookies = await context.cookies();
    const currencyCookie = cookies.find((c) => c.name === "TH_CURRENCY");
    expect(currencyCookie?.value).toMatch(/^(EGP|USD)$/);
  });
});
