// public/firebase-messaging-sw.js

import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBTJ0rnTJhK-ksJNwbtgAlw7oZZ7ac9q0c",
  authDomain: "battelroyale-d9124.firebaseapp.com",
  projectId: "battelroyale-d9124",
  storageBucket: "battelroyale-d9124.firebasestorage.app",
  messagingSenderId: "1007436304851",
  appId: "1:1007436304851:web:a1bff78525948cfa6fdf26"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Handle background FCM messages
onBackgroundMessage(messaging, (payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/logo192.png',
    data: payload.data || {} // optional deep link or extra data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
