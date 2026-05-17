import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { signOrderCreate } from "@/lib/superpay/signature";
import { buildMerchantOrderIdFromReservation } from "@/lib/superpay/orders";
import {
  createTransaction,
  markTransactionPending,
  markTransactionFailedToCreate,
} from "@/lib/db/transactions";

const Schema = z.object({
  hostifyReservationId: z.number().int().positive(),
  hostifyConfirmationCode: z.string().min(1).max(80).optional(),
  amount: z.number().positive(),
  // Booking snapshot — included so the DB row carries the full context
  // without needing a Hostify lookup later.
  homeSlug: z.string().min(1),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  nights: z.number().int().min(1),
  guests: z.number().int().min(1).max(20),
  guest: z.object({
    firstName: z.string().min(1).max(80),
    lastName: z.string().min(1).max(80),
    email: z.string().email(),
    phone: z.string().min(5).max(40),
  }),
  locale: z.enum(["en", "ar"]),
});

export async function POST(req: NextRequest) {
  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "invalid-payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const d = parsed.data;

  const baseUrl = process.env.SUPERPAY_BASE_URL!.replace(/\/$/, "");
  const merchantCode = process.env.SUPERPAY_MERCHANT_CODE!;
  const apiKey = process.env.SUPERPAY_API_KEY!;
  const paymentMode = process.env.SUPERPAY_PAYMENT_MODE || "THREE_DS";
  const language = process.env.SUPERPAY_MERCHANT_LANGUAGE || "EN";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!.replace(/\/$/, "");

  const merchantOrderId = buildMerchantOrderIdFromReservation(
    d.hostifyReservationId,
  );
  const amountTwoDecimal = Math.round(d.amount * 100) / 100;
  const signature = signOrderCreate({
    merchantOrderId,
    amount: amountTwoDecimal,
    currency: "EGP",
  });
  const webhookUrl = `${siteUrl}/api/payment/webhook`;

  // 1. Persist the transaction at status='initiated' BEFORE calling SuperPay.
  //    If SuperPay times out or 5xxs, we still have a record to reconcile.
  try {
    await createTransaction({
      merchantOrderId,
      hostifyReservationId: d.hostifyReservationId,
      hostifyConfirmationCode: d.hostifyConfirmationCode ?? null,
      homeSlug: d.homeSlug,
      checkIn: d.checkIn,
      checkOut: d.checkOut,
      nights: d.nights,
      guests: d.guests,
      guestEmail: d.guest.email,
      guestFirstName: d.guest.firstName,
      guestLastName: d.guest.lastName,
      guestPhone: d.guest.phone,
      amountEgp: Math.round(d.amount),
      locale: d.locale,
    });
  } catch (err) {
    // DB-write failure shouldn't block the payment (Hostify still has the
    // reservation). Just log; the row will be missing but webhook can
    // still reach Hostify.
    console.error("[payment/create] db insert failed", err);
  }

  const requestBody = {
    merchant: { code: merchantCode, apiKey },
    order: { merchantOrderId, amount: amountTwoDecimal, currency: "EGP" },
    signature,
    redirectionURL: `${siteUrl}/booking/success?ref=${encodeURIComponent(merchantOrderId)}`,
    delayTime: 3000,
    defaultPaymentMode: paymentMode,
    merchantLanguage: language,
    callbackConfig: {
      successCallbackUrls: [webhookUrl],
      failureCallbackUrls: [webhookUrl],
      refundCallbackUrls: [webhookUrl],
    },
  };
  const endpoint = `${baseUrl}/ordertransaction/api/1/sts/iframe/url`;

  console.log("[superpay] POST", endpoint, JSON.stringify(requestBody));

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
    body: JSON.stringify(requestBody),
    cache: "no-store",
  });
  const text = await res.text();
  let response: { status?: string; url?: string; descriptionEnglish?: string } = {};
  try {
    response = JSON.parse(text);
  } catch {
    /* leave empty */
  }

  console.log("[superpay] response", res.status, text);

  const ok = response.status === "SUCCESS" && Boolean(response.url);

  // 2. Promote to pending (or failed) based on the SuperPay response.
  try {
    if (ok && response.url) {
      await markTransactionPending(merchantOrderId, response.url);
    } else {
      await markTransactionFailedToCreate(
        merchantOrderId,
        `superpay-create: ${res.status} ${response.descriptionEnglish ?? text.slice(0, 200)}`,
      );
    }
  } catch (err) {
    console.error("[payment/create] db status update failed", err);
  }

  return NextResponse.json({
    ok,
    paymentUrl: response.url,
    merchantOrderId,
  });
}
