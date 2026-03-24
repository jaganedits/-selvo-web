import { Timestamp } from "firebase/firestore";

export type CategoryType = "income" | "expense";

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  iconCode: number;
  colorValue: number;
  createdAt: Timestamp;
}

export type CategoryFormData = Omit<Category, "id" | "createdAt">;
