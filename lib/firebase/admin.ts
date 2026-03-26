import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccount) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY env var is not set");
  }

  return initializeApp({
    credential: cert(JSON.parse(serviceAccount)),
  });
}

export const adminAuth = () => getAuth(getAdminApp());
export const adminFirestore = () => getFirestore(getAdminApp());
