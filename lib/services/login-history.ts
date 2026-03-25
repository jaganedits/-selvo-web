import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit as firestoreLimit,
  serverTimestamp,
  collectionGroup,
  Timestamp,
} from "firebase/firestore";
import { mainFirestore } from "@/lib/firebase/config";

export interface LoginEvent {
  id: string;
  uid: string;
  userName?: string;
  userEmail?: string;
  method: "email" | "google";
  userAgent: string;
  platform: string;
  timestamp: Date;
}

export async function logLoginEvent(
  uid: string,
  method: "email" | "google"
): Promise<void> {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const platform = typeof navigator !== "undefined" ? navigator.platform : "";

  await addDoc(collection(mainFirestore, "users", uid, "login_history"), {
    method,
    userAgent: ua,
    platform,
    timestamp: serverTimestamp(),
  });
}

export async function getLoginHistory(
  uid: string,
  count: number = 20
): Promise<LoginEvent[]> {
  const q = query(
    collection(mainFirestore, "users", uid, "login_history"),
    orderBy("timestamp", "desc"),
    firestoreLimit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      uid,
      method: data.method || "email",
      userAgent: data.userAgent || "",
      platform: data.platform || "",
      timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(),
    };
  });
}

export async function getRecentLoginsAllUsers(
  count: number = 20
): Promise<LoginEvent[]> {
  // collectionGroup query across all users' login_history
  const q = query(
    collectionGroup(mainFirestore, "login_history"),
    orderBy("timestamp", "desc"),
    firestoreLimit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    // Extract uid from path: users/{uid}/login_history/{id}
    const pathParts = d.ref.path.split("/");
    const uid = pathParts[1] || "";
    return {
      id: d.id,
      uid,
      userName: data.userName,
      userEmail: data.userEmail,
      method: data.method || "email",
      userAgent: data.userAgent || "",
      platform: data.platform || "",
      timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(),
    };
  });
}
