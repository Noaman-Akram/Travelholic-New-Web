import { test, expect } from "@playwright/test";

/**
 * API smoke — pure HTTP tests, no browser. Verifies the booking +
 * payment + FX endpoints don't regress on shape.
 */

test.describe("API endpoints", () => {
  test("GET /api/fx returns a usable EGP-per-USD rate", async ({ request }) => {
    const r = await request.get("/api/fx");
    expect(r.ok()).toBeTruthy();
    const body = await r.json();
    expect(body).toHaveProperty("rate");
    expect(typeof body.rate).toBe("number");
    expect(body.rate).toBeGreaterThan(0);
    expect(body).toHaveProperty("source");
    expect(body).toHaveProperty("fetchedAt");
  });

  test("GET /api/booking/quote rejects missing params", async ({ request }) => {
    const r = await request.get("/api/booking/quote");
    expect(r.status()).toBe(400);
    const body = await r.json();
    expect(body.ok).toBe(false);
    expect(body.error).toBe("invalid-params");
  });

  test("POST /api/booking rejects malformed JSON", async ({ request }) => {
    const r = await request.post("/api/booking", {
      data: "{ not: valid json",
      headers: { "Content-Type": "application/json" },
    });
    expect(r.status()).toBe(400);
  });

  test("POST /api/booking rejects payload missing required fields", async ({ request }) => {
    const r = await request.post("/api/booking", {
      data: { homeSlug: "x" },
    });
    expect(r.status()).toBe(400);
    const body = await r.json();
    expect(body.ok).toBe(false);
    expect(body.error).toBe("invalid-payload");
  });
});
