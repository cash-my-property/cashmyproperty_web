"use client";

import { createContext, useContext, ReactNode } from "react";
import type { Dictionary, Locale } from "@/dictionaries";

// Sirf types import hote hain. Data `components/dictionary/{En,Ar}DictionaryProvider`
// se aata hai — har locale ka alag client chunk, isliye page sirf apni language ki
// dictionary download karta hai (cacheable JS, HTML mein inline nahi).
const DictionaryContext = createContext<{ dict: Dictionary; locale: Locale } | null>(null);

export const useDictionary = () => {
  const ctx = useContext(DictionaryContext);
  if (!ctx) throw new Error("useDictionary must be used within a DictionaryProvider");
  return ctx;
};

export function DictionaryProvider({
  children,
  locale,
  dict,
}: {
  children: ReactNode;
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <DictionaryContext.Provider value={{ dict, locale }}>
      {children}
    </DictionaryContext.Provider>
  );
}
