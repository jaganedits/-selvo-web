"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { Timestamp } from "firebase/firestore";
import { toast } from "sonner";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";

import { useTransactions } from "@/lib/hooks/use-transactions";
import { useCategories } from "@/lib/hooks/use-categories";
import {
  formatDate,
  formatMonthYear,
  getMonthKey,
} from "@/lib/utils/format";
import { argbToHex } from "@/lib/utils/icon-helpers";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { MonthNavigation } from "@/components/shared/month-navigation";

import { InsightCards } from "@/components/reports/insight-cards";

const PieChartSection = dynamic(
  () => import("@/components/reports/pie-chart-section").then((m) => ({ default: m.PieChartSection })),
  { ssr: false, loading: () => <div className="rounded-xl border border-border/60 bg-card p-4 h-85 animate-pulse" /> }
);

// ---------------------------------------------------------------------------
// Page
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

  // Pie chart data (maps categoryBreakdown → generic PieChartEntry shape)
  const pieData = useMemo(
    () =>
      categoryBreakdown.map((item) => ({
        name: item.name,
        value: item.amount,
        color: item.color,
        iconCode: item.iconCode,
        percentage: item.percentage,
      })),
    [categoryBreakdown]
  );

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
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4 animate-stagger-in stagger-1">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-heading font-semibold">Reports</h1>
        <MonthNavigation
          monthOffset={monthOffset}
          onMonthChange={setMonthOffset}
        />
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
            pieData={pieData}
            insights={insights}
            type="expense"
          />
        </TabsContent>

        <TabsContent value={1}>
          <ReportContent
            pieData={pieData}
            insights={insights}
            type="income"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Report Content — thin layout wrapper
// ---------------------------------------------------------------------------

import type { PieChartEntry } from "@/components/reports/pie-chart-section";
import type { InsightData } from "@/components/reports/insight-cards";

function ReportContent({
  pieData,
  insights,
  type,
}: {
  pieData: PieChartEntry[];
  insights: InsightData;
  type: "expense" | "income";
}) {
  return (
    <div className="space-y-4 mt-3">
      <PieChartSection
        data={pieData}
        title={`${type === "expense" ? "Expense" : "Income"} Breakdown`}
        emptyMessage={`No ${type} transactions this month`}
      />
      <InsightCards insights={insights} type={type} />
    </div>
  );
}
