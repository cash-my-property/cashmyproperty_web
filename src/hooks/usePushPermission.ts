"use client";

import { useSyncExternalStore } from "react";
import { currentPushPermission, PUSH_PERMISSION_EVENT, type PushPermission } from "@/lib/pushToken";

// Permission hamare button se badle (custom event) ya user browser settings se (wapas tab pe aane par focus).
function subscribe(onChange: () => void) {
  window.addEventListener(PUSH_PERMISSION_EVENT, onChange);
  window.addEventListener("focus", onChange);
  return () => {
    window.removeEventListener(PUSH_PERMISSION_EVENT, onChange);
    window.removeEventListener("focus", onChange);
  };
}

/** Browser ki notification permission — SSR pe "unsupported" (koi hydration mismatch nahi). */
export function usePushPermission(): PushPermission {
  return useSyncExternalStore(subscribe, currentPushPermission, () => "unsupported");
}
