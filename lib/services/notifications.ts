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

export interface SentNotification {
  id: string;
  title: string;
  body: string;
  target: "all" | "single";
  targetUid?: string;
  sentBy: string;
  sentAt: Date;
}

export async function logSentNotification(data: {
  title: string;
  body: string;
  target: "all" | "single";
  targetUid?: string;
  sentBy: string;
}): Promise<void> {
  await addDoc(collection(mainFirestore, "admin_notifications"), {
    ...data,
    sentAt: serverTimestamp(),
  });
}

export async function getNotificationHistory(
  count: number = 20
): Promise<SentNotification[]> {
  const q = query(
    collection(mainFirestore, "admin_notifications"),
    orderBy("sentAt", "desc"),
    firestoreLimit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: data.title || "",
      body: data.body || "",
      target: data.target || "all",
      targetUid: data.targetUid,
      sentBy: data.sentBy || "",
      sentAt: data.sentAt instanceof Timestamp ? data.sentAt.toDate() : new Date(),
    };
  });
}
