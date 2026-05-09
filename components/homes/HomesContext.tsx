"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Home } from "@/lib/data/types";

const HomesContext = createContext<Home[] | null>(null);

export function HomesProvider({
  homes,
  children,
}: {
  homes: Home[];
  children: ReactNode;
}) {
  return <HomesContext.Provider value={homes}>{children}</HomesContext.Provider>;
}

export function useHomesData(): Home[] {
  const value = useContext(HomesContext);
  if (value === null) {
    throw new Error("useHomesData must be used within <HomesProvider>");
  }
  return value;
}
