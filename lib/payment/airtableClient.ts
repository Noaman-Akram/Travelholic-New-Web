import "server-only";

type AirtableFieldValue = string | number | boolean;

type AirtableResponse = {
  id?: string;
  error?: {
    type?: string;
    message?: string;
  };
};

export type PaymentAirtableResult =
  | { ok: true; id?: string }
  | { ok: false; status?: number; error?: string; message?: string };

function getConfig():
  | {
      token: string;
      baseId: string;
      table: string;
    }
  | null {
  const token = process.env.PAYMENT_AIRTABLE_API_KEY?.trim();
  const baseId = process.env.PAYMENT_AIRTABLE_BASE_ID?.trim();
  const table = process.env.PAYMENT_AIRTABLE_TABLE_ID?.trim();
  if (!token || !baseId || !table) return null;
  return { token, baseId, table };
}

export function paymentAirtableConfigured(): boolean {
  return getConfig() !== null;
}

export async function createPaymentAirtableRecord(
  fields: Record<string, AirtableFieldValue | undefined>,
  timeoutMs = 4000,
): Promise<PaymentAirtableResult> {
  const config = getConfig();
  if (!config) return { ok: false, error: "not-configured" };

  const cleanedFields = Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined && value !== ""),
  ) as Record<string, AirtableFieldValue>;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${encodeURIComponent(config.baseId)}/${encodeURIComponent(config.table)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields: cleanedFields, typecast: true }),
        cache: "no-store",
        signal: controller.signal,
      },
    );
    const data = (await res.json().catch(() => ({}))) as AirtableResponse;

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: data.error?.type ?? `airtable-${res.status}`,
        message: data.error?.message,
      };
    }

    return { ok: true, id: data.id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "unknown-error",
    };
  } finally {
    clearTimeout(timeout);
  }
}
