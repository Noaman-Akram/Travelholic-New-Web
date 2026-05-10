import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Live USD→EGP rate with three free providers + a disk-persisted last-good
 * cache as final fallback. Never hardcoded.
 *
 * Tier order:
 *   1. Manual override   — `EGP_PER_USD_OVERRIDE` env var (admin escape hatch)
 *   2. Frankfurter       — ECB-backed, free, no key   (primary)
 *   3. open.er-api.com   — free, no key               (fallback 1)
 *   4. exchangerate.host — free, no key               (fallback 2)
 *   5. Last-good cache   — disk file from prior fetch (final fallback)
 *   6. Static fallback   — `EGP_PER_USD_FALLBACK` env (configured sane value)
 *
 * Cache: Next's fetch revalidates every 6 hours = 4 fresh fetches per day,
 * which is well within rate limits and keeps prices accurate as EGP/USD
 * moves through the day. After every successful fetch we also persist the
 * rate to disk so a multi-provider outage still surfaces a real number.
 */

const REVALIDATE_SECONDS = 6 * 60 * 60; // 6 hours
const CACHE_DIR = path.resolve(process.cwd(), ".cache");
const CACHE_FILE = path.join(CACHE_DIR, "fx-egp-usd.json");
const STATIC_FALLBACK = 50;

export type FxSource =
  | "override"
  | "frankfurter"
  | "er-api"
  | "exchangerate-host"
  | "last-good"
  | "static-fallback";

export type FxResult = {
  rate: number;
  source: FxSource;
  fetchedAt: string;       // ISO timestamp of when this rate was retrieved
  cachedSince?: string;    // ISO timestamp of when last-good was saved (only when source === 'last-good')
};

type CacheRecord = {
  rate: number;
  fetchedAt: string;
  source: Exclude<FxSource, "last-good" | "static-fallback">;
};

async function readDiskCache(): Promise<CacheRecord | null> {
  try {
    const text = await fs.readFile(CACHE_FILE, "utf8");
    const parsed = JSON.parse(text) as CacheRecord;
    if (
      typeof parsed.rate === "number" &&
      Number.isFinite(parsed.rate) &&
      parsed.rate > 0 &&
      typeof parsed.fetchedAt === "string"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

async function writeDiskCache(record: CacheRecord): Promise<void> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(CACHE_FILE, JSON.stringify(record, null, 2), "utf8");
  } catch (err) {
    // Cache write failures are non-fatal — we still return the live rate.
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("[fx] failed to write last-good cache:", err);
    }
  }
}

async function fetchFrankfurter(): Promise<number | null> {
  try {
    const res = await fetch(
      "https://api.frankfurter.dev/v1/latest?base=USD&symbols=EGP",
      { next: { revalidate: REVALIDATE_SECONDS, tags: ["fx-egp-usd"] } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { rates?: { EGP?: number } };
    const rate = data.rates?.EGP;
    return typeof rate === "number" && Number.isFinite(rate) && rate > 0 ? rate : null;
  } catch {
    return null;
  }
}

async function fetchErApi(): Promise<number | null> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: REVALIDATE_SECONDS, tags: ["fx-egp-usd"] },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      result?: string;
      rates?: { EGP?: number };
    };
    if (data.result !== "success") return null;
    const rate = data.rates?.EGP;
    return typeof rate === "number" && Number.isFinite(rate) && rate > 0 ? rate : null;
  } catch {
    return null;
  }
}

async function fetchExchangerateHost(): Promise<number | null> {
  try {
    const res = await fetch(
      "https://api.exchangerate.host/latest?base=USD&symbols=EGP",
      { next: { revalidate: REVALIDATE_SECONDS, tags: ["fx-egp-usd"] } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { rates?: { EGP?: number } };
    const rate = data.rates?.EGP;
    return typeof rate === "number" && Number.isFinite(rate) && rate > 0 ? rate : null;
  } catch {
    return null;
  }
}

function readOverride(): number | null {
  const raw = process.env.EGP_PER_USD_OVERRIDE?.trim();
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function readStaticFallback(): number {
  const raw = process.env.EGP_PER_USD_FALLBACK?.trim();
  if (!raw) return STATIC_FALLBACK;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : STATIC_FALLBACK;
}

let inFlight: Promise<FxResult> | null = null;

/**
 * Resolve the current USD→EGP rate. Memoized at the module level so
 * concurrent callers in the same render share one in-flight promise.
 * Across renders, Next's fetch cache keeps API calls to roughly one per
 * 6-hour window per provider.
 */
export async function getEgpPerUsd(): Promise<FxResult> {
  if (inFlight) return inFlight;
  inFlight = resolveRate().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function resolveRate(): Promise<FxResult> {
  // 1. Manual override always wins.
  const override = readOverride();
  if (override) {
    return {
      rate: override,
      source: "override",
      fetchedAt: new Date().toISOString(),
    };
  }

  const now = new Date().toISOString();

  // 2. Primary: Frankfurter
  const frankfurter = await fetchFrankfurter();
  if (frankfurter) {
    void writeDiskCache({ rate: frankfurter, fetchedAt: now, source: "frankfurter" });
    return { rate: frankfurter, source: "frankfurter", fetchedAt: now };
  }

  // 3. Fallback 1: open.er-api.com
  const erApi = await fetchErApi();
  if (erApi) {
    void writeDiskCache({ rate: erApi, fetchedAt: now, source: "er-api" });
    return { rate: erApi, source: "er-api", fetchedAt: now };
  }

  // 4. Fallback 2: exchangerate.host
  const exHost = await fetchExchangerateHost();
  if (exHost) {
    void writeDiskCache({
      rate: exHost,
      fetchedAt: now,
      source: "exchangerate-host",
    });
    return { rate: exHost, source: "exchangerate-host", fetchedAt: now };
  }

  // 5. Last-good cache from disk (a real rate from a previous fetch).
  const cached = await readDiskCache();
  if (cached) {
    return {
      rate: cached.rate,
      source: "last-good",
      fetchedAt: cached.fetchedAt,
      cachedSince: cached.fetchedAt,
    };
  }

  // 6. Final: a sane static value via env or default 50.
  return {
    rate: readStaticFallback(),
    source: "static-fallback",
    fetchedAt: now,
  };
}

/**
 * Convenience helper for one-shot conversions on the server.
 * Use `getEgpPerUsd()` directly when you also want to surface the source.
 */
export async function usdToEgp(usd: number | null | undefined): Promise<number> {
  const { rate } = await getEgpPerUsd();
  return Math.max(0, Math.round((usd ?? 0) * rate));
}

/**
 * Inverse — used by the booking route to convert a customer-facing EGP
 * total back into USD when posting to Hostify (which is USD-denominated).
 */
export async function egpToUsd(egp: number | null | undefined): Promise<number> {
  const { rate } = await getEgpPerUsd();
  if (rate <= 0) return 0;
  return Math.round(((egp ?? 0) / rate) * 100) / 100;
}
