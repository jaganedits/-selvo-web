"use client";

import { memo } from "react";
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";
import { Pencil, Trash2 } from "lucide-react";

import { formatCurrency } from "@/lib/utils/format";
import { getCategoryIcon, argbToHex } from "@/lib/utils/icon-helpers";
import type { Recurring } from "@/lib/types";
import type { Category } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface RecurringRowProps {
  item: Recurring;
  category: Category | undefined;
  onToggle: (id: string, currentActive: boolean) => void;
  onEdit: (item: Recurring) => void;
  onDelete: (item: { id: string; name: string }) => void;
}

export const RecurringRow = memo(function RecurringRow({
  item,
  category,
  onToggle,
  onEdit,
  onDelete,
}: RecurringRowProps) {
  const Icon = category ? getCategoryIcon(category.iconCode) : undefined;
  const color = category ? argbToHex(category.colorValue) : "#95A5A6";
  const isExpense = item.type === "expense";
  const nextDate =
    item.nextDate instanceof Timestamp ? item.nextDate.toDate() : new Date();

  return (
    <div
      className={`grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto_auto_auto_auto_auto_auto] gap-3 items-center px-4 h-10 hover:bg-muted/40 transition-all border-l-2 border-l-transparent hover:border-l-orange/50 ${
        !item.isActive ? "opacity-50" : ""
      }`}
    >
      {/* Type badge */}
      <span
        className={`inline-flex items-center justify-center w-16 text-[10px] font-medium px-1.5 py-0.5 rounded-md ${
          isExpense
            ? "bg-expense/10 text-expense"
            : "bg-income/10 text-income"
        }`}
      >
        {isExpense ? "Expense" : "Income"}
      </span>

      {/* Name + category icon */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className="size-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${color}18` }}
        >
          {Icon ? (
            <Icon className="size-3.5" style={{ color }} />
          ) : (
            <span className="size-3.5" style={{ color }} />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-medium truncate">{item.name}</p>
          <p className="text-[11px] text-muted-foreground truncate md:hidden">
            {item.category} · {item.frequency} ·{" "}
            {format(nextDate, "dd MMM yyyy")}
          </p>
        </div>
      </div>

      {/* Mobile: amount + active toggle */}
      <div className="flex items-center gap-2 md:hidden">
        <span
          className={`text-[13px] tabular-nums font-medium ${
            isExpense ? "text-red-500" : "text-emerald-500"
          }`}
        >
          {formatCurrency(item.amount)}
        </span>
        <Checkbox
          checked={item.isActive}
          onCheckedChange={() => onToggle(item.id, item.isActive)}
        />
      </div>

      {/* Frequency (desktop) */}
      <span className="hidden md:inline-flex items-center justify-center w-20 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-muted capitalize">
        {item.frequency}
      </span>

      {/* Amount (desktop) */}
      <span
        className={`hidden md:block w-24 text-right text-[13px] tabular-nums font-medium ${
          isExpense ? "text-red-500" : "text-emerald-500"
        }`}
      >
        {formatCurrency(item.amount)}
      </span>

      {/* Next date (desktop) */}
      <span className="hidden md:block w-24 text-right text-[12px] text-muted-foreground tabular-nums">
        {format(nextDate, "dd MMM yyyy")}
      </span>

      {/* Active toggle (desktop) */}
      <div className="hidden md:flex w-14 justify-center">
        <Checkbox
          checked={item.isActive}
          onCheckedChange={() => onToggle(item.id, item.isActive)}
        />
      </div>

      {/* Edit (desktop) */}
      <div className="hidden md:flex w-8 justify-center">
        <Button variant="ghost" size="icon-xs" onClick={() => onEdit(item)}>
          <Pencil className="size-3" />
        </Button>
      </div>

      {/* Delete (desktop) */}
      <div className="hidden md:flex w-8 justify-center">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onDelete({ id: item.id, name: item.name })}
        >
          <Trash2 className="size-3 text-red-500" />
        </Button>
      </div>
    </div>
  );
});
