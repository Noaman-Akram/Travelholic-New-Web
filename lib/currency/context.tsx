"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { AppCurrency } from "@/lib/utils/formatPrice";

type CurrencyContextValue = {
  currency: AppCurrency;
  setCurrency: (next: AppCurrency) => void;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export const CURRENCY_COOKIE = "TH_CURRENCY";

function setCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${name}=${value}; max-age=${oneYear}; path=/; samesite=lax`;
}

export function CurrencyProvider({
  initial,
  children,
}: {
  initial: AppCurrency;
  children: ReactNode;
}) {
  const [currency, setCurrencyState] = useState<AppCurrency>(initial);

  // Keep cookie in sync if context is changed via setCurrency.
  useEffect(() => {
    setCookie(CURRENCY_COOKIE, currency);
  }, [currency]);

  const setCurrency = useCallback((next: AppCurrency) => {
    setCurrencyState(next);
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within <CurrencyProvider>");
  }
  return ctx;
}
