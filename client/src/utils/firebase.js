import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase credentials from Vite environment configurations
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let messaging = null;

try {
  // Only initialize if VITE env keys are configured
  if (firebaseConfig.apiKey && firebaseConfig.messagingSenderId) {
    const app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
  } else {
    console.warn('⚠️ Firebase Client config missing in env. Push notifications will run in mock/local mode.');
  }
} catch (err) {
  console.warn('⚠️ Firebase messaging initialization failed:', err.message);
}

/**
 * Request notification permissions and fetch FCM registration token.
 */
export const requestFCMToken = async () => {
  if (!messaging) {
    console.warn('⚠️ Firebase Messaging is disabled.');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });
      return token;
    } else {
      console.warn('⚠️ Push notification permission denied by user.');
      return null;
    }
  } catch (err) {
    console.error('❌ Failed to retrieve FCM client token:', err.message);
    return null;
  }
};

/**
 * Listener to intercept notifications in foreground
 */
export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
