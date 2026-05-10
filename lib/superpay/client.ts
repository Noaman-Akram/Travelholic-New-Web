import "server-only";

import { signKeyExchange, signOrderCreate, signRefund } from "./signature";
import type {
  IframeUrlRequest,
  IframeUrlResponse,
  OrderStatusResponse,
  SuperPayCurrency,
} from "./types";

const DEFAULT_BASE = "https://merchant.super-pay.com";

function getBase(): string {
  return (process.env.SUPERPAY_BASE_URL ?? DEFAULT_BASE).replace(/\/$/, "");
}

function getMerchantCode(): string {
  const code = process.env.SUPERPAY_MERCHANT_CODE?.trim();
  if (!code) {
    throw new SuperPayError(0, "SUPERPAY_MERCHANT_CODE is not set");
  }
  return code;
}

function getApiKey(): string {
  const key = process.env.SUPERPAY_API_KEY?.trim();
  if (!key) {
    throw new SuperPayError(0, "SUPERPAY_API_KEY is not set");
  }
  return key;
}

export const SUPERPAY_AVAILABLE = (): boolean =>
  Boolean(
    process.env.SUPERPAY_MERCHANT_CODE &&
      process.env.SUPERPAY_API_KEY &&
      process.env.SUPERPAY_SECRET_KEY,
  );

export class SuperPayError extends Error {
  status: number;
  body: string;
  constructor(status: number, body: string) {
    super(`SuperPay ${status}: ${body.slice(0, 160)}`);
    this.status = status;
    this.body = body;
  }
}

function isTransientFetchError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  if (/timeout|fetch failed|econnreset|enotfound|network/.test(msg)) return true;
  // Node's undici puts the underlying code on `cause`.
  const cause = (err as { cause?: { code?: string } }).cause;
  const code = cause?.code;
  if (!code) return false;
  return [
    "UND_ERR_CONNECT_TIMEOUT",
    "UND_ERR_SOCKET",
    "ECONNRESET",
    "ENOTFOUND",
    "EAI_AGAIN",
  ].includes(code);
}

async function postJson<T>(
  path: string,
  body: unknown,
  headers: Record<string, string> = {},
): Promise<T> {
  const url = `${getBase()}${path}`;
  const init: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  };

  // One retry on a transient connection failure. SuperPay's edge does
  // occasional cold-start blips that resolve within a second or two.
  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const res = await fetch(url, init);
      const text = await res.text();
      if (!res.ok) {
        throw new SuperPayError(res.status, text);
      }
      try {
        return JSON.parse(text) as T;
      } catch {
        throw new SuperPayError(res.status, `Bad JSON from SuperPay: ${text.slice(0, 120)}`);
      }
    } catch (err) {
      lastErr = err;
      if (err instanceof SuperPayError) throw err;
      if (!isTransientFetchError(err) || attempt === 1) throw err;
      // Quick backoff before retry.
      await new Promise((r) => setTimeout(r, 600));
    }
  }
  throw lastErr;
}

async function getJson<T>(path: string, headers: Record<string, string> = {}): Promise<T> {
  const url = `${getBase()}${path}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json", ...headers },
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    throw new SuperPayError(res.status, text);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new SuperPayError(res.status, `Bad JSON from SuperPay: ${text.slice(0, 120)}`);
  }
}

/**
 * Key exchange — required for the Get Order Status + Refund APIs (but not
 * for iframe URL creation, which signs with the static secret only).
 * Returns a short-lived JWT session string. We re-exchange per call rather
 * than caching since the session TTL isn't documented and these endpoints
 * are low-volume from our side.
 */
async function keyExchange(): Promise<string> {
  const merchantCode = getMerchantCode();
  const apiKey = getApiKey();
  const requestTime = new Date().toISOString();
  const signature = signKeyExchange({ merchantCode, apiKey, requestTime });

  const data = await postJson<{ status: string; session?: string; descriptionEnglish?: string }>(
    "/ordertransaction/api/1/sts/keyexchange",
    { merchantCode, apiKey, requestTime, signature },
    { operation: "KEY_EXCHANGE" },
  );

  if (data.status !== "SUCCESS" || !data.session) {
    throw new SuperPayError(
      0,
      data.descriptionEnglish ?? `keyexchange failed (status ${data.status})`,
    );
  }
  return data.session;
}

export const superpay = {
  /**
   * Create a hosted payment URL for the given order. Returns the URL the
   * user is redirected to (or rendered into an iframe). Server-only —
   * callers must never expose merchantCode/apiKey/secret to the browser.
   */
  async createIframeUrl(args: {
    merchantOrderId: string;
    amount: number;
    currency?: SuperPayCurrency;
    clientId?: string;
  }): Promise<{ url: string }> {
    const currency: SuperPayCurrency = args.currency ?? "EGP";
    const signature = signOrderCreate({
      merchantOrderId: args.merchantOrderId,
      amount: args.amount,
      currency,
    });
    const body: IframeUrlRequest = {
      merchant: { code: getMerchantCode(), apiKey: getApiKey() },
      order: {
        merchantOrderId: args.merchantOrderId,
        amount: Math.round(args.amount * 100) / 100,
        currency,
      },
      ...(args.clientId ? { clientId: args.clientId } : {}),
      signature,
    };

    const data = await postJson<IframeUrlResponse>(
      "/ordertransaction/api/1/sts/iframe/url",
      body,
    );

    if (data.status !== "SUCCESS" || !("url" in data) || !data.url) {
      const failure = data as { errorCode?: string; descriptionEnglish?: string };
      throw new SuperPayError(
        0,
        failure.descriptionEnglish ?? `iframe-url failed (${failure.errorCode ?? "unknown"})`,
      );
    }
    return { url: data.url };
  },

  /**
   * Get authoritative order status. Used to defensively verify webhook
   * notifications before acting on them, and to reconcile if the user
   * lands on the success page before the webhook has fired.
   */
  async getOrderStatus(merchantOrderId: string): Promise<OrderStatusResponse> {
    const session = await keyExchange();
    return getJson<OrderStatusResponse>(
      `/ordertransaction/api/1/order/${encodeURIComponent(merchantOrderId)}`,
      {
        session,
        merchantcode: getMerchantCode(),
      },
    );
  },

  /**
   * Issue a (full or partial) refund for a previously-paid order.
   * Admin-only — surfaces will guard with their own auth.
   */
  async refund(args: {
    merchantOrderId: string;
    paymentgwOrderId: string;
    refundAmount: number;
    currency?: SuperPayCurrency;
  }): Promise<unknown> {
    const session = await keyExchange();
    const currency: SuperPayCurrency = args.currency ?? "EGP";
    const signature = signRefund({
      merchantOrderId: args.merchantOrderId,
      paymentgwOrderId: args.paymentgwOrderId,
      refundAmount: args.refundAmount,
    });
    return postJson(
      "/ordertransaction/api/1/refund",
      {
        merchantCode: getMerchantCode(),
        merchantOrderId: args.merchantOrderId,
        paymentgwOrderId: args.paymentgwOrderId,
        refundAmount: Math.round(args.refundAmount * 100) / 100,
        currency,
        signature,
      },
      { session, operation: "REFUND_ORDER" },
    );
  },
};
