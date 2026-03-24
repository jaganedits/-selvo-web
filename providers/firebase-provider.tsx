"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { type Firestore } from "firebase/firestore";
import { useAuth } from "@/providers/auth-provider";
import UserFirebaseManager from "@/lib/firebase/user-firebase";
import { seedDefaultCategories } from "@/lib/services/firestore";
import { saveProfileOnLogin } from "@/lib/services/user-profile";
import { processPendingRecurring } from "@/lib/services/recurring";
import type { UserFirebaseConfig } from "@/lib/types";

interface FirebaseContextType {
  isConnected: boolean;
  loading: boolean;
  userFirestore: Firestore | null;
  config: UserFirebaseConfig | null;
  connectWithConfig: (config: UserFirebaseConfig) => Promise<void>;
  disconnect: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType>({
  isConnected: false,
  loading: true,
  userFirestore: null,
  config: null,
  connectWithConfig: async () => {},
  disconnect: async () => {},
});

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [userFirestore, setUserFirestore] = useState<Firestore | null>(null);
  const [config, setConfig] = useState<UserFirebaseConfig | null>(null);
  const [initialized, setInitialized] = useState(false);

  // loading is true whenever user exists but we haven't finished checking their config
  const loading = !!user && !initialized;

  useEffect(() => {
    if (!user) {
      setIsConnected(false);
      setInitialized(false);
      setUserFirestore(null);
      setConfig(null);
      return;
    }

    setInitialized(false);

    const manager = UserFirebaseManager.instance;

    async function init() {
      try {
        await saveProfileOnLogin(user!);

        const loaded = await manager.loadSavedConfig(user!.uid);
        if (loaded && manager.userFirestore) {
          setUserFirestore(manager.userFirestore);
          setConfig(manager.config);
          setIsConnected(true);

          // Process pending recurring transactions
          try {
            const count = await processPendingRecurring(manager.userFirestore!, user!.uid);
            if (count > 0) {
              console.log(`Processed ${count} pending recurring transactions`);
            }
          } catch { /* non-critical */ }
        }
      } catch (e) {
        console.error("[FirebaseProvider] init error:", e);
      } finally {
        setInitialized(true);
      }
    }

    init();
  }, [user]);

  const connectWithConfig = useCallback(
    async (newConfig: UserFirebaseConfig) => {
      if (!user) return;
      const manager = UserFirebaseManager.instance;
      await manager.connectWithConfig(user.uid, newConfig);

      // Seed default categories on first connect
      if (manager.userFirestore) {
        await seedDefaultCategories(manager.userFirestore, user.uid);
      }

      // Process pending recurring transactions
      try {
        const count = await processPendingRecurring(manager.userFirestore!, user.uid);
        if (count > 0) {
          console.log(`Processed ${count} pending recurring transactions`);
        }
      } catch { /* non-critical */ }

      setUserFirestore(manager.userFirestore);
      setConfig(manager.config);
      setIsConnected(true);
    },
    [user]
  );

  const disconnect = useCallback(async () => {
    const manager = UserFirebaseManager.instance;
    await manager.disconnect();
    setUserFirestore(null);
    setConfig(null);
    setIsConnected(false);
  }, []);

  return (
    <FirebaseContext.Provider
      value={{ isConnected, loading, userFirestore, config, connectWithConfig, disconnect }}
    >
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  return useContext(FirebaseContext);
}
