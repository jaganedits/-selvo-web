"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Download, Tag, Repeat, Receipt, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { useTransactions } from "@/lib/hooks/use-transactions";
import { formatDate } from "@/lib/utils/format";

import { Button } from "@/components/ui/button";

const navLinks: { href: string; label: string; icon: React.ReactNode }[] = [
  { href: "/categories", label: "Categories", icon: <Tag className="size-4" /> },
  { href: "/recurring", label: "Recurring", icon: <Repeat className="size-4" /> },
  { href: "/splitwise", label: "Splitwise", icon: <Receipt className="size-4" /> },
];

export function DataSection() {
  const { transactions } = useTransactions();
  const router = useRouter();

  const exportAllCSV = useCallback(() => {
    if (transactions.length === 0) {
      toast.error("No transactions to export");
      return;
    }
    const header = "Name,Category,Amount,Date,Type,Payment Mode,Note";
    const rows = transactions.map((t) => {
      const date = formatDate(t.date);
      return `"${t.name}","${t.category}",${t.amount},"${date}","${t.type}","${t.paymentMode || ""}","${(t.note || "").replace(/"/g, '""')}"`;
    });
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "selvo-all-transactions.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  }, [transactions]);

  return (
    <>
      {/* Navigation section */}
      <div className="rounded-xl border border-border/60 bg-card p-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Navigation
        </h2>
        <div className="space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-[13px] font-medium text-foreground hover:bg-muted/60 transition-colors"
            >
              <span className="text-muted-foreground">{link.icon}</span>
              <span className="flex-1 text-left">{link.label}</span>
              <ChevronRight className="size-3.5 text-muted-foreground/50" />
            </button>
          ))}
        </div>
      </div>

      {/* Data section */}
      <div className="rounded-xl border border-border/60 bg-card p-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Data
        </h2>
        <p className="text-[13px] text-muted-foreground mb-3">
          Export all your transactions as a CSV file.
        </p>
        <Button variant="outline" size="sm" onClick={exportAllCSV}>
          <Download className="size-3.5" />
          Export CSV
        </Button>
      </div>
    </>
  );
}
