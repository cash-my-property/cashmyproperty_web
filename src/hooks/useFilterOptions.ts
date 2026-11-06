"use client";

import { useEffect, useState } from "react";
import connectPublicService, { type PublicFilterOptions } from "@/services/connectPublicService";

/**
 * CMP Connect GET /options — filters ke allowed values (types + labels, amenities per category,
 * furnishing, rental periods, sorts). Doc: "load once and keep it".
 *
 * Module-level cache: poori app mein ek hi request (har widget / page dobara fetch nahi karta).
 * Fail ho to null rehta hai aur widget apni static lists use karta hai.
 */
let cached: PublicFilterOptions | null = null;
let inflight: Promise<PublicFilterOptions | null> | null = null;

function loadOptions(): Promise<PublicFilterOptions | null> {
  if (cached) return Promise.resolve(cached);
  if (!inflight) {
    inflight = connectPublicService
      .getOptions()
      .then((opts) => {
        cached = opts || null;
        return cached;
      })
      .catch((err) => {
        console.error("Filter options (/options) failed, using built-in lists:", err);
        return null;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export function useFilterOptions(): PublicFilterOptions | null {
  const [options, setOptions] = useState<PublicFilterOptions | null>(cached);

  useEffect(() => {
    if (cached) return;
    let alive = true;
    loadOptions().then((opts) => {
      if (alive && opts) setOptions(opts);
    });
    return () => {
      alive = false;
    };
  }, []);

  return options;
}
