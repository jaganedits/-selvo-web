"use client";

import { Loader2, Receipt } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatDate } from "@/lib/utils/format";

interface ParsedExpense {
  splitwiseId: string;
  amount: number;
  name: string;
  category: string;
  date: string;
  isSettlement: boolean;
}

interface ExpenseTableProps {
  loading: boolean;
  parsedExpenses: ParsedExpense[];
  paginatedExpenses: ParsedExpense[];
  importedIds: Set<string>;
  selectedIds: Set<string>;
  pageSelectableExpenses: ParsedExpense[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  // Pagination
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function ExpenseTable({
  loading,
  parsedExpenses,
  paginatedExpenses,
  importedIds,
  selectedIds,
  pageSelectableExpenses,
  onToggleSelect,
  onToggleSelectAll,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: ExpenseTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (parsedExpenses.length === 0) {
    return <EmptyState icon={Receipt} message="No expenses found" />;
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      {/* Column headers */}
      <div className="hidden sm:grid sm:grid-cols-[24px_1fr_100px_110px_100px] items-center gap-2 px-4 h-8 border-b border-border/30 bg-muted/20">
        <span />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Name
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Category
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right">
          Date
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right">
          Amount
        </span>
      </div>

      {/* Select all */}
      {pageSelectableExpenses.length > 0 && (
        <div className="flex items-center gap-2 px-4 h-8 border-b border-border/30 bg-muted/10">
          <Checkbox
            checked={
              pageSelectableExpenses.length > 0 &&
              pageSelectableExpenses.every((e) =>
                selectedIds.has(e.splitwiseId)
              )
            }
            onCheckedChange={onToggleSelectAll}
          />
          <span className="text-[11px] text-muted-foreground">
            Select all ({pageSelectableExpenses.length})
          </span>
        </div>
      )}

      {/* Expense rows */}
      <div className="divide-y divide-border/30">
        {paginatedExpenses.map((expense) => {
          const alreadyImported = importedIds.has(expense.splitwiseId);
          return (
            <div
              key={expense.splitwiseId}
              className={`px-4 h-10 transition-all border-l-2 ${
                alreadyImported
                  ? "opacity-50 bg-muted/20 border-l-transparent"
                  : "hover:bg-muted/40 border-l-transparent hover:border-l-orange/50"
              }`}
            >
              {/* Mobile layout */}
              <div className="flex items-center gap-2 h-full sm:hidden">
                <Checkbox
                  checked={selectedIds.has(expense.splitwiseId)}
                  onCheckedChange={() => onToggleSelect(expense.splitwiseId)}
                  disabled={alreadyImported}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate">
                    {expense.name}
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <span className="text-[11px] text-muted-foreground">
                      {expense.category}
                    </span>
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      {formatCurrency(expense.amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Desktop grid layout — matches header columns exactly */}
              <div className="hidden sm:grid sm:grid-cols-[24px_1fr_100px_110px_100px] items-center gap-2 h-full">
                <Checkbox
                  checked={selectedIds.has(expense.splitwiseId)}
                  onCheckedChange={() => onToggleSelect(expense.splitwiseId)}
                  disabled={alreadyImported}
                />
                <p className="text-[13px] font-medium truncate">
                  {expense.name}
                </p>
                <span className="text-[12px] text-muted-foreground truncate">
                  {expense.category}
                </span>
                <span className="text-[12px] text-muted-foreground text-right tabular-nums">
                  {alreadyImported ? "Imported" : formatDate(expense.date)}
                </span>
                <span className="text-[13px] font-medium text-right tabular-nums text-expense">
                  {formatCurrency(expense.amount)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-4 pb-3">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          totalItems={totalItems}
          pageSize={pageSize}
        />
      </div>
    </div>
  );
}
