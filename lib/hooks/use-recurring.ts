"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/providers/auth-provider";
import { useFirebase } from "@/providers/firebase-provider";
import type { Recurring } from "@/lib/types";

export function useRecurring() {
  const { user } = useAuth();
  const { userFirestore } = useFirebase();
  const [recurring, setRecurring] = useState<Recurring[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !userFirestore) {
      setRecurring([]);
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(
      collection(userFirestore, "users", user.uid, "recurring"),
      (snap) => {
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Recurring[];
        setRecurring(data);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return unsub;
  }, [user, userFirestore]);

  return { recurring, loading };
}
