import { Timestamp } from "firebase/firestore";

export type TransactionType = "income" | "expense";
export type PaymentMode = "Cash" | "Card" | "UPI" | "";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  name: string;
  date: Timestamp;
  note?: string;
  paymentMode?: PaymentMode;
  splitwiseId?: string;
  createdAt: Timestamp;
  recurringSourceId?: string;
  recurringOccurrenceAt?: Timestamp;
}

export type TransactionFormData = Omit<Transaction, "id" | "createdAt">;
