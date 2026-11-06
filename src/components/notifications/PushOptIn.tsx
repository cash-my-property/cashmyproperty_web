"use client";

import { useState } from "react";
import { BellRing, BellOff, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePushPermission } from "@/hooks/usePushPermission";

/**
 * Bell panel ke andar "Enable notifications" — browser permission sirf user ke click pe (login pe zabardasti popup nahi).
 * Chhupa rehta hai: agent accounts (backend push nahi bhejta), already allowed, ya unsupported browser
 * (iPhone Safari bina Home Screen) — wahan bell polling (unread-count) backup hai hi.
 */
export default function PushOptIn() {
  const { isAgent } = useAuth();
  const permission = usePushPermission();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  if (isAgent || permission === "unsupported" || permission === "granted") return null;

  if (permission === "denied") {
    return (
      <div className="px-4 py-2.5 flex items-start gap-2 text-[11px] font-medium text-gray-500 dark:text-gray-400 border-b border-gray-50 dark:border-[#1A3626]">
        <BellOff className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <span>Push notifications are blocked. Allow them from your browser&apos;s site settings.</span>
      </div>
    );
  }

  const enable = async () => {
    setBusy(true);
    setFailed(false);
    try {
      const { enablePush } = await import("@/lib/firebase");
      const ok = await enablePush();
      // Permission di thi par token/save fail hua → retry ka option dikhao
      if (!ok && Notification.permission === "granted") setFailed(true);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="px-4 py-2.5 border-b border-gray-50 dark:border-[#1A3626] bg-[#5CD284]/5">
      <button
        type="button"
        onClick={enable}
        disabled={busy}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[12px] font-bold bg-[#1A3626] text-white dark:bg-[#5CD284] dark:text-[#102418] hover:opacity-90 disabled:opacity-60 transition-opacity cursor-pointer"
      >
        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BellRing className="w-3.5 h-3.5" />}
        Enable push notifications
      </button>
      <p className={`mt-1.5 text-[10.5px] text-center ${failed ? "text-rose-500" : "text-gray-400"}`}>
        {failed ? "Couldn't turn on notifications. Please try again." : "Get updates even when this tab is closed."}
      </p>
    </div>
  );
}
