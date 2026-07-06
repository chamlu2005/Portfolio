import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";

export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission denied.");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: "BL99yD1FvL0gXmRLwjuuLlp7Kxm8dCVAWZqg__K2RmWvsLBV5kk71ptgJdnh0Zn1QGACw9iuYNMJj3Rcej8hqCU"
    });

    console.log("FCM Token:", token);

    return token;
  } catch (error) {
    console.error("Error getting FCM token:", error);
  }
}