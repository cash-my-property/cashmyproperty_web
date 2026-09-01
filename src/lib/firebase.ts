import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";
import api from "@/lib/api";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSy_placeholder",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "cmp-dubai.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "cmp-dubai",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "cmp-dubai.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "100000000000",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:100000000000:web:placeholder",
};

let messagingInstance: Messaging | null = null;

export const getFirebaseMessaging = (): Messaging | null => {
  if (typeof window === "undefined") return null;

  try {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    if (!messagingInstance) {
      messagingInstance = getMessaging(app);
    }
    return messagingInstance;
  } catch (err) {
    console.warn("Firebase Messaging initialization skipped or unsupported in environment:", err);
    return null;
  }
};

export const requestFcmToken = async (): Promise<string | null> => {
  if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("FCM Notification permission denied or dismissed by user.");
      return null;
    }

    const messaging = getFirebaseMessaging();
    if (!messaging) return null;

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    
    // Register the custom FCM Service Worker
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    
    const token = await getToken(messaging, {
      serviceWorkerRegistration: registration,
      vapidKey: vapidKey || undefined,
    });

    if (token) {
      console.log("📢 FCM Web Push Token generated successfully.");
      // Sync token with CMP Backend via PATCH /auth/update-fcm-token
      try {
        await api.patch("/auth/update-fcm-token", { fcmToken: token });
        console.log("✅ FCM Token registered with backend.");
      } catch (patchErr) {
        console.error("Failed to sync FCM Token with backend:", patchErr);
      }
      return token;
    }
  } catch (err) {
    console.error("Error requesting FCM Token:", err);
  }
  return null;
};

export const onForegroundMessage = (callback: (payload: any) => void) => {
  const messaging = getFirebaseMessaging();
  if (!messaging) return () => {};
  return onMessage(messaging, (payload) => {
    console.log("🔔 Foreground FCM Notification received:", payload);
    callback(payload);
  });
};
