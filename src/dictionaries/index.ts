// Sirf types + locale helpers. Dictionary data yahan import NAHI hota — warna dono
// languages har importer ke bundle mein chali jaati hain (pehle ~400 KB har page pe).
// Data per-locale providers mein hai: src/components/dictionary/{En,Ar}DictionaryProvider.tsx
import type { content as EnContent } from './en';

export type Dictionary = typeof EnContent;

export const locales = ['en', 'ar'] as const;
export type Locale = (typeof locales)[number];

export const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);
