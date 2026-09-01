"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { requestFcmToken, onForegroundMessage } from "@/lib/firebase";
import { Bell } from "lucide-react";

export default function FcmListener() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { addToast, fetchNotifications } = useSocket();

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) return;

    // 1. Register / Sync FCM Token with backend
    const initFcm = async () => {
      try {
        await requestFcmToken();
      } catch (err) {
        console.warn("FCM registration deferred:", err);
      }
    };

    initFcm();

    // 2. Register Foreground Push Notification Listener
    const unsubscribe = onForegroundMessage((payload) => {
      const title = payload.notification?.title || payload.data?.title || "New Notification";
      const message = payload.notification?.body || payload.data?.body || payload.data?.message || "You have a new update.";
      
      addToast(
        title,
        message,
        "info",
        <Bell className="w-5 h-5 text-[#1A3626] dark:text-[#c9a14b] animate-bounce" />
      );

      fetchNotifications();
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [isAuthenticated, user, isLoading]);

  return null;
}
