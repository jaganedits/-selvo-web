const SPLITWISE_CATEGORY_MAP: Record<string, string> = {
  "Food and drink": "Food & Dining",
  "Groceries": "Groceries",
  "Transportation": "Transport",
  "Shopping": "Shopping",
  "Utilities": "Bills",
  "Household expenses": "Home",
  "Entertainment": "Entertainment",
  "Travel": "Travel",
  "Health and medical": "Health",
  "Education": "Education",
  "General": "Other",
};

function mapCategory(splitwiseCategory: string): string {
  return SPLITWISE_CATEGORY_MAP[splitwiseCategory] || "Other";
}

export interface SplitwiseExpense {
  id: number;
  description: string;
  cost: string;
  currency_code: string;
  date: string;
  category: { name: string };
  repayments: { from: number; to: number; amount: string }[];
  deleted_at: string | null;
  creation_method: string;
  users: {
    user: { id: number; first_name: string };
    owed_share: string;
    paid_share: string;
  }[];
}

export interface SplitwiseFriend {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  balance: { currency_code: string; amount: string }[];
}

export async function splitwiseGetCurrentUser(apiKey: string) {
  const res = await fetch("/api/splitwise/current-user", {
    headers: { "X-Splitwise-Key": apiKey },
  });
  if (!res.ok) throw new Error("Failed to get Splitwise user");
  return res.json();
}

export async function splitwiseGetExpenses(
  apiKey: string,
  limit = 50,
  offset = 0
): Promise<SplitwiseExpense[]> {
  const res = await fetch(
    `/api/splitwise/expenses?limit=${limit}&offset=${offset}`,
    {
      headers: { "X-Splitwise-Key": apiKey },
    }
  );
  if (!res.ok) throw new Error("Failed to get expenses");
  const data = await res.json();
  return data.expenses || [];
}

export async function splitwiseGetFriends(
  apiKey: string
): Promise<SplitwiseFriend[]> {
  const res = await fetch("/api/splitwise/friends", {
    headers: { "X-Splitwise-Key": apiKey },
  });
  if (!res.ok) throw new Error("Failed to get friends");
  const data = await res.json();
  return data.friends || [];
}

export function parseSplitwiseExpense(
  expense: SplitwiseExpense,
  currentUserId: number
) {
  const userShare = expense.users.find((u) => u.user.id === currentUserId);
  if (!userShare) return null;

  const owed = parseFloat(userShare.owed_share);
  if (owed <= 0) return null; // User doesn't owe anything

  const isSettlement =
    expense.creation_method === "payment" ||
    expense.description.toLowerCase().includes("settle") ||
    expense.description.toLowerCase().includes("payment");

  return {
    splitwiseId: String(expense.id),
    amount: owed,
    name: expense.description,
    category: isSettlement ? "Other" : mapCategory(expense.category?.name || "General"),
    date: expense.date,
    isSettlement,
  };
}
