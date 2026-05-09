"use client";

import { useCallback, useEffect, useState } from "react";

export type ConsentValue = "all" | "essential" | "unset";
export const CONSENT_COOKIE = "TH_CONSENT";

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(
    new RegExp(`(^| )${name}=([^;]+)`),
  );
  return match ? match[2] : undefined;
}

function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${name}=${value}; max-age=${oneYear}; path=/; samesite=lax`;
}

export function useConsent() {
  const [value, setValue] = useState<ConsentValue>("unset");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readCookie(CONSENT_COOKIE);
    if (stored === "all" || stored === "essential") {
      setValue(stored);
    }
    setHydrated(true);
  }, []);

  const set = useCallback((next: Exclude<ConsentValue, "unset">) => {
    writeCookie(CONSENT_COOKIE, next);
    setValue(next);
  }, []);

  return { value, hydrated, set };
}
