import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { signOrderCreate } from "@/lib/superpay/signature";
import { buildMerchantOrderIdFromReservation } from "@/lib/superpay/orders";

const CreateSchema = z.object({
  hostifyReservationId: z.number().int().positive(),
  amount: z.number().positive(),
});

/**
 * Builds the SuperPay iframe-URL request body and signs it server-side,
 * then returns the full payload to the browser. The browser fires the
 * actual POST to SuperPay so it's visible in DevTools Network tab.
 *
 * Only the signature secret (SUPERPAY_SECURE_HASH_KEY) stays
 * server-side; the merchant code and apiKey travel in the body per
 * SuperPay V1.3 spec.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "invalid-payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { hostifyReservationId, amount } = parsed.data;

  const baseUrl = process.env.SUPERPAY_BASE_URL?.trim();
  const merchantCode = process.env.SUPERPAY_MERCHANT_CODE?.trim();
  const apiKey = process.env.SUPERPAY_API_KEY?.trim();
  const paymentMode = process.env.SUPERPAY_PAYMENT_MODE?.trim() || "THREE_DS";
  const language = process.env.SUPERPAY_MERCHANT_LANGUAGE?.trim() || "EN";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");

  if (!baseUrl || !merchantCode || !apiKey || !siteUrl) {
    return NextResponse.json(
      { ok: false, error: "superpay-not-configured" },
      { status: 503 },
    );
  }

  const merchantOrderId = buildMerchantOrderIdFromReservation(hostifyReservationId);
  const amountTwoDecimal = Math.round(amount * 100) / 100;
  const currency = "EGP";

  const signature = signOrderCreate({
    merchantOrderId,
    amount: amountTwoDecimal,
    currency,
  });

  const webhookUrl = `${siteUrl}/api/payment/webhook`;
  const requestBody = {
    merchant: { code: merchantCode, apiKey },
    order: { merchantOrderId, amount: amountTwoDecimal, currency },
    signature,
    redirectionURL: `${siteUrl}/booking/success?order=${encodeURIComponent(merchantOrderId)}`,
    delayTime: 3000,
    defaultPaymentMode: paymentMode,
    merchantLanguage: language,
    callbackConfig: {
      successCallbackUrls: [webhookUrl],
      failureCallbackUrls: [webhookUrl],
      refundCallbackUrls: [webhookUrl],
    },
  };

  console.log("[payment/create] signed", { merchantOrderId, amount: amountTwoDecimal });

  return NextResponse.json({
    ok: true,
    merchantOrderId,
    endpoint: `${baseUrl.replace(/\/$/, "")}/ordertransaction/api/1/sts/iframe/url`,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: requestBody,
  });
}
