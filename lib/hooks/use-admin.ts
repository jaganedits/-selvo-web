"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { mainFirestore } from "@/lib/firebase/config";
import { useAuth } from "@/providers/auth-provider";
import type { UserRole } from "@/lib/types/user";

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function checkRole() {
      try {
        const snap = await getDoc(doc(mainFirestore, "users", user!.uid));
        if (cancelled) return;
        const role = snap.exists() ? (snap.data().role as UserRole | undefined) : undefined;
        setIsAdmin(role === "admin");
      } catch {
        if (!cancelled) setIsAdmin(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    checkRole();
    return () => { cancelled = true; };
  }, [user]);

  return { isAdmin, loading };
}
