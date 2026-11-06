// Firebase Cloud Messaging — background web push (tab band / background mein).
// Tab focused ho to message page ke onMessage (FcmListener) ko jata hai, yahan nahi.

// ── Notification click ──
// Firebase SDK se PEHLE register kiya hai: SDK ka apna click handler sirf `fcmOptions.link` dekhta hai,
// jab ke backend URL `data.url` mein bhejta hai. Hum pehle chalte hain aur SDK wala rok dete hain.
self.addEventListener('notificationclick', (event) => {
  event.stopImmediatePropagation();
  event.notification.close();

  const raw = event.notification.data || {};
  // SDK ne khud dikhayi ho to payload `data.FCM_MSG` mein hota hai; humne dikhayi ho to seedha `data` mein
  const data = (raw.FCM_MSG && raw.FCM_MSG.data) || raw;

  event.waitUntil((async () => {
    const windows = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    const target = new URL(toWebPath(data.url, localeOf(windows)), self.location.origin).href;

    const same = windows.find((c) => c.url === target);
    if (same && 'focus' in same) return same.focus();
    return clients.openWindow(target);
  })());
});

// Backend app-style path bhejta hai (/real-time-offers/<id>) → website route (/<locale>/auctions/<id>).
// Same mapping jo bell list mein hai (SocketContext → notificationHref).
function toWebPath(url, locale) {
  if (typeof url !== 'string' || !url.startsWith('/') || url.startsWith('//')) return `/${locale}`;
  const mapped = url.replace(/^\/real-time-offers\//, '/auctions/');
  return /^\/(en|ar)(\/|$)/.test(mapped) ? mapped : `/${locale}${mapped}`;
}

// Khuli tab ki zabaan; koi tab na ho to English
function localeOf(windows) {
  for (const c of windows) {
    const m = new URL(c.url).pathname.match(/^\/(en|ar)(\/|$)/);
    if (m) return m[1];
  }
  return 'en';
}

// Naya SW turant active ho (purana click handler atka na rahe)
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Public web config (secret nahi) — .env ke NEXT_PUBLIC_FIREBASE_* jaisa hi hona chahiye
firebase.initializeApp({
  apiKey: 'AIzaSyDVyRq0Ru34wD-5pomdHwvRXu2vjyShGsI',
  authDomain: 'cashmyproperty-2c6f9.firebaseapp.com',
  projectId: 'cashmyproperty-2c6f9',
  storageBucket: 'cashmyproperty-2c6f9.firebasestorage.app',
  messagingSenderId: '388934698811',
  appId: '1:388934698811:web:74175bfc2988fe858d191e',
});

const messaging = firebase.messaging();

// Backend `notification` + `data` dono bhejta hai → `notification` wali message browser/SDK khud dikhata hai.
// Hum sirf data-only message khud dikhate hain, warna har push do baar aati.
messaging.onBackgroundMessage((payload) => {
  if (payload.notification) return;
  const d = payload.data || {};
  self.registration.showNotification(d.title || 'Cash My Property', {
    body: d.body || d.message || '',
    icon: '/cmpfavicon-removebg-preview.png',
    badge: '/cmpfavicon-removebg-preview.png',
    data: d,
    tag: d.tag || undefined,
  });
});
