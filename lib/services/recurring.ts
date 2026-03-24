import {
  collection, getDocs, query, where, doc, setDoc, updateDoc,
  Timestamp, serverTimestamp,
  type Firestore,
} from "firebase/firestore";
import { addDays, addWeeks, addMonths } from "date-fns";
import type { Recurring } from "@/lib/types";

function advanceDate(date: Date, frequency: string): Date {
  switch (frequency) {
    case "daily": return addDays(date, 1);
    case "weekly": return addWeeks(date, 1);
    case "monthly": return addMonths(date, 1);
    default: return addDays(date, 1);
  }
}

export async function processPendingRecurring(fs: Firestore, uid: string): Promise<number> {
  const now = new Date();
  const recurringRef = collection(fs, "users", uid, "recurring");
  const q = query(recurringRef, where("isActive", "==", true));
  const snap = await getDocs(q);
  let created = 0;

  for (const recurringDoc of snap.docs) {
    const data = recurringDoc.data() as Omit<Recurring, "id">;
    let nextDate = data.nextDate instanceof Timestamp
      ? data.nextDate.toDate()
      : new Date(data.nextDate);

    while (nextDate <= now) {
      const txId = `recurring_${recurringDoc.id}_${nextDate.getTime()}`;
      const txRef = doc(fs, "users", uid, "transactions", txId);

      await setDoc(txRef, {
        type: data.type,
        amount: data.amount,
        category: data.category,
        name: data.name,
        date: Timestamp.fromDate(nextDate),
        paymentMode: data.paymentMode || "",
        note: data.note || "",
        recurringSourceId: recurringDoc.id,
        recurringOccurrenceAt: Timestamp.fromDate(nextDate),
        createdAt: serverTimestamp(),
      });

      created++;
      nextDate = advanceDate(nextDate, data.frequency);
    }

    // Update nextDate on the recurring doc
    await updateDoc(doc(recurringRef, recurringDoc.id), {
      nextDate: Timestamp.fromDate(nextDate),
    });
  }

  return created;
}
