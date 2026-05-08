import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

const BookingSchema = z.object({
  homeSlug: z.string().min(1),
  checkIn: z.string().min(8),
  checkOut: z.string().min(8),
  nights: z.number().int().min(1),
  guests: z.number().int().min(1).max(20),
  guest: z.object({
    firstName: z.string().min(1).max(80),
    lastName: z.string().min(1).max(80),
    email: z.string().email(),
    phone: z.string().min(5).max(40),
    country: z.string().min(2).max(80),
    specialRequests: z.string().max(2000).optional().or(z.literal("")),
    agreeTerms: z.literal("on"),
  }),
  pricing: z.object({
    subtotalEGP: z.number().int().min(0),
    discountEGP: z.number().int().min(0),
    cleaningFeeEGP: z.number().int().min(0),
    totalEGP: z.number().int().min(0),
    currency: z.enum(["EGP", "USD"]),
  }),
  locale: z.enum(["en", "ar"]),
  source: z.literal("direct-website"),
  timestamp: z.string(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }

  const parsed = BookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "invalid-payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const ref = generateRef(parsed.data.homeSlug);

  const webhookUrl = process.env.BOOKING_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "booking-lead",
          ref,
          ...parsed.data,
        }),
      });
    } catch (err) {
      // Don't fail the booking if the webhook is down — we still want
      // the user-facing flow to succeed and we'll process the lead from
      // server logs. Phase 4 should retry with a queue.
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.error("[booking] webhook delivery failed", err);
      }
    }
  } else {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.log("[booking] queued (no webhook configured):", { ref, ...parsed.data });
    }
  }

  return NextResponse.json({ ok: true, ref });
}

function generateRef(slug: string): string {
  const ts = Date.now().toString(36).toUpperCase().slice(-5);
  const slugSig = slug
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 4)
    .toUpperCase();
  return `TH-${slugSig}-${ts}`;
}
