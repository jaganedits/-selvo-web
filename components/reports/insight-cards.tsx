"use client";

import type React from "react";
import { Calculator, Hash, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";

export interface InsightData {
  total: number;
  count: number;
  topCategory: string;
  avg: number;
}

interface InsightCardsProps {
  insights: InsightData;
  type: "expense" | "income";
}

interface InsightCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

function InsightCard({ icon, label, value, color }: InsightCardProps) {
  return (
    <div className="rounded-xl border border-border/60 border-l-2 border-l-orange/30 bg-card p-3 transition-shadow duration-200 hover:shadow-(--shadow-card-hover)">
      <div className="flex items-center gap-1.5 mb-1.5 text-muted-foreground/60">
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p
        className={`text-base font-semibold font-heading tabular-nums truncate ${color}`}
      >
        {value}
      </p>
    </div>
  );
}

export function InsightCards({ insights, type }: InsightCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
      <InsightCard
        icon={<Calculator className="size-4" />}
        label="Total Amount"
        value={formatCurrency(insights.total)}
        color={type === "expense" ? "text-red-500" : "text-emerald-500"}
      />
      <InsightCard
        icon={<Hash className="size-4" />}
        label="Transactions"
        value={String(insights.count)}
        color="text-foreground"
      />
      <InsightCard
        icon={<TrendingUp className="size-4" />}
        label="Top Category"
        value={insights.topCategory}
        color="text-foreground"
      />
      <InsightCard
        icon={<Calculator className="size-4" />}
        label="Avg / Transaction"
        value={formatCurrency(insights.avg)}
        color="text-muted-foreground"
      />
    </div>
  );
}
