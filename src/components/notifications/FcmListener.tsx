"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { usePushPermission } from "@/hooks/usePushPermission";
import { Bell } from "lucide-react";

/**
 * Web push (FCM). Permission KHUD nahi maangta — wo bell panel ke "Enable notifications" button (PushOptIn) se aati hai.
 * Yahan sirf: permission "granted" ho to token sync + foreground messages ka toast.
 * Agent accounts ko backend push nahi bhejta (setPushToken → saved:false), isliye unke liye kuch nahi.
 */
export default function FcmListener() {
  const { isAuthenticated, isLoading, isAgent, user } = useAuth();
  const { addToast, pushNotification } = useSocket();
  const permission = usePushPermission();
  const userId = user?.id ?? user?._id;

  useEffect(() => {
    if (isLoading || !isAuthenticated || isAgent || permission !== "granted") return;

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    // Firebase SDK (~57 KB) sirf un logged-in users ke liye jinhon ne push allow kiya hai — lazily.
    (async () => {
      try {
        const { syncPushToken, onForegroundMessage } = await import("@/lib/firebase");
        if (cancelled) return;
        syncPushToken();

        const unsub = await onForegroundMessage((payload) => {
          const title = payload.notification?.title || payload.data?.title || "New Notification";
          const message = payload.notification?.body || payload.data?.body || payload.data?.message || "You have a new update.";
          addToast(title, message, "info", <Bell className="w-5 h-5 text-[#1A3626] dark:text-[#c9a14b] animate-bounce" />);
          // Bell list server se dobara (sahi id/href/read state ke saath)
          pushNotification({ title, message });
        });
        if (cancelled) unsub();
        else unsubscribe = unsub;
      } catch (err) {
        console.warn("FCM init failed:", err);
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLoading, isAgent, permission, userId]);

  return null;
}
