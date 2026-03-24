import { Timestamp } from "firebase/firestore";

export interface UserFirebaseConfig {
  apiKey: string;
  projectId: string;
  appId: string;
  storageBucket: string;
  messagingSenderId: string;
}

export interface UserProfile {
  name: string;
  email: string;
  updatedAt?: Timestamp;
  splitwiseApiKey?: string;
  firebaseConfig?: UserFirebaseConfig;
  configSetAt?: Timestamp;
  budgetMonthKeys?: string[];
}
