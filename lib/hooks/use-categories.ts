"use client";

import { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/providers/auth-provider";
import { useFirebase } from "@/providers/firebase-provider";
import type { Category } from "@/lib/types";

export function useCategories() {
  const { user } = useAuth();
  const { userFirestore } = useFirebase();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !userFirestore) {
      setCategories([]);
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(
      collection(userFirestore, "users", user.uid, "categories"),
      (snap) => {
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[];
        setCategories(data);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return unsub;
  }, [user, userFirestore]);

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === "expense"),
    [categories]
  );

  const incomeCategories = useMemo(
    () => categories.filter((c) => c.type === "income"),
    [categories]
  );

  return { categories, expenseCategories, incomeCategories, loading };
}
