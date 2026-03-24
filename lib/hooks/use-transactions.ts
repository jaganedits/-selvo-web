"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useAuth } from "@/providers/auth-provider";
import { useFirebase } from "@/providers/firebase-provider";
import type { Transaction } from "@/lib/types";

export function useTransactions() {
  const { user } = useAuth();
  const { userFirestore } = useFirebase();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !userFirestore) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(userFirestore, "users", user.uid, "transactions"),
      orderBy("date", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Transaction[];
      setTransactions(data);
      setLoading(false);
    }, () => setLoading(false));

    return unsub;
  }, [user, userFirestore]);

  return { transactions, loading };
}
