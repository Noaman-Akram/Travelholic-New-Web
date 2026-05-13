import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { signOrderCreate } from "@/lib/superpay/signature";
import { buildMerchantOrderIdFromReservation } from "@/lib/superpay/orders";

const Schema = z.object({
  hostifyReservationId: z.number().int().positive(),
  amount: z.number().positive(),
});

export async function POST(req: NextRequest) {
  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid-payload" }, { status: 400 });
  }
  const { hostifyReservationId, amount } = parsed.data;

  const baseUrl = process.env.SUPERPAY_BASE_URL!.replace(/\/$/, "");
  const merchantCode = process.env.SUPERPAY_MERCHANT_CODE!;
  const apiKey = process.env.SUPERPAY_API_KEY!;
  const paymentMode = process.env.SUPERPAY_PAYMENT_MODE || "THREE_DS";
  const language = process.env.SUPERPAY_MERCHANT_LANGUAGE || "EN";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!.replace(/\/$/, "");

  const merchantOrderId = buildMerchantOrderIdFromReservation(hostifyReservationId);
  const amountTwoDecimal = Math.round(amount * 100) / 100;
  const signature = signOrderCreate({
    merchantOrderId,
    amount: amountTwoDecimal,
    currency: "EGP",
  });
  const webhookUrl = `${siteUrl}/api/payment/webhook`;

  const requestBody = {
    merchant: { code: merchantCode, apiKey },
    order: { merchantOrderId, amount: amountTwoDecimal, currency: "EGP" },
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
  try { response = JSON.parse(text); } catch { /* leave empty */ }

  console.log("[superpay] response", res.status, text);

  return NextResponse.json({
    ok: response.status === "SUCCESS" && Boolean(response.url),
    paymentUrl: response.url,
    merchantOrderId,
  });
}
