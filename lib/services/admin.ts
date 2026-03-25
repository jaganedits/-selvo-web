import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit as firestoreLimit,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { mainFirestore } from "@/lib/firebase/config";
import type { UserProfile, UserRole } from "@/lib/types/user";

export interface AdminUser {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  disabled: boolean;
  isConnected: boolean;
  projectId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  configSetAt?: Date;
}

function toDate(ts: Timestamp | undefined): Date | undefined {
  return ts instanceof Timestamp ? ts.toDate() : undefined;
}

function mapUser(uid: string, data: UserProfile): AdminUser {
  return {
    uid,
    name: data.name || "",
    email: data.email || "",
    role: data.role || "user",
    disabled: data.disabled || false,
    isConnected: !!data.firebaseConfig,
    projectId: data.firebaseConfig?.projectId,
    createdAt: toDate(data.createdAt) || toDate(data.updatedAt),
    updatedAt: toDate(data.updatedAt),
    configSetAt: toDate(data.configSetAt),
  };
}

export async function getAllUsers(): Promise<AdminUser[]> {
  const snap = await getDocs(collection(mainFirestore, "users"));
  return snap.docs.map((d) => mapUser(d.id, d.data() as UserProfile));
}

export async function getRecentUsers(count: number = 10): Promise<AdminUser[]> {
  const q = query(
    collection(mainFirestore, "users"),
    orderBy("updatedAt", "desc"),
    firestoreLimit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapUser(d.id, d.data() as UserProfile));
}

export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  await updateDoc(doc(mainFirestore, "users", uid), {
    role,
    updatedAt: serverTimestamp(),
  });
}

export async function disableUser(uid: string): Promise<void> {
  await updateDoc(doc(mainFirestore, "users", uid), {
    disabled: true,
    updatedAt: serverTimestamp(),
  });
}

export async function enableUser(uid: string): Promise<void> {
  await updateDoc(doc(mainFirestore, "users", uid), {
    disabled: false,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteUserAccount(uid: string): Promise<void> {
  await deleteDoc(doc(mainFirestore, "users", uid));
}
