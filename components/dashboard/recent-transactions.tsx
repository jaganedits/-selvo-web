"use client";

import { CircleDot } from "lucide-react";
import { getCategoryIcon, argbToHex } from "@/lib/utils/icon-helpers";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { Transaction, Category } from "@/lib/types";

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
}

export function RecentTransactions({ transactions, categories }: RecentTransactionsProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Recent Transactions
      </h2>
      {transactions.length > 0 ? (
        <div className="space-y-1">
          {transactions.map((tx) => {
            const cat = categories.find((c) => c.name === tx.category);
            const Icon = cat ? getCategoryIcon(cat.iconCode) : CircleDot;
            const color = cat ? argbToHex(cat.colorValue) : "#95A5A6";
            const isIncome = tx.type === "income";
            return (
              <div
                key={tx.id}
                className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-muted/50 transition-colors -mx-2"
              >
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${color}18` }}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate leading-tight">{tx.name}</p>
                  <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                    {tx.category} · {formatDate(tx.date)}
                  </p>
                </div>
                <span
                  className={`text-sm font-semibold tabular-nums shrink-0 ${
                    isIncome ? "text-income" : "text-expense"
                  }`}
                >
                  {isIncome ? "+" : "-"}
                  {formatCurrency(tx.amount)}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-8">No transactions yet</p>
      )}
    </div>
  );
}
