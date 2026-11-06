"use client";

import { useEffect, useState } from "react";
import { rtoService, type RtoLiveState } from "@/services/rtoService";

/**
 * Offer page ka live state: `/real-time-offers/:id/live` poll karta hai (doc: har 3–5 s)
 * aur countdown ko `serverTime` ke hisaab se chalata hai (phone/PC ki ghadi pe bharosa nahi).
 *
 * - ACTIVE / PAUSED: har 4 s poll
 * - UPCOMING: har 15 s (start hote hi ACTIVE pakadne ke liye)
 * - SOLD / NOT_SOLD / ENDED: poll band
 * - Tab hidden ho to poll ruk jata hai, wapas aate hi turant refresh
 */
const FINAL = new Set(["SOLD", "NOT_SOLD", "ENDED"]);

export function useRtoLive(id: string, initial: RtoLiveState | null) {
  const [state, setState] = useState<RtoLiveState | null>(initial);
  const [now, setNow] = useState(() => Date.now());
  // serverTime - clientTime (ms): countdown = endTime - (Date.now() + offset)
  const [offset, setOffset] = useState(0);
  // Countdown tabhi jab server clock sync ho jaye: SSR aur client ka pehla render ek jaisa
  // rahe (warna "Ends in 19h 09m 55s" server/client pe alag second → hydration mismatch)
  const [synced, setSynced] = useState(false);
  const status = state?.status;

  const refresh = async () => {
    try {
      const fresh = await rtoService.getLiveState(id);
      setOffset(new Date(fresh.serverTime).getTime() - Date.now());
      setSynced(true);
      setState(fresh);
      return fresh;
    } catch {
      return null; // network blip — next tick retry karega
    }
  };

  useEffect(() => {
    if (!id || (status && FINAL.has(status))) return;
    const interval = status === "UPCOMING" ? 15000 : 4000;
    let timer: ReturnType<typeof setTimeout>;
    let stopped = false;

    const loop = async () => {
      if (stopped) return;
      if (document.visibilityState === "visible") await refresh();
      timer = setTimeout(loop, interval);
    };
    loop(); // turant ek refresh: server clock offset + taaza price

    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, status]);

  // 1 s tick sirf jab countdown dikhana ho
  useEffect(() => {
    if (!status || FINAL.has(status) || status === "PAUSED") return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [status]);

  const serverNow = now + offset;
  const target =
    status === "UPCOMING" ? state?.startTime : status === "ACTIVE" ? state?.endTime : null;
  const msLeft = synced && target ? Math.max(0, new Date(target).getTime() - serverNow) : null;

  return { state, setState, refresh, msLeft };
}

export function splitDuration(ms: number) {
  const s = Math.floor(ms / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}
