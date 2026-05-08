"use server";

import { z } from "zod";

const ContactSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional().or(z.literal("")),
  intent: z.enum(["stay", "long", "corporate", "press", "other"]),
  message: z.string().min(10).max(4000),
});

export type ContactResult = {
  ok: boolean;
  fieldErrors?: Partial<Record<keyof z.infer<typeof ContactSchema>, string>>;
  error?: string;
};

export async function submitContact(formData: FormData): Promise<ContactResult> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    intent: formData.get("intent"),
    message: formData.get("message"),
  };

  const parsed = ContactSchema.safeParse(raw);
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    const fieldErrors: ContactResult["fieldErrors"] = {};
    if (flat.name) fieldErrors.name = "name";
    if (flat.email) fieldErrors.email = "email";
    if (flat.intent) fieldErrors.intent = "intent";
    if (flat.message) fieldErrors.message = "message";
    return { ok: false, fieldErrors };
  }

  const webhookUrl = process.env.BOOKING_WEBHOOK_URL;

  if (!webhookUrl) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.log("[contact] queued (no webhook configured):", parsed.data);
    }
    return { ok: true };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "contact",
        timestamp: new Date().toISOString(),
        ...parsed.data,
      }),
    });
    if (!response.ok) {
      return { ok: false, error: "provider-failed" };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "network" };
  }
}
