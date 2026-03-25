"use client";

import { ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";

interface SummaryCardsProps {
  income: number;
  expense: number;
  balance: number;
}

function StatChip({
  label,
  value,
  icon,
  color,
  bg,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2 shadow-sm">
      <div className={`h-7 w-7 rounded-lg ${bg} flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider leading-none">
          {label}
        </p>
        <p className={`text-sm font-bold font-heading tabular-nums leading-tight mt-0.5 ${color}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

export function SummaryCards({ income, expense, balance }: SummaryCardsProps) {
  return (
    <div className="flex items-center gap-2">
      <StatChip
        label="Income"
        value={formatCurrency(income)}
        icon={<ArrowUpRight className="h-3.5 w-3.5" />}
        color="text-income"
        bg="bg-income/15"
      />
      <StatChip
        label="Expense"
        value={formatCurrency(expense)}
        icon={<ArrowDownRight className="h-3.5 w-3.5" />}
        color="text-expense"
        bg="bg-expense/15"
      />
      <StatChip
        label="Balance"
        value={formatCurrency(balance)}
        icon={<Wallet className="h-3.5 w-3.5" />}
        color={balance >= 0 ? "text-income" : "text-expense"}
        bg="bg-budget/15"
      />
    </div>
  );
}
