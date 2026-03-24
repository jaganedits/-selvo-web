import { initializeApp, deleteApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, deleteDoc, serverTimestamp, type Firestore } from "firebase/firestore";
import { mainFirestore } from "./config";
import type { UserFirebaseConfig } from "@/lib/types";

const CACHE_KEY = "selvo_firebase_config";
const APP_NAME = "userDb";

class UserFirebaseManager {
  private static _instance: UserFirebaseManager;
  private _app: FirebaseApp | null = null;
  private _firestore: Firestore | null = null;
  private _config: UserFirebaseConfig | null = null;

  private constructor() {}

  static get instance(): UserFirebaseManager {
    if (!UserFirebaseManager._instance) {
      UserFirebaseManager._instance = new UserFirebaseManager();
    }
    return UserFirebaseManager._instance;
  }

  get userFirestore(): Firestore | null { return this._firestore; }
  get config(): UserFirebaseConfig | null { return this._config; }
  get isConnected(): boolean { return this._firestore !== null; }

  async loadSavedConfig(uid: string): Promise<boolean> {
    // Try localStorage first
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const config = JSON.parse(cached) as UserFirebaseConfig;
          this._initApp(config);
          return true;
        } catch { /* fall through */ }
      }
    }
    // Fallback: load from main Firestore
    try {
      const userDoc = await getDoc(doc(mainFirestore, "users", uid));
      const data = userDoc.data();
      console.log("[UserFirebaseManager] User doc fields:", data ? Object.keys(data) : "doc not found");
      if (data?.firebaseConfig) {
        const config = data.firebaseConfig as UserFirebaseConfig;
        this._initApp(config);
        this._cacheConfig(config);
        return true;
      }
    } catch (e) {
      console.error("[UserFirebaseManager] Failed to load config from Firestore:", e);
    }
    return false;
  }

  async validateConfig(config: UserFirebaseConfig, uid?: string): Promise<{ valid: boolean; error?: string }> {
    let testApp: FirebaseApp | null = null;
    try {
      testApp = initializeApp({
        apiKey: config.apiKey,
        projectId: config.projectId,
        appId: config.appId,
        storageBucket: config.storageBucket,
        messagingSenderId: config.messagingSenderId,
      }, "testConnection");
      const testFs = getFirestore(testApp);
      const testDocRef = doc(testFs, "_connection_test", uid || "test");
      await setDoc(testDocRef, { timestamp: serverTimestamp() });
      await deleteDoc(testDocRef);
      return { valid: true };
    } catch (e) {
      return { valid: false, error: e instanceof Error ? e.message : "Connection failed" };
    } finally {
      if (testApp) await deleteApp(testApp);
    }
  }

  async isProjectUsedByOther(projectId: string, uid: string): Promise<string | null> {
    try {
      const ownerDoc = await getDoc(doc(mainFirestore, "firebase_projects", projectId));
      if (ownerDoc.exists()) {
        const data = ownerDoc.data();
        if (data.uid && data.uid !== uid) return data.uid;
      }
    } catch { /* ignore */ }
    return null;
  }

  async connectWithConfig(uid: string, config: UserFirebaseConfig): Promise<void> {
    // Save config to main Firestore
    await setDoc(doc(mainFirestore, "users", uid), {
      firebaseConfig: config,
      configSetAt: serverTimestamp(),
    }, { merge: true });

    // Register project ownership
    await setDoc(doc(mainFirestore, "firebase_projects", config.projectId), {
      uid,
      connectedAt: serverTimestamp(),
    });

    // Init the app and cache
    this._initApp(config);
    this._cacheConfig(config);
  }

  async disconnect(clearOwnership: boolean = false): Promise<void> {
    if (clearOwnership && this._config) {
      try {
        await deleteDoc(doc(mainFirestore, "firebase_projects", this._config.projectId));
      } catch { /* ignore */ }
    }
    if (this._app) {
      await deleteApp(this._app);
    }
    this._app = null;
    this._firestore = null;
    this._config = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem(CACHE_KEY);
    }
  }

  private _initApp(config: UserFirebaseConfig): void {
    // Clean up existing app if any
    const existing = getApps().find(a => a.name === APP_NAME);
    if (existing) {
      this._app = existing;
    } else {
      this._app = initializeApp({
        apiKey: config.apiKey,
        projectId: config.projectId,
        appId: config.appId,
        storageBucket: config.storageBucket,
        messagingSenderId: config.messagingSenderId,
      }, APP_NAME);
    }
    this._firestore = getFirestore(this._app);
    this._config = config;
  }

  private _cacheConfig(config: UserFirebaseConfig): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(CACHE_KEY, JSON.stringify(config));
    }
  }
}

export default UserFirebaseManager;
