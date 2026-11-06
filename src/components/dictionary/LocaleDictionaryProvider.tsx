"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import type { Locale } from "@/dictionaries";

// Har locale ki dictionary (~190-210 KB) ka apna JS chunk. `next/dynamic` client component
// se import karne pe hi code-split hota hai (server component se nahi — Next docs), isliye
// yeh wrapper client component hai. SSR normal render hota hai aur chunk preload hota hai,
// to text flash nahi hota; browser sirf current language ka chunk download/cache karta hai.
const EnDictionaryProvider = dynamic(() => import("./EnDictionaryProvider"));
const ArDictionaryProvider = dynamic(() => import("./ArDictionaryProvider"));

export default function LocaleDictionaryProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const Provider = locale === "ar" ? ArDictionaryProvider : EnDictionaryProvider;
  return <Provider>{children}</Provider>;
}
