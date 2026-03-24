"use client";

import { useMemo } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useTransactions } from "@/lib/hooks/use-transactions";
import { useCategories } from "@/lib/hooks/use-categories";
import { formatCurrency, getGreeting, formatDate } from "@/lib/utils/format";
import { Timestamp } from "firebase/firestore";
import { MATERIAL_TO_LUCIDE } from "@/lib/constants/icon-map";
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { ValueType } from "recharts/types/component/DefaultTooltipContent";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

function getCategoryIcon(iconCode: number) {
  const name = MATERIAL_TO_LUCIDE[iconCode];
  if (!name) return LucideIcons.CircleDot;
  const pascal = name.split("-").map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join("");
  return (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>)[pascal] || LucideIcons.CircleDot;
}

function argbToHex(argb: number): string {
  return `#${(argb & 0x00FFFFFF).toString(16).padStart(6, "0")}`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { transactions, loading: txLoading } = useTransactions();
  const { categories } = useCategories();

  const stats = useMemo(() => {
    const now = new Date();
    const cm = now.getMonth();
    const cy = now.getFullYear();

    const monthTx = transactions.filter((t) => {
      const d = t.date instanceof Timestamp ? t.date.toDate() : new Date(t.date as unknown as string);
      return d.getMonth() === cm && d.getFullYear() === cy;
    });

    const income = monthTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = monthTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

    // Category breakdown
    const catMap = new Map<string, number>();
    monthTx.filter(t => t.type === "expense").forEach(t => {
      catMap.set(t.category, (catMap.get(t.category) || 0) + t.amount);
    });
    const categoryBreakdown = Array.from(catMap.entries())
      .map(([name, amount]) => {
        const cat = categories.find(c => c.name === name);
        return { name, amount, color: cat ? argbToHex(cat.colorValue) : "#95A5A6", iconCode: cat?.iconCode || 0 };
      })
      .sort((a, b) => b.amount - a.amount);

    // 6-month trend
    const months: { name: string; income: number; expense: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(cy, cm - i, 1);
      const mTx = transactions.filter(t => {
        const td = t.date instanceof Timestamp ? t.date.toDate() : new Date(t.date as unknown as string);
        return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
      });
      months.push({
        name: d.toLocaleString("default", { month: "short" }),
        income: mTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
        expense: mTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
      });
    }

    const topCategories = categoryBreakdown.slice(0, 8);
    const maxCatAmount = topCategories[0]?.amount || 1;

    const recent = [...transactions]
      .sort((a, b) => {
        const da = a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date as unknown as string);
        const db = b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date as unknown as string);
        return db.getTime() - da.getTime();
      })
      .slice(0, 7);

    return { income, expense, balance: income - expense, categoryBreakdown, months, topCategories, maxCatAmount, recent };
  }, [transactions, categories]);

  if (txLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Row 1: Greeting + Stat Chips */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold tracking-tight">
            {getGreeting()},{" "}
            <span className="text-orange">{user?.displayName || "User"}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Financial overview for this month</p>
        </div>

        {/* Stat chips — inline on desktop */}
        <div className="flex items-center gap-2">
          <StatChip
            label="Income"
            value={formatCurrency(stats.income)}
            icon={<ArrowUpRight className="h-3.5 w-3.5" />}
            color="text-income"
            bg="bg-income/10"
          />
          <StatChip
            label="Expense"
            value={formatCurrency(stats.expense)}
            icon={<ArrowDownRight className="h-3.5 w-3.5" />}
            color="text-expense"
            bg="bg-expense/10"
          />
          <StatChip
            label="Balance"
            value={formatCurrency(stats.balance)}
            icon={<Wallet className="h-3.5 w-3.5" />}
            color={stats.balance >= 0 ? "text-income" : "text-expense"}
            bg="bg-budget/10"
          />
        </div>
      </div>

      {/* Row 2: Charts — full width, side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Pie — 2 cols */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Expense Breakdown</h2>
          {stats.categoryBreakdown.length > 0 ? (
            <div className="flex items-center gap-4">
              <div className="w-[180px] h-[180px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="amount"
                      stroke="none"
                    >
                      {stats.categoryBreakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value?: ValueType) => formatCurrency(Number(value ?? 0))}
                      contentStyle={{ borderRadius: "8px", border: "1px solid var(--border)", background: "var(--card)", fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="flex-1 space-y-1.5 overflow-hidden">
                {stats.categoryBreakdown.slice(0, 6).map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2 text-xs">
                    <div className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="truncate text-muted-foreground">{cat.name}</span>
                    <span className="ml-auto font-medium tabular-nums">{formatCurrency(cat.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[180px] text-xs text-muted-foreground">No expenses this month</div>
          )}
        </div>

        {/* Bar — 3 cols */}
        <div className="lg:col-span-3 rounded-xl border border-border bg-card p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">6-Month Trend</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stats.months} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={45}
                tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`}
              />
              <Tooltip
                formatter={(value?: ValueType) => formatCurrency(Number(value ?? 0))}
                contentStyle={{ borderRadius: "8px", border: "1px solid var(--border)", background: "var(--card)", fontSize: "12px" }}
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
      </div>

      {/* Row 3: Categories + Transactions — side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Categories */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Top Categories</h2>
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          {stats.topCategories.length > 0 ? (
            <div className="space-y-2.5">
              {stats.topCategories.map((cat) => {
                const Icon = getCategoryIcon(cat.iconCode);
                const pct = stats.expense > 0 ? Math.round((cat.amount / stats.expense) * 100) : 0;
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
                          style={{ width: `${(cat.amount / stats.maxCatAmount) * 100}%`, backgroundColor: cat.color }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-semibold tabular-nums shrink-0 w-20 text-right">{formatCurrency(cat.amount)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-8">No expenses this month</p>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Recent Transactions</h2>
          {stats.recent.length > 0 ? (
            <div className="space-y-1">
              {stats.recent.map((tx) => {
                const cat = categories.find(c => c.name === tx.category);
                const Icon = cat ? getCategoryIcon(cat.iconCode) : LucideIcons.CircleDot;
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
                    <span className={`text-sm font-semibold tabular-nums shrink-0 ${isIncome ? "text-income" : "text-expense"}`}>
                      {isIncome ? "+" : "-"}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-8">No transactions yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatChip({
  label, value, icon, color, bg,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2">
      <div className={`h-7 w-7 rounded-lg ${bg} flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider leading-none">{label}</p>
        <p className={`text-sm font-bold font-heading tabular-nums leading-tight mt-0.5 ${color}`}>{value}</p>
      </div>
    </div>
  );
}
