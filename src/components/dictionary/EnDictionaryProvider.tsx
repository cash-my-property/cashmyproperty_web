"use client";

import type { ReactNode } from "react";
import { content } from "@/dictionaries/en";
import { DictionaryProvider } from "@/components/DictionaryProvider";

export default function EnDictionaryProvider({ children }: { children: ReactNode }) {
  return (
    <DictionaryProvider locale="en" dict={content}>
      {children}
    </DictionaryProvider>
  );
}
