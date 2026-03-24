import {
  collection, doc, addDoc, setDoc, getDoc, getDocs, updateDoc, deleteDoc,
  serverTimestamp, query, where, writeBatch,
  type Firestore,
} from "firebase/firestore";
import type { TransactionFormData, CategoryFormData, RecurringFormData } from "@/lib/types";
import { ALL_DEFAULT_CATEGORIES } from "@/lib/constants";

// ---- TRANSACTIONS ----

export async function addTransaction(fs: Firestore, uid: string, data: TransactionFormData) {
  const ref = collection(fs, "users", uid, "transactions");
  return addDoc(ref, { ...data, createdAt: serverTimestamp() });
}

export async function updateTransaction(fs: Firestore, uid: string, docId: string, data: Partial<TransactionFormData>) {
  const ref = doc(fs, "users", uid, "transactions", docId);
  return updateDoc(ref, data);
}

export async function deleteTransaction(fs: Firestore, uid: string, docId: string) {
  return deleteDoc(doc(fs, "users", uid, "transactions", docId));
}

export async function reAddTransaction(fs: Firestore, uid: string, data: Record<string, unknown>) {
  const ref = collection(fs, "users", uid, "transactions");
  return addDoc(ref, data);
}

export async function getImportedSplitwiseIds(fs: Firestore, uid: string): Promise<Set<string>> {
  const q = query(
    collection(fs, "users", uid, "transactions"),
    where("splitwiseId", "!=", null)
  );
  const snap = await getDocs(q);
  return new Set(snap.docs.map(d => d.data().splitwiseId as string));
}

// ---- CATEGORIES ----

export async function seedDefaultCategories(fs: Firestore, uid: string) {
  const ref = collection(fs, "users", uid, "categories");
  const existing = await getDocs(ref);
  const existingNames = new Set(existing.docs.map(d => (d.data().name as string).toLowerCase().trim()));

  const batch = writeBatch(fs);
  for (const cat of ALL_DEFAULT_CATEGORIES) {
    if (!existingNames.has(cat.name.toLowerCase().trim())) {
      const newRef = doc(ref);
      batch.set(newRef, {
        name: cat.name,
        type: cat.type,
        iconCode: cat.iconCode,
        colorValue: cat.colorValue,
        createdAt: serverTimestamp(),
      });
    }
  }
  await batch.commit();
}

export async function addCategory(fs: Firestore, uid: string, data: CategoryFormData) {
  // Check uniqueness
  const ref = collection(fs, "users", uid, "categories");
  const existing = await getDocs(ref);
  const normalized = data.name.toLowerCase().trim();
  const duplicate = existing.docs.some(d => {
    const d2 = d.data();
    return (d2.name as string).toLowerCase().trim() === normalized && d2.type === data.type;
  });
  if (duplicate) throw new Error(`Category "${data.name}" already exists`);
  return addDoc(ref, { ...data, createdAt: serverTimestamp() });
}

export async function deleteCategory(fs: Firestore, uid: string, docId: string) {
  return deleteDoc(doc(fs, "users", uid, "categories", docId));
}

// ---- BUDGETS ----

export async function setBudget(
  fs: Firestore, uid: string, category: string, amount: number, monthKey: string, name?: string
) {
  const ref = collection(fs, "users", uid, `budgets_${monthKey}`);
  // Find existing budget for this category
  const existing = await getDocs(ref);
  const existingDoc = existing.docs.find(d => d.data().category === category);

  if (existingDoc) {
    await updateDoc(existingDoc.ref, { amount, ...(name !== undefined && { name }) });
  } else {
    await addDoc(ref, { category, amount, ...(name && { name }) });
    // Add monthKey to user doc
    const userRef = doc(fs, "users", uid);
    const userDoc = await getDoc(userRef);
    const keys: string[] = userDoc.exists() ? (userDoc.data().budgetMonthKeys || []) : [];
    if (!keys.includes(monthKey)) {
      await setDoc(userRef, { budgetMonthKeys: [...keys, monthKey] }, { merge: true });
    }
  }
}

export async function deleteBudget(fs: Firestore, uid: string, docId: string, monthKey: string) {
  await deleteDoc(doc(fs, "users", uid, `budgets_${monthKey}`, docId));
  // Check if subcollection is empty
  const remaining = await getDocs(collection(fs, "users", uid, `budgets_${monthKey}`));
  if (remaining.empty) {
    const userRef = doc(fs, "users", uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const keys: string[] = userDoc.data().budgetMonthKeys || [];
      await setDoc(userRef, { budgetMonthKeys: keys.filter(k => k !== monthKey) }, { merge: true });
    }
  }
}

// ---- RECURRING ----

export async function addRecurring(fs: Firestore, uid: string, data: RecurringFormData) {
  return addDoc(collection(fs, "users", uid, "recurring"), { ...data, createdAt: serverTimestamp() });
}

export async function updateRecurring(fs: Firestore, uid: string, docId: string, data: Partial<RecurringFormData>) {
  return updateDoc(doc(fs, "users", uid, "recurring", docId), data);
}

export async function toggleRecurring(fs: Firestore, uid: string, docId: string, isActive: boolean) {
  return updateDoc(doc(fs, "users", uid, "recurring", docId), { isActive });
}

export async function deleteRecurring(fs: Firestore, uid: string, docId: string) {
  return deleteDoc(doc(fs, "users", uid, "recurring", docId));
}
