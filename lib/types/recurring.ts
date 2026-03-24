import { Timestamp } from "firebase/firestore";

export type Frequency = "daily" | "weekly" | "monthly";

export interface Recurring {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  name: string;
  frequency: Frequency;
  nextDate: Timestamp;
  paymentMode?: string;
  note?: string;
  isActive: boolean;
  createdAt: Timestamp;
}

export type RecurringFormData = Omit<Recurring, "id" | "createdAt">;
