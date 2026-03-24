import type { CategoryType } from "@/lib/types";

export interface DefaultCategory {
  name: string;
  type: CategoryType;
  iconCode: number;
  colorValue: number;
  lucideIcon: string;
  colorHex: string;
}

export const DEFAULT_EXPENSE_CATEGORIES: DefaultCategory[] = [
  { name: "Food & Dining", type: "expense", iconCode: 0xe56c, colorValue: 0xFFE74C3C, lucideIcon: "utensils", colorHex: "#E74C3C" },
  { name: "Groceries", type: "expense", iconCode: 0xe547, colorValue: 0xFFFF7043, lucideIcon: "shopping-cart", colorHex: "#FF7043" },
  { name: "Transport", type: "expense", iconCode: 0xe530, colorValue: 0xFF3498DB, lucideIcon: "bus", colorHex: "#3498DB" },
  { name: "Shopping", type: "expense", iconCode: 0xf37b, colorValue: 0xFF9B59B6, lucideIcon: "shopping-bag", colorHex: "#9B59B6" },
  { name: "Bills", type: "expense", iconCode: 0xe14b, colorValue: 0xFFF39C12, lucideIcon: "receipt", colorHex: "#F39C12" },
  { name: "Home", type: "expense", iconCode: 0xe318, colorValue: 0xFF8D6E63, lucideIcon: "home", colorHex: "#8D6E63" },
  { name: "Entertainment", type: "expense", iconCode: 0xe02c, colorValue: 0xFFE91E63, lucideIcon: "film", colorHex: "#E91E63" },
  { name: "Travel", type: "expense", iconCode: 0xe539, colorValue: 0xFF26A69A, lucideIcon: "plane", colorHex: "#26A69A" },
  { name: "Health", type: "expense", iconCode: 0xe548, colorValue: 0xFF2ECC71, lucideIcon: "heart-pulse", colorHex: "#2ECC71" },
  { name: "Education", type: "expense", iconCode: 0xe559, colorValue: 0xFF00BCD4, lucideIcon: "graduation-cap", colorHex: "#00BCD4" },
  { name: "Other", type: "expense", iconCode: 0xe5d3, colorValue: 0xFF95A5A6, lucideIcon: "more-horizontal", colorHex: "#95A5A6" },
];

export const DEFAULT_INCOME_CATEGORIES: DefaultCategory[] = [
  { name: "Salary", type: "income", iconCode: 0xe84f, colorValue: 0xFF2ECC71, lucideIcon: "landmark", colorHex: "#2ECC71" },
  { name: "Freelance", type: "income", iconCode: 0xe31e, colorValue: 0xFF3498DB, lucideIcon: "laptop", colorHex: "#3498DB" },
  { name: "Business", type: "income", iconCode: 0xea12, colorValue: 0xFFF39C12, lucideIcon: "store", colorHex: "#F39C12" },
  { name: "Investment", type: "income", iconCode: 0xe8e5, colorValue: 0xFF9B59B6, lucideIcon: "trending-up", colorHex: "#9B59B6" },
  { name: "Gift", type: "income", iconCode: 0xe8f6, colorValue: 0xFFE91E63, lucideIcon: "gift", colorHex: "#E91E63" },
  { name: "Other", type: "income", iconCode: 0xe5d3, colorValue: 0xFF95A5A6, lucideIcon: "more-horizontal", colorHex: "#95A5A6" },
];

export const ALL_DEFAULT_CATEGORIES = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES,
];
