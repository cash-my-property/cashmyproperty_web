"use client";

import type { ReactNode } from "react";
import { content } from "@/dictionaries/ar";
import { DictionaryProvider } from "@/components/DictionaryProvider";

export default function ArDictionaryProvider({ children }: { children: ReactNode }) {
  return (
    <DictionaryProvider locale="ar" dict={content}>
      {children}
    </DictionaryProvider>
  );
}
