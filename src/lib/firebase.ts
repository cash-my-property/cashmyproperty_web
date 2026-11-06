import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported, Messaging, MessagePayload } from "firebase/messaging";
import api, { PUBLIC_API_PREFIX } from "@/lib/api";
import { notifyPushPermissionChanged, pushSupported, rememberPushToken } from "@/lib/pushToken";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let messagingPromise: Promise<Messaging | null> | null = null;

function getFirebaseMessaging(): Promise<Messaging | null> {
  if (!pushSupported()) return Promise.resolve(null);
  messagingPromise ??= isSupported()
    .then((ok) => (ok ? getMessaging(getApps().length ? getApp() : initializeApp(firebaseConfig)) : null))
    .catch((err) => {
      console.warn("Firebase Messaging unsupported:", err);
      return null;
    });
  return messagingPromise;
}

/**
 * Permission pehle se "granted" ho to token lo aur backend ko bhejo (PUT /me/push-token).
 * Prompt KABHI nahi dikhata — har visit pe chup-chaap chalta hai taake rotate hua token sync rahe
 * (backend same token ko dedupe karta hai, max 5 devices).
 */
let syncInFlight: Promise<string | null> | null = null;

export function syncPushToken(): Promise<string | null> {
  // enablePush aur FcmListener (permission event) ek saath bulate hain — ek hi request chale
  syncInFlight ??= doSync().finally(() => { syncInFlight = null; });
  return syncInFlight;
}

/** Pehli registration pe SW abhi "installing" hota hai — PushManager.subscribe active SW ke bina fail hota hai. */
function activeRegistration(reg: ServiceWorkerRegistration): Promise<ServiceWorkerRegistration> {
  if (reg.active) return Promise.resolve(reg);
  const sw = reg.installing || reg.waiting;
  if (!sw) return Promise.resolve(reg);
  return new Promise((resolve) => {
    const done = () => { if (sw.state === "activated") { sw.removeEventListener("statechange", done); resolve(reg); } };
    sw.addEventListener("statechange", done);
    setTimeout(() => resolve(reg), 10000);
  });
}

async function doSync(): Promise<string | null> {
  if (!pushSupported() || Notification.permission !== "granted") return null;
  const messaging = await getFirebaseMessaging();
  if (!messaging) return null;
  try {
    const registration = await activeRegistration(await navigator.serviceWorker.register("/firebase-messaging-sw.js"));
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || undefined;
    const token = await getToken(messaging, { serviceWorkerRegistration: registration, vapidKey });
    if (!token) return null;
    await api.put(`${PUBLIC_API_PREFIX}/me/push-token`, { token, platform: "WEB" });
    rememberPushToken(token);
    return token;
  } catch (err) {
    console.warn("Push token sync failed:", err);
    return null;
  }
}

/**
 * Sirf user ke click (bell → "Enable notifications") se call karo — browser permission popup yahin aata hai.
 * true = permission mili aur token backend pe save ho gaya.
 */
export async function enablePush(): Promise<boolean> {
  if (!pushSupported()) return false;
  const permission = await Notification.requestPermission();
  notifyPushPermissionChanged();
  if (permission !== "granted") return false;
  return !!(await syncPushToken());
}

/** Tab khuli (focused) ho to FCM message yahan aata hai — browser khud notification nahi dikhata. */
export async function onForegroundMessage(callback: (payload: MessagePayload) => void): Promise<() => void> {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return () => {};
  return onMessage(messaging, callback);
}
