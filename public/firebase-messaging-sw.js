/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBTJ0rnTJhK-ksJNwbtgAlw7oZZ7ac9q0c",
  authDomain: "battelroyale-d9124.firebaseapp.com",
  projectId: "battelroyale-d9124",
  storageBucket: "battelroyale-d9124.firebasestorage.app",
  messagingSenderId: "1007436304851",
  appId: "1:1007436304851:web:a1bff78525948cfa6fdf26"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
