"use client";

import { formatCurrency } from "@/lib/utils/format";
import type { ValueType } from "recharts/types/component/DefaultTooltipContent";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MonthData {
  name: string;
  income: number;
  expense: number;
}

interface BarChartSectionProps {
  months: MonthData[];
}

export function BarChartSection({ months }: BarChartSectionProps) {
  return (
    <div className="lg:col-span-3 rounded-xl border border-border bg-card p-4">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        6-Month Trend
      </h2>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={months} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={45}
            tickFormatter={(v) => (v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`)}
          />
          <Tooltip
            formatter={(value?: ValueType) => formatCurrency(Number(value ?? 0))}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "var(--card)",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="income" name="Income" fill="#2ECC71" radius={[3, 3, 0, 0]} maxBarSize={32} />
          <Bar dataKey="expense" name="Expense" fill="#CF4500" radius={[3, 3, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-4 mt-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="h-2.5 w-2.5 rounded-sm bg-income" /> Income
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="h-2.5 w-2.5 rounded-sm bg-expense" /> Expense
        </div>
      </div>
    </div>
  );
}
