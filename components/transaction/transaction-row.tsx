"use client";

import { memo } from "react";
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";
import { Pencil } from "lucide-react";
import { CategoryIcon } from "@/components/shared/category-icon";
import { formatCurrency } from "@/lib/utils/format";
import type { Transaction } from "@/lib/types";
import type { Category } from "@/lib/types";

export interface TransactionRowProps {
  tx: Transaction;
  category: Category | undefined;
  onClick: (tx: Transaction) => void;
}

function toDate(d: Timestamp | Date | string): Date {
  if (d instanceof Timestamp) return d.toDate();
  if (d instanceof Date) return d;
  return new Date(d as string);
}

export const TransactionRow = memo(function TransactionRow({ tx, category, onClick }: TransactionRowProps) {
  const d = toDate(tx.date);
  const isExpense = tx.type === "expense";

  return (
    <button
      onClick={() => onClick(tx)}
      className="w-full flex items-center gap-3 px-3 h-10 text-left hover:bg-muted/40 transition-all group border-b border-border/30 last:border-b-0 border-l-2 border-l-transparent hover:border-l-orange/50"
    >
      {/* Icon */}
      {category ? (
        <CategoryIcon iconCode={category.iconCode} colorValue={category.colorValue} size="sm" />
      ) : (
        <div className="h-6 w-6 rounded-lg flex items-center justify-center shrink-0 bg-muted/50" />
      )}

      {/* Name & category */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium truncate">{tx.name}</p>
        <p className="text-[11px] text-muted-foreground truncate sm:hidden">
          {tx.category}
        </p>
      </div>

      {/* Date */}
      <span className="text-[12px] text-muted-foreground w-24 text-right shrink-0 hidden sm:block tabular-nums">
        {format(d, "dd MMM yyyy")}
      </span>

      {/* Payment mode */}
      {tx.paymentMode ? (
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground w-10 text-center shrink-0 hidden md:block">
          {tx.paymentMode}
        </span>
      ) : (
        <span className="w-10 shrink-0 hidden md:block" />
      )}

      {/* Amount */}
      <span
        className={`text-[13px] tabular-nums font-medium w-28 text-right shrink-0 ${
          isExpense ? "text-expense" : "text-income"
        }`}
      >
        {isExpense ? "-" : "+"}
        {formatCurrency(tx.amount)}
      </span>

      {/* Edit hint */}
      <Pencil className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </button>
  );
});
