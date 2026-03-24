"use client";

import { useMemo } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useTransactions } from "@/lib/hooks/use-transactions";
import { useCategories } from "@/lib/hooks/use-categories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, getGreeting, formatDate } from "@/lib/utils/format";
import { Timestamp } from "firebase/firestore";
import { MATERIAL_TO_LUCIDE } from "@/lib/constants/icon-map";
import { ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";

function getCategoryIcon(iconCode: number) {
  const name = MATERIAL_TO_LUCIDE[iconCode];
  if (!name) return LucideIcons.CircleDot;
  // Convert kebab-case to PascalCase
  const pascal = name.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join("");
  return (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>)[pascal] || LucideIcons.CircleDot;
}

function argbToHex(argb: number): string {
  const hex = (argb & 0x00FFFFFF).toString(16).padStart(6, "0");
  return `#${hex}`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { transactions, loading: txLoading } = useTransactions();
  const { categories } = useCategories();

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthTx = transactions.filter((t) => {
      const d = t.date instanceof Timestamp ? t.date.toDate() : new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const income = monthTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = monthTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const balance = income - expense;

    // Category breakdown for pie chart
    const categoryMap = new Map<string, number>();
    monthTx.filter(t => t.type === "expense").forEach(t => {
      categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
    });

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([name, amount]) => {
        const cat = categories.find(c => c.name === name);
        return {
          name,
          amount,
          color: cat ? argbToHex(cat.colorValue) : "#95A5A6",
          iconCode: cat?.iconCode || 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    // 6-month trend for bar chart
    const months: { name: string; income: number; expense: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      const mTx = transactions.filter(t => {
        const td = t.date instanceof Timestamp ? t.date.toDate() : new Date(t.date);
        return td.getMonth() === m && td.getFullYear() === y;
      });
      months.push({
        name: d.toLocaleString("default", { month: "short" }),
        income: mTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
        expense: mTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
      });
    }

    // Top 8 categories
    const topCategories = categoryBreakdown.slice(0, 8);
    const maxCatAmount = topCategories[0]?.amount || 1;

    // Recent 5 transactions
    const recent = [...transactions]
      .sort((a, b) => {
        const da = a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date);
        const db = b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date);
        return db.getTime() - da.getTime();
      })
      .slice(0, 5);

    return { income, expense, balance, categoryBreakdown, months, topCategories, maxCatAmount, recent };
  }, [transactions, categories]);

  if (txLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Greeting */}
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold">
          {getGreeting()},{" "}
          <span className="text-orange">{user?.displayName || "User"}</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Here&apos;s your financial overview</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Income</p>
                <p className="text-2xl font-bold font-heading text-income mt-1">{formatCurrency(stats.income)}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-income/10 flex items-center justify-center">
                <ArrowUpRight className="h-5 w-5 text-income" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Expense</p>
                <p className="text-2xl font-bold font-heading text-expense mt-1">{formatCurrency(stats.expense)}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-expense/10 flex items-center justify-center">
                <ArrowDownRight className="h-5 w-5 text-expense" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Balance</p>
                <p className={`text-2xl font-bold font-heading mt-1 ${stats.balance >= 0 ? "text-income" : "text-expense"}`}>
                  {formatCurrency(stats.balance)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-budget/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-budget" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="amount"
                    nameKey="name"
                  >
                    {stats.categoryBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value?: ValueType) => formatCurrency(Number(value ?? 0))}
                    contentStyle={{ borderRadius: "12px", border: "1px solid var(--border)", background: "var(--card)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">
                No expenses this month
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">6-Month Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.months}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                <Tooltip
                  formatter={(value?: ValueType) => formatCurrency(Number(value ?? 0))}
                  contentStyle={{ borderRadius: "12px", border: "1px solid var(--border)", background: "var(--card)" }}
                />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#2ECC71" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#CF4500" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Top Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.topCategories.length > 0 ? (
              stats.topCategories.map((cat) => {
                const Icon = getCategoryIcon(cat.iconCode);
                const pct = Math.round((cat.amount / stats.expense) * 100);
                return (
                  <div key={cat.name} className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${cat.color}20` }}
                    >
                      <Icon className="h-4 w-4" style={{ color: cat.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate">{cat.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(cat.amount / stats.maxCatAmount) * 100}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium shrink-0">{formatCurrency(cat.amount)}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No expenses this month</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recent.length > 0 ? (
              stats.recent.map((tx) => {
                const cat = categories.find(c => c.name === tx.category);
                const Icon = cat ? getCategoryIcon(cat.iconCode) : LucideIcons.CircleDot;
                const color = cat ? argbToHex(cat.colorValue) : "#95A5A6";
                const isIncome = tx.type === "income";
                return (
                  <div key={tx.id} className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <Icon className="h-4 w-4" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tx.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.category} · {formatDate(tx.date)}
                      </p>
                    </div>
                    <span className={`text-sm font-semibold shrink-0 ${isIncome ? "text-income" : "text-expense"}`}>
                      {isIncome ? "+" : "-"}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No transactions yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
