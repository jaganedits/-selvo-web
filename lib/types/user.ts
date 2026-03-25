import { Timestamp } from "firebase/firestore";

export interface UserFirebaseConfig {
  apiKey: string;
  projectId: string;
  appId: string;
  storageBucket: string;
  messagingSenderId: string;
}

export type UserRole = "admin" | "user";

export interface UserProfile {
  name: string;
  email: string;
  role?: UserRole;
  disabled?: boolean;
  updatedAt?: Timestamp;
  createdAt?: Timestamp;
  splitwiseApiKey?: string;
  firebaseConfig?: UserFirebaseConfig;
  configSetAt?: Timestamp;
  budgetMonthKeys?: string[];
}
