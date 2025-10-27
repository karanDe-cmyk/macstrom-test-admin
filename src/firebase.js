// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyBTJ0rnTJhK-ksJNwbtgAlw7oZZ7ac9q0c",
  authDomain: "battelroyale-d9124.firebaseapp.com",
  projectId: "battelroyale-d9124",
  storageBucket: "battelroyale-d9124.firebasestorage.app",
  messagingSenderId: "1007436304851",
  appId: "1:1007436304851:web:a1bff78525948cfa6fdf26"
};


const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
