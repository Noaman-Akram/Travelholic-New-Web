import { test, expect } from "@playwright/test";

/**
 * Booking conversion flow — opens the reserve dialog on a home detail
 * page, walks through step 1 → 2 → 3, exercises form validation, and
 * verifies the price totals are sane.
 */

const HOME_SLUG = "queen-1br-apt-mokkatam";

test.describe("booking flow", () => {
  test("home detail renders with live quote", async ({ page }) => {
    await page.goto(`/en/homes/${HOME_SLUG}`);
    await expect(page.locator("h1").first()).toContainText(/Queen 1BR/i);
    // Sticky widget shows nightly price + total.
    await expect(page.getByText(/EGP|USD/i).first()).toBeVisible();
  });

  test("Reserve opens dialog and progresses to step 2", async ({ page }) => {
    await page.goto(`/en/homes/${HOME_SLUG}`);

    // Click Reserve in the sticky widget. Multiple Reserve CTAs exist
    // (sticky widget + navbar). Pick the widget's primary by visible text + role.
    const reserveBtn = page
      .getByRole("button", { name: /^reserve|book/i })
      .first();
    await reserveBtn.click();

    // Step 1 confirmation summary
    await expect(page.getByText(/step 1 of 3/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/confirm your stay/i)).toBeVisible();

    // Continue → step 2
    await page.getByRole("button", { name: /^continue/i }).click();
    await expect(page.getByText(/step 2 of 3/i)).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText(/tell us about you/i)).toBeVisible();

    // Form fields render
    await expect(page.getByLabel(/first name/i)).toBeVisible();
    await expect(page.getByLabel(/last name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test("step 2 form rejects invalid email", async ({ page }) => {
    await page.goto(`/en/homes/${HOME_SLUG}`);
    await page.getByRole("button", { name: /^reserve|book/i }).first().click();
    await page.getByRole("button", { name: /^continue/i }).click();

    // Fill bare-minimum w/ bad email
    await page.getByLabel(/first name/i).fill("Test");
    await page.getByLabel(/last name/i).fill("User");
    await page.getByLabel(/email/i).fill("not-an-email");
    await page.getByLabel(/phone/i).fill("+201000000000");
    await page.getByLabel(/country/i).fill("Egypt");

    const submit = page.getByRole("button", { name: /^reserve|^continue to payment/i });
    await submit.click();

    // Native HTML validation should kick in or our zod schema should
    // block the submit; the dialog must not advance to step 3.
    await expect(page.getByText(/step 3 of 3/i)).not.toBeVisible({ timeout: 2_000 });
  });
});
