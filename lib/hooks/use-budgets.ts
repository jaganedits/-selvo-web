"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/providers/auth-provider";
import { useFirebase } from "@/providers/firebase-provider";
import type { Budget } from "@/lib/types";

export function useBudgets(monthKey: string) {
  const { user } = useAuth();
  const { userFirestore } = useFirebase();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !userFirestore || !monthKey) {
      setBudgets([]);
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(
      collection(userFirestore, "users", user.uid, `budgets_${monthKey}`),
      (snap) => {
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Budget[];
        setBudgets(data);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return unsub;
  }, [user, userFirestore, monthKey]);

  return { budgets, loading };
}
