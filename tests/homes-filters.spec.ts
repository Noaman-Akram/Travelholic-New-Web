import { test, expect } from "@playwright/test";

test.describe("homes search and filters", () => {
  test("text search filters homes and keeps the URL in sync", async ({ page }) => {
    await page.goto("/en/homes");

    const search = page.getByRole("searchbox", { name: "Search homes" });
    await search.fill("ruby");

    await expect(page).toHaveURL(/\/en\/homes\?q=ruby$/);
    await expect(page.getByText("1 home")).toBeVisible();
    await expect(page.getByRole("link", { name: "The Ruby 1BR Apt" }).first()).toBeVisible();
  });

  test("legacy homepage search params still hydrate the homes filters", async ({ page }) => {
    await page.goto("/en/homes?destination=lotus&guests=4");

    await expect(page.getByRole("checkbox", { name: /Lotus/ })).toBeChecked();
    await expect(page.getByRole("combobox", { name: "Guests" })).toHaveValue("4");
    await expect(page.getByText("3 homes")).toBeVisible();
  });

  test("homepage booking widget navigates with filter params", async ({ page }) => {
    await page.goto("/en");

    await page.getByRole("combobox", { name: "Destination" }).selectOption("lotus");
    await page.getByRole("button", { name: "Find homes" }).click();

    await expect(page).toHaveURL(/\/en\/homes\?dest=lotus&ci=\d{4}-\d{2}-\d{2}&co=\d{4}-\d{2}-\d{2}&g=2$/);
    await expect(page.getByRole("checkbox", { name: /Lotus/ })).toBeChecked();
    await expect(page.getByRole("combobox", { name: "Guests" })).toHaveValue("2");
  });
});
