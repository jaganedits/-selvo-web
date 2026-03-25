import { isSupported } from "firebase/messaging";

let fiamInitialized = false;

/**
 * Initialize Firebase In-App Messaging.
 * FIAM is configured in the Firebase Console — campaigns, triggers, and
 * message content are all managed there, not programmatically.
 * This function just ensures the SDK is loaded on the client.
 */
export async function initInAppMessaging(): Promise<boolean> {
  if (fiamInitialized) return true;
  if (typeof window === "undefined") return false;

  try {
    // FIAM is auto-initialized when the Firebase app is created
    // and firebase/messaging is imported. We just need to verify support.
    const supported = await isSupported();
    if (supported) {
      fiamInitialized = true;
      return true;
    }
  } catch {
    // FIAM not available
  }
  return false;
}

export function isFiamInitialized(): boolean {
  return fiamInitialized;
}
