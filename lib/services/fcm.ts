import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { doc, updateDoc, deleteField } from "firebase/firestore";
import { mainFirestore } from "@/lib/firebase/config";
import app from "@/lib/firebase/config";

let messagingInstance: ReturnType<typeof getMessaging> | null = null;

async function getMessagingInstance() {
  if (messagingInstance) return messagingInstance;
  if (typeof window === "undefined") return null;
  const supported = await isSupported();
  if (!supported) return null;
  messagingInstance = getMessaging(app);
  return messagingInstance;
}

export async function requestNotificationPermission(uid: string): Promise<string | null> {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const messaging = await getMessagingInstance();
  if (!messaging) return null;

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: await navigator.serviceWorker.register("/firebase-messaging-sw.js"),
  });

  if (token) {
    await saveFcmToken(uid, token);
  }

  return token;
}

export async function saveFcmToken(uid: string, token: string): Promise<void> {
  await updateDoc(doc(mainFirestore, "users", uid), {
    fcmToken: token,
  });
}

export async function removeFcmToken(uid: string): Promise<void> {
  await updateDoc(doc(mainFirestore, "users", uid), {
    fcmToken: deleteField(),
  });
}

export async function setupForegroundMessages(
  onNotification: (title: string, body: string) => void
): Promise<() => void> {
  const messaging = await getMessagingInstance();
  if (!messaging) return () => {};

  const unsubscribe = onMessage(messaging, (payload) => {
    const title = payload.notification?.title || "Selvo";
    const body = payload.notification?.body || "";
    onNotification(title, body);
  });

  return unsubscribe;
}

export function getNotificationPermissionStatus(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}
