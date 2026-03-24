import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { mainFirestore } from "@/lib/firebase/config";
import type { UserProfile } from "@/lib/types";
import type { User } from "firebase/auth";

const CACHE_KEY = "selvo_user_profile";

export async function saveUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  await setDoc(doc(mainFirestore, "users", uid), {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
  // Update cache
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(CACHE_KEY);
    const existing = cached ? JSON.parse(cached) : {};
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...existing, ...data }));
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  // Cache first
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try { return JSON.parse(cached) as UserProfile; } catch { /* fall through */ }
    }
  }
  // Firestore fallback
  try {
    const snap = await getDoc(doc(mainFirestore, "users", uid));
    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      if (typeof window !== "undefined") {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      }
      return data;
    }
  } catch { /* ignore */ }
  return null;
}

export async function saveProfileOnLogin(user: User): Promise<void> {
  await saveUserProfile(user.uid, {
    name: user.displayName || "",
    email: user.email || "",
  });
}
