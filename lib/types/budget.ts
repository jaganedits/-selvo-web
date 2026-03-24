export interface Budget {
  id: string;
  category: string;
  amount: number;
  name?: string;
}

export type BudgetFormData = Omit<Budget, "id">;
