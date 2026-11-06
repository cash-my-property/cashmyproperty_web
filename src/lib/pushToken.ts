// Web push (FCM) ke halke helpers — Firebase SDK import NAHI karta, taake AuthContext (logout) aur
// bell ka "Enable notifications" button guest/initial bundle mein ~57 KB na kheenchein.
// Asal token generation `@/lib/firebase` mein hai (lazy import).
import api, { PUBLIC_API_PREFIX } from "@/lib/api";

const TOKEN_KEY = "cmp_fcm_token";
/** Permission badalne par dispatch hota hai — usePushPermission aur FcmListener isse sunte hain. */
export const PUSH_PERMISSION_EVENT = "cmp:push-permission";

export type PushPermission = "unsupported" | NotificationPermission;

/** iPhone Safari (bina Home Screen) aur purane browsers mein Notification/PushManager hota hi nahi. */
export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  );
}

export function currentPushPermission(): PushPermission {
  return pushSupported() ? Notification.permission : "unsupported";
}

export function notifyPushPermissionChanged() {
  window.dispatchEvent(new Event(PUSH_PERMISSION_EVENT));
}

export function rememberPushToken(token: string) {
  try { localStorage.setItem(TOKEN_KEY, token); } catch { /* private mode */ }
}

/**
 * Logout se PEHLE call karo (abhi auth cookie zinda hai): is browser ka token backend se hata do,
 * taake logout ke baad is device pe us account ki push na aaye. Max ~2.5s — logout kabhi atakna nahi chahiye.
 */
export async function unregisterPushToken(): Promise<void> {
  let token: string | null = null;
  try { token = localStorage.getItem(TOKEN_KEY); } catch { /* ignore */ }
  if (!token) return;
  try {
    await Promise.race([
      api.delete(`${PUBLIC_API_PREFIX}/me/push-token`, { data: { token } }),
      new Promise((resolve) => setTimeout(resolve, 2500)),
    ]);
  } catch { /* silent — backend dead tokens khud bhi saaf karta hai */ }
  try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
}
