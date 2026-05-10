import "server-only";
import { createHmac } from "crypto";

export type SuperPayPaymentMode = "AUTH_AND_CAP" | "THREE_DS";
export type SuperPayCurrency = "EGP";

type CreateIframeUrlInput = {
  merchantOrderId: string;
  amountEGP: number;
  clientId?: string;
  locale: "en" | "ar";
  successUrl: string;
  failureUrl: string;
  refundUrl: string;
};

type SuperPayIframeResponse = {
  status?: string;
  url?: string;
  errorCode?: string;
  descriptionEnglish?: string;
  descriptionArabic?: string;
};

export type SuperPayNotification = {
  status?: string;
  errorCode?: string;
  descriptionArabic?: string;
  descriptionEnglish?: string;
  merchantOrderId?: string;
  paymentgwOrderId?: string;
  orderStatus?: string;
  netAmount?: string | number;
  totalAmount?: string | number;
  currency?: string;
  acquirer?: string;
  network?: string;
  [key: string]: unknown;
};

const DEFAULT_BASE_URL = "https://merchant.super-pay.com";

export function superPayAvailable() {
  return Boolean(
    process.env.SUPERPAY_MERCHANT_CODE &&
      process.env.SUPERPAY_API_KEY &&
      process.env.SUPERPAY_SECURE_HASH_KEY,
  );
}

export function formatSuperPayAmount(amountEGP: number) {
  return amountEGP.toFixed(2);
}

export function createSuperPayOrderSignature({
  merchantOrderId,
  amount,
  currency = "EGP",
}: {
  merchantOrderId: string;
  amount: string;
  currency?: SuperPayCurrency;
}) {
  const key = process.env.SUPERPAY_SECURE_HASH_KEY;
  if (!key) throw new Error("missing-superpay-secure-hash-key");

  return createHmac("sha256", key)
    .update(`${merchantOrderId}${amount}${currency}`)
    .digest("hex");
}

export function decodeSuperPayNotification(response: string): SuperPayNotification | null {
  try {
    const normalized = response.replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(normalized, "base64").toString("utf8");
    return JSON.parse(json) as SuperPayNotification;
  } catch {
    return null;
  }
}

export async function createSuperPayIframeUrl(input: CreateIframeUrlInput) {
  const merchantCode = process.env.SUPERPAY_MERCHANT_CODE;
  const apiKey = process.env.SUPERPAY_API_KEY;
  if (!merchantCode || !apiKey || !superPayAvailable()) {
    throw new Error("superpay-not-configured");
  }

  const amount = formatSuperPayAmount(input.amountEGP);
  const currency: SuperPayCurrency = "EGP";
  const signature = createSuperPayOrderSignature({
    merchantOrderId: input.merchantOrderId,
    amount,
    currency,
  });

  const body = {
    merchant: {
      code: merchantCode,
      apiKey,
    },
    order: {
      merchantOrderId: input.merchantOrderId,
      amount: Number(amount),
      currency,
    },
    clientId: input.clientId,
    signature,
    defaultPaymentMode:
      (process.env.SUPERPAY_PAYMENT_MODE as SuperPayPaymentMode | undefined) ?? "AUTH_AND_CAP",
    merchantLanguage: input.locale === "ar" ? "AR" : "EN",
    callbackConfig: {
      successCallbackUrls: [input.successUrl],
      failureCallbackUrls: [input.failureUrl],
      refundCallbackUrls: [input.refundUrl],
    },
    options: {
      fullscreen: false,
      redirection: false,
      width: "100%",
      height: "760px",
    },
  };

  const baseUrl = process.env.SUPERPAY_BASE_URL ?? DEFAULT_BASE_URL;
  const res = await fetch(`${baseUrl}/ordertransaction/api/1/sts/iframe/url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const json = (await res.json().catch(() => ({}))) as SuperPayIframeResponse;
  if (!res.ok || json.status !== "SUCCESS" || !json.url) {
    throw new Error(json.descriptionEnglish || json.errorCode || `superpay-${res.status}`);
  }

  return {
    merchantOrderId: input.merchantOrderId,
    amount,
    currency,
    url: json.url,
  };
}
