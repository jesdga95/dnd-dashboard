"use client";

import { createContext, useContext } from "react";
import type en from "@/dictionaries/en.json";

export type Dict = typeof en;

const DictContext = createContext<Dict | null>(null);

export function DictProvider({
  dict,
  children,
}: {
  dict: Dict;
  children: React.ReactNode;
}) {
  return <DictContext.Provider value={dict}>{children}</DictContext.Provider>;
}

export function useDict(): Dict {
  const ctx = useContext(DictContext);
  if (!ctx) throw new Error("useDict must be used within DictProvider");
  return ctx;
}
