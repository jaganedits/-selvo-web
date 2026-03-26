import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit as firestoreLimit,
  serverTimestamp,
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
  userIds: string[],
  countPerUser: number = 5
): Promise<LoginEvent[]> {
  // Fetch recent logins from each user individually (no collectionGroup needed)
  const results = await Promise.allSettled(
    userIds.map((uid) => getLoginHistory(uid, countPerUser))
  );

  const all: LoginEvent[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      all.push(...result.value);
    }
  }

  // Sort by timestamp descending and return top entries
  return all
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}
