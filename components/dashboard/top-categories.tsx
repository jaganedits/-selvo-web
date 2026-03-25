"use client";

import { TrendingUp } from "lucide-react";
import { getCategoryIcon } from "@/lib/utils/icon-helpers";
import { formatCurrency } from "@/lib/utils/format";

interface CategoryEntry {
  name: string;
  amount: number;
  color: string;
  iconCode: number;
}

interface TopCategoriesProps {
  topCategories: CategoryEntry[];
  totalExpense: number;
  maxCatAmount: number;
}

export function TopCategories({
  topCategories,
  totalExpense,
  maxCatAmount,
}: TopCategoriesProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Top Categories
        </h2>
        <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      {topCategories.length > 0 ? (
        <div className="space-y-2.5">
          {topCategories.map((cat) => {
            const Icon = getCategoryIcon(cat.iconCode);
            const pct = totalExpense > 0 ? Math.round((cat.amount / totalExpense) * 100) : 0;
            return (
              <div key={cat.name} className="flex items-center gap-2.5">
                <div
                  className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${cat.color}18` }}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color: cat.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="font-medium truncate">{cat.name}</span>
                    <span className="text-muted-foreground tabular-nums ml-2">{pct}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(cat.amount / maxCatAmount) * 100}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
                <span className="text-xs font-semibold tabular-nums shrink-0 w-20 text-right">
                  {formatCurrency(cat.amount)}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-8">No expenses this month</p>
      )}
    </div>
  );
}
