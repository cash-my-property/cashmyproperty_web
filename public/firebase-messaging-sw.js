// Firebase Cloud Messaging Background Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase App in Service Worker
const firebaseConfig = {
  apiKey: "AIzaSyDVyRq0Ru34wD-5pomdHwvRXu2vjyShGsI",
  authDomain: "cashmyproperty-2c6f9.firebaseapp.com",
  projectId: "cashmyproperty-2c6f9",
  storageBucket: "cashmyproperty-2c6f9.firebasestorage.app",
  messagingSenderId: "388934698811",
  appId: "1:388934698811:web:74175bfc2988fe858d191e"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message: ', payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || 'Cash My Property';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || payload.data?.message || 'New notification received.',
    icon: '/cmpfavicon-removebg-preview.png',
    badge: '/cmpfavicon-removebg-preview.png',
    data: payload.data || {},
    tag: payload.data?.tag || 'cmp-notification'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/dashboard';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
