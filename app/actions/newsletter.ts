"use server";

import { z } from "zod";

const NewsletterSchema = z.object({
  email: z.string().email(),
});

export type NewsletterResult = { ok: boolean; error?: string };

export async function subscribeNewsletter(formData: FormData): Promise<NewsletterResult> {
  const raw = { email: formData.get("email") };
  const parsed = NewsletterSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "invalid-email" };
  }

  const apiKey = process.env.NEWSLETTER_API_KEY;
  const listId = process.env.NEWSLETTER_LIST_ID;

  // REVIEW: until NEWSLETTER_API_KEY is set, we accept the email without
  // forwarding it. Phase 4 will wire to Mailchimp / Brevo / Loops.
  if (!apiKey || !listId) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.log("[newsletter] queued (no provider configured):", parsed.data.email);
    }
    return { ok: true };
  }

  try {
    // Generic webhook-style POST. The exact provider call lives in Phase 4.
    const response = await fetch("https://api.example.com/newsletter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ email: parsed.data.email, list: listId }),
    });
    if (!response.ok) {
      return { ok: false, error: "provider-failed" };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "network" };
  }
}
