/**
 * SuperPay API types.
 * Source: SuperPay Online Payment IFrame Integration V1.3 + Postman collections.
 *
 * Currency is fixed to EGP per the merchant agreement.
 */

export type SuperPayCurrency = "EGP";
export type SuperPayPaymentMode = "AUTH_AND_CAP" | "THREE_DS";
export type SuperPayMerchantLanguage = "EN" | "AR";

export type SuperPayOrderStatus =
  | "INITIATE_AUTHORIZE"
  | "PAY_COMPLETED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED"
  | "FAILED"
  | "CANCELLED"
  | "EXPIRED";

/** POST /ordertransaction/api/1/sts/iframe/url request body. */
export type IframeUrlRequest = {
  merchant: { code: string; apiKey: string };
  order: {
    merchantOrderId: string;
    amount: number;          // in EGP, two decimal places
    currency: SuperPayCurrency;
  };
  /** Optional unique-per-customer id; enables card tokenization. */
  clientId?: string;
  /** SuperPay redirects here after completion and appends response=<base64 JSON>. */
  redirectionURL?: string;
  /** Milliseconds SuperPay waits before redirecting after payment completion. */
  delayTime?: number;
  defaultPaymentMode?: SuperPayPaymentMode;
  merchantLanguage?: SuperPayMerchantLanguage;
  callbackConfig?: {
    successCallbackUrls: string[];
    failureCallbackUrls: string[];
    refundCallbackUrls: string[];
  };
  signature: string;         // HMAC-SHA256 hex of merchantOrderId + amount + currency
};

export type IframeUrlSuccess = {
  status: "SUCCESS";
  url: string;               // hosted payment page (iframe-able or redirect target)
};

export type IframeUrlFailure = {
  status: "FAILURE";
  errorCode?: string;
  descriptionEnglish?: string;
  descriptionArabic?: string;
};

export type IframeUrlResponse = IframeUrlSuccess | IframeUrlFailure;

/** GET /ordertransaction/api/1/order/{merchantOrderId} */
export type OrderStatusResponse =
  | {
      status: "SUCCESS";
      merchantOrderId: string;
      paymentgwOrderId: string;
      orderStatus: SuperPayOrderStatus;
      creationTime: string;
      updatedTime: string;
      netAmount: number;
      totalAmount: number;
      refundedAmountTillNow?: number;
      acquirer?: string;
      network?: string;
      paymentMethod?: string;
      currency: SuperPayCurrency;
    }
  | {
      status: "FAILURE";
      errorCode?: string;
      descriptionEnglish?: string;
      descriptionArabic?: string;
    };

/** Webhook GET notification — base64-encoded JSON in the `response` query param. */
export type WebhookNotificationParams = {
  status: "SUCCESS" | "FAILURE";
  merchantOrderId: string;
  paymentgwOrderId: string;
  orderStatus: SuperPayOrderStatus;
  totalAmount: number;
  netAmount?: number;
  currency: SuperPayCurrency;
  creationTime: string;
  updatedTime: string;
  acquirer?: string;
  network?: string;
  paymentMethod?: string;
  merchantCode?: string;
  errorCode?: string;
  descriptionEnglish?: string;
  descriptionArabic?: string;
};

/** Internal pending-booking record stored on disk between create and webhook. */
export type PendingBooking = {
  merchantOrderId: string;
  createdAt: string;          // ISO
  expiresAt: string;          // ISO — 15 min from createdAt
  homeSlug: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    specialRequests?: string;
  };
  pricing: {
    totalEGP: number;
    cleaningFeeEGP: number;
    subtotalEGP: number;
    discountEGP: number;
  };
  locale: "en" | "ar";
  /** Filled by webhook when payment completes. */
  payment?: {
    paymentgwOrderId: string;
    orderStatus: SuperPayOrderStatus;
    completedAt: string;
    paymentMethod?: string;
    acquirer?: string;
    network?: string;
  };
  /** Filled when we successfully create the Hostify reservation post-payment. */
  hostify?: {
    reservationId: number;
    confirmationCode: string;
    createdAt: string;
  };
};
