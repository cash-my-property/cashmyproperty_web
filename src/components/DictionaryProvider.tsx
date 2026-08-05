"use client";

import { createContext, useContext, ReactNode } from "react";
import { dictionaries, Locale } from "@/dictionaries";

type Dictionary = typeof dictionaries.en;

const DictionaryContext = createContext<{
  dict: Dictionary;
  locale: Locale;
}>({
  dict: dictionaries.en,
  locale: "en",
});

export const useDictionary = () => useContext(DictionaryContext);

export function DictionaryProvider({
  children,
  locale,
}: {
  children: ReactNode;
  locale: Locale;
}) {
  const dict = dictionaries[locale] || dictionaries.en;

  return (
    <DictionaryContext.Provider value={{ dict, locale }}>
      {children}
    </DictionaryContext.Provider>
  );
}
