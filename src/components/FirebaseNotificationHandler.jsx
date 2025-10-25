import { useEffect } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../firebase";

const FirebaseNotificationHandler = () => {
  useEffect(() => {
    const VAPID_KEY = "BAJQxI1gTLXmAlYRejnmDTxvgqd34FUpAOyG-A2f5yl-GGkpuEuc4_X2IYhUMN-KBZTEj3W5k0bpEVu7bdVwYMI";

    const saveTokenToServer = async (token) => {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        console.warn("No auth token — skipping FCM token save.");
        return;
      }

      try {
        const apiUrl = 'https://macstrombattle-api.kglame.com/api/notifications/save-fcm-token';

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ token })
        });

        if (!response.ok) {
          const text = await response.text();
          let errorText;
          try { errorText = JSON.parse(text); } catch { errorText = text; }
          throw new Error(errorText?.message || errorText || 'Failed to save token');
        }

        return await response.json();
      } catch (error) {
        console.error('Token save error:', error);
        throw error;
      }
    };


    const showNotification = (payload) => {
      const { title, body, icon } = payload.notification || {};
      if (Notification.permission === "granted") {
        new Notification(title || "New Notification", {
          body,
          icon: icon || '/logo192.png',
          data: payload.data
        }).onclick = () => {
          if (payload.data?.url) {
            window.open(payload.data.url, '_blank');
          }
        };
      }
    };

    const initializeNotifications = async () => {
      try {
        let permission = Notification.permission;

        if (permission === "default") {
          permission = await Notification.requestPermission();
        }

        if (permission === "granted") {
          const token = await getToken(messaging, { vapidKey: VAPID_KEY });

          if (token) {
            console.log('FCM Token:', token);

            // ✅ Only save if it's a new or changed token
            const savedToken = localStorage.getItem('fcmToken');
            if (savedToken !== token) {
              await saveTokenToServer(token);
              localStorage.setItem('fcmToken', token);
            }
          }

          onMessage(messaging, (payload) => {
            console.log('Foreground message:', payload);
            showNotification(payload);
          });
        }
      } catch (error) {
        console.error('Notification initialization failed:', error);
      }
    };
    
    initializeNotifications();

    return () => {
      // Cleanup if needed
    };
  }, []);

  return null;
};

export default FirebaseNotificationHandler;