"use client";

import { useState, useMemo, useCallback } from "react";
import { Timestamp } from "firebase/firestore";
import { toast } from "sonner";
import * as LucideIcons from "lucide-react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  CircleDot,
  Download,
  Hash,
  TrendingUp,
  Calculator,
} from "lucide-react";
import * as XLSX from "xlsx";
import type { ValueType } from "recharts/types/component/DefaultTooltipContent";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { useTransactions } from "@/lib/hooks/use-transactions";
import { useCategories } from "@/lib/hooks/use-categories";
import {
  formatCurrency,
  formatDate,
  formatMonthYear,
  getMonthKey,
} from "@/lib/utils/format";
import { MATERIAL_TO_LUCIDE } from "@/lib/constants/icon-map";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCategoryIcon(iconCode: number) {
  const name = MATERIAL_TO_LUCIDE[iconCode];
  if (!name) return CircleDot;
  const pascal = name
    .split("-")
    .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
  return (
    (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>)[pascal] ||
    CircleDot
  );
}

function argbToHex(argb: number): string {
  return `#${(argb & 0x00ffffff).toString(16).padStart(6, "0")}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ReportsPage() {
  const { transactions, loading: txLoading } = useTransactions();
  const { categories } = useCategories();

  // Month navigation
  const [monthOffset, setMonthOffset] = useState(0);
  const currentDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);
  const monthKey = getMonthKey(currentDate);

  // Active tab: 0 = expense, 1 = income
  const [activeTab, setActiveTab] = useState<number>(0);
  const activeType = activeTab === 0 ? "expense" : "income";

  // Filter transactions for the current month
  const monthTransactions = useMemo(() => {
    const cm = currentDate.getMonth();
    const cy = currentDate.getFullYear();
    return transactions.filter((t) => {
      const d =
        t.date instanceof Timestamp
          ? t.date.toDate()
          : new Date(t.date as unknown as string);
      return d.getMonth() === cm && d.getFullYear() === cy;
    });
  }, [transactions, currentDate]);

  // Category breakdown for selected type
  const categoryBreakdown = useMemo(() => {
    const filtered = monthTransactions.filter((t) => t.type === activeType);
    const catMap = new Map<string, number>();
    filtered.forEach((t) => {
      catMap.set(t.category, (catMap.get(t.category) || 0) + t.amount);
    });
    const total = filtered.reduce((s, t) => s + t.amount, 0);
    return Array.from(catMap.entries())
      .map(([name, amount]) => {
        const cat = categories.find((c) => c.name === name);
        return {
          name,
          amount,
          percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
          color: cat ? argbToHex(cat.colorValue) : "#95A5A6",
          iconCode: cat?.iconCode || 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [monthTransactions, activeType, categories]);

  // Insights
  const insights = useMemo(() => {
    const filtered = monthTransactions.filter((t) => t.type === activeType);
    const total = filtered.reduce((s, t) => s + t.amount, 0);
    const count = filtered.length;
    const topCategory = categoryBreakdown[0]?.name || "N/A";
    const avg = count > 0 ? total / count : 0;
    return { total, count, topCategory, avg };
  }, [monthTransactions, activeType, categoryBreakdown]);

  // Export helpers
  const exportToExcel = useCallback(() => {
    const filtered = monthTransactions.filter((t) => t.type === activeType);
    if (filtered.length === 0) {
      toast.error("No transactions to export");
      return;
    }
    const rows = filtered.map((t) => ({
      Name: t.name,
      Category: t.category,
      Amount: t.amount,
      Date: formatDate(t.date),
      Type: t.type,
      "Payment Mode": t.paymentMode || "",
      Note: t.note || "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, `selvo-${activeType}-${monthKey}.xlsx`);
    toast.success("Excel exported");
  }, [monthTransactions, activeType, monthKey]);

  const exportToCSV = useCallback(() => {
    const filtered = monthTransactions.filter((t) => t.type === activeType);
    if (filtered.length === 0) {
      toast.error("No transactions to export");
      return;
    }
    const header = "Name,Category,Amount,Date,Type,Payment Mode,Note";
    const rows = filtered.map((t) => {
      const date = formatDate(t.date);
      return `"${t.name}","${t.category}",${t.amount},"${date}","${t.type}","${t.paymentMode || ""}","${(t.note || "").replace(/"/g, '""')}"`;
    });
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `selvo-${activeType}-${monthKey}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  }, [monthTransactions, activeType, monthKey]);

  if (txLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-heading font-semibold">Reports</h1>
        <div className="flex items-center gap-2">
          {/* Month nav */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setMonthOffset((o) => o - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-[13px] font-medium w-32 text-center tabular-nums">
              {formatMonthYear(currentDate)}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setMonthOffset((o) => o + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue={0}
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as number)}
      >
        <div className="flex items-center justify-between gap-2">
          <TabsList className="w-fit">
            <TabsTrigger value={0}>Expense</TabsTrigger>
            <TabsTrigger value={1}>Income</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" onClick={exportToExcel}>
              <Download className="size-3.5" />
              Excel
            </Button>
            <Button variant="ghost" size="sm" onClick={exportToCSV}>
              <Download className="size-3.5" />
              CSV
            </Button>
          </div>
        </div>

        <TabsContent value={0}>
          <ReportContent
            categoryBreakdown={categoryBreakdown}
            insights={insights}
            categories={categories}
            type="expense"
          />
        </TabsContent>

        <TabsContent value={1}>
          <ReportContent
            categoryBreakdown={categoryBreakdown}
            insights={insights}
            categories={categories}
            type="income"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Report Content sub-component
// ---------------------------------------------------------------------------

function ReportContent({
  categoryBreakdown,
  insights,
  categories,
  type,
}: {
  categoryBreakdown: {
    name: string;
    amount: number;
    percentage: number;
    color: string;
    iconCode: number;
  }[];
  insights: {
    total: number;
    count: number;
    topCategory: string;
    avg: number;
  };
  categories: { name: string; iconCode: number; colorValue: number }[];
  type: "expense" | "income";
}) {
  return (
    <div className="space-y-4 mt-3">
      {/* Pie chart + legend */}
      <div className="rounded-xl border border-border/60 bg-card p-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-4">
          {type === "expense" ? "Expense" : "Income"} Breakdown
        </h2>
        {categoryBreakdown.length > 0 ? (
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-55 h-55 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="amount"
                    stroke="none"
                  >
                    {categoryBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value?: ValueType) =>
                      formatCurrency(Number(value ?? 0))
                    }
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex-1 space-y-2 w-full">
              {categoryBreakdown.map((cat) => {
                const Icon = getCategoryIcon(cat.iconCode);
                return (
                  <div
                    key={cat.name}
                    className="flex items-center gap-2.5 text-sm"
                  >
                    <div
                      className="size-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${cat.color}18` }}
                    >
                      <Icon className="size-3.5" style={{ color: cat.color }} />
                    </div>
                    <span className="truncate text-[13px] font-medium flex-1 min-w-0">
                      {cat.name}
                    </span>
                    <span className="text-[12px] text-muted-foreground tabular-nums shrink-0">
                      {cat.percentage}%
                    </span>
                    <span className="text-[13px] font-semibold tabular-nums shrink-0 w-24 text-right">
                      {formatCurrency(cat.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-55 text-xs text-muted-foreground">
            No {type} transactions this month
          </div>

        )}
      </div>

      {/* Insights row */}
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
    </div>
  );
}

// ---------------------------------------------------------------------------
// Insight Card sub-component
// ---------------------------------------------------------------------------

function InsightCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-3">
      <div className="flex items-center gap-1.5 mb-1.5 text-muted-foreground/60">
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className={`text-base font-semibold font-heading tabular-nums truncate ${color}`}>
        {value}
      </p>
    </div>
  );
}
