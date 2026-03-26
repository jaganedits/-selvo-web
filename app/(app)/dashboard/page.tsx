"use client";

import { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/providers/auth-provider";
import { useTransactions } from "@/lib/hooks/use-transactions";
import { useCategories } from "@/lib/hooks/use-categories";
import { getGreeting } from "@/lib/utils/format";
import { argbToHex } from "@/lib/utils/icon-helpers";
import { Timestamp } from "firebase/firestore";

import { SummaryCards } from "@/components/dashboard/summary-cards";
import { TopCategories } from "@/components/dashboard/top-categories";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import type { PieChartEntry } from "@/components/reports/pie-chart-section";
import { usePageTitle } from "@/lib/hooks/use-page-title";

const PieChartSection = dynamic(
  () => import("@/components/reports/pie-chart-section").then((m) => ({ default: m.PieChartSection })),
  { ssr: false, loading: () => <div className="rounded-xl border border-border/60 bg-card p-4 h-85 animate-pulse" /> }
);
const BarChartSection = dynamic(
  () => import("@/components/dashboard/bar-chart-section").then((m) => ({ default: m.BarChartSection })),
  { ssr: false, loading: () => <div className="lg:col-span-3 rounded-xl border border-border bg-card p-4 h-65 animate-pulse" /> }
);

export default function DashboardPage() {
  usePageTitle("Dashboard");
  const { user } = useAuth();
  const { transactions, loading: txLoading } = useTransactions();
  const { categories } = useCategories();

  // Keep greeting fresh (updates when page re-renders or every minute)
  const [greeting, setGreeting] = useState(getGreeting());
  useEffect(() => {
    setGreeting(getGreeting());
    const interval = setInterval(() => setGreeting(getGreeting()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const cm = now.getMonth();
    const cy = now.getFullYear();

    const monthTx = transactions.filter((t) => {
      const d =
        t.date instanceof Timestamp
          ? t.date.toDate()
          : new Date(t.date as unknown as string);
      return d.getMonth() === cm && d.getFullYear() === cy;
    });

    const income = monthTx
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const expense = monthTx
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);

    // Category breakdown
    const catMap = new Map<string, number>();
    monthTx
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        catMap.set(t.category, (catMap.get(t.category) || 0) + t.amount);
      });
    const categoryBreakdown = Array.from(catMap.entries())
      .map(([name, amount]) => {
        const cat = categories.find((c) => c.name === name);
        return {
          name,
          amount,
          color: cat ? argbToHex(cat.colorValue) : "#95A5A6",
          iconCode: cat?.iconCode || 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    // 6-month trend
    const months: { name: string; income: number; expense: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(cy, cm - i, 1);
      const mTx = transactions.filter((t) => {
        const td =
          t.date instanceof Timestamp
            ? t.date.toDate()
            : new Date(t.date as unknown as string);
        return (
          td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear()
        );
      });
      months.push({
        name: d.toLocaleString("default", { month: "short" }),
        income: mTx
          .filter((t) => t.type === "income")
          .reduce((s, t) => s + t.amount, 0),
        expense: mTx
          .filter((t) => t.type === "expense")
          .reduce((s, t) => s + t.amount, 0),
      });
    }

    const topCategories = categoryBreakdown.slice(0, 8);
    const maxCatAmount = topCategories[0]?.amount || 1;

    const recent = [...transactions]
      .sort((a, b) => {
        const da =
          a.date instanceof Timestamp
            ? a.date.toDate()
            : new Date(a.date as unknown as string);
        const db =
          b.date instanceof Timestamp
            ? b.date.toDate()
            : new Date(b.date as unknown as string);
        return db.getTime() - da.getTime();
      })
      .slice(0, 7);

    // Adapt categoryBreakdown to PieChartEntry shape
    const pieData: PieChartEntry[] = categoryBreakdown.map((cat) => ({
      name: cat.name,
      value: cat.amount,
      color: cat.color,
      iconCode: cat.iconCode,
      percentage:
        expense > 0 ? Math.round((cat.amount / expense) * 100) : undefined,
    }));

    return {
      income,
      expense,
      balance: income - expense,
      categoryBreakdown,
      pieData,
      months,
      topCategories,
      maxCatAmount,
      recent,
    };
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between animate-stagger-in stagger-1">
        <div>
          <h1 className="font-heading text-xl font-bold tracking-tight">
            {greeting},{" "}
            <span className="text-orange">{user?.displayName || "User"}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Financial overview for this month
          </p>
        </div>

        <SummaryCards
          income={stats.income}
          expense={stats.expense}
          balance={stats.balance}
        />
      </div>

      {/* Row 2: Charts — full width, side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 animate-stagger-in stagger-2">
        <div className="lg:col-span-2">
          <PieChartSection
            data={stats.pieData}
            title="Expense Breakdown"
            emptyMessage="No expenses this month"
          />
        </div>
        <BarChartSection months={stats.months} />
      </div>

      {/* Row 3: Categories + Transactions — side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-stagger-in stagger-3">
        <TopCategories
          topCategories={stats.topCategories}
          totalExpense={stats.expense}
          maxCatAmount={stats.maxCatAmount}
        />
        <RecentTransactions
          transactions={stats.recent}
          categories={categories}
        />
      </div>
    </div>
  );
}
