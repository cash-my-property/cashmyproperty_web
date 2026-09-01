// Firebase Cloud Messaging Background Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase App in Service Worker
// Values will be populated or overridden by client registration
const firebaseConfig = {
  apiKey: "AIzaSy_placeholder_key",
  authDomain: "cmp-dubai.firebaseapp.com",
  projectId: "cmp-dubai",
  storageBucket: "cmp-dubai.appspot.com",
  messagingSenderId: "100000000000",
  appId: "1:100000000000:web:placeholder"
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
