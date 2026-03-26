"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Timestamp } from "firebase/firestore";
import { format } from "date-fns";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { useFirebase } from "@/providers/firebase-provider";
import { useTransactions } from "@/lib/hooks/use-transactions";
import { useCategories } from "@/lib/hooks/use-categories";
import {
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/lib/services/firestore";
import type { Transaction, TransactionType, PaymentMode } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Pagination, usePagination } from "@/components/shared/pagination";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";

import { TransactionFilterBar } from "@/components/transaction/transaction-filter-bar";
import type { TypeFilter } from "@/components/transaction/transaction-filter-bar";
import { TransactionRow } from "@/components/transaction/transaction-row";
import { TransactionForm } from "@/components/transaction/transaction-form";
import { usePageTitle } from "@/lib/hooks/use-page-title";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toDate(d: Timestamp | Date | string): Date {
  if (d instanceof Timestamp) return d.toDate();
  if (d instanceof Date) return d;
  return new Date(d as string);
}

function dateToInputValue(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TransactionsPage() {
  usePageTitle("Transactions");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { userFirestore } = useFirebase();
  const { transactions, loading } = useTransactions();
  const { categories, expenseCategories, incomeCategories } = useCategories();

  // ---- Filter state ----
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  // ---- Sheet state ----
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // ---- Form state ----
  const [formType, setFormType] = useState<TransactionType>("expense");
  const [formAmount, setFormAmount] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formName, setFormName] = useState("");
  const [formDate, setFormDate] = useState(dateToInputValue(new Date()));
  const [formPaymentMode, setFormPaymentMode] = useState<PaymentMode>("");
  const [formNote, setFormNote] = useState("");
  const [saving, setSaving] = useState(false);

  // ---- Delete confirmation ----
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ---- Debounced search ----
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // ---- URL param: ?add=expense or ?add=income ----
  useEffect(() => {
    const addParam = searchParams.get("add");
    if (addParam === "expense" || addParam === "income") {
      resetForm(addParam as TransactionType);
      setEditingTx(null);
      setSheetOpen(true);
      router.replace("/transactions", { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ---- Filtered transactions ----
  const filtered = useMemo(() => {
    let list = transactions;
    if (typeFilter !== "all") {
      list = list.filter((t) => t.type === typeFilter);
    }
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.note && t.note.toLowerCase().includes(q))
      );
    }
    return list;
  }, [transactions, typeFilter, debouncedSearch]);

  const {
    paginatedItems: paginatedTransactions,
    currentPage,
    totalPages,
    setCurrentPage,
    totalItems,
    pageSize,
  } = usePagination(filtered, 20);

  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of paginatedTransactions) {
      const d = toDate(tx.date);
      const key = format(d, "MMMM yyyy");
      const arr = map.get(key);
      if (arr) arr.push(tx);
      else map.set(key, [tx]);
    }
    return Array.from(map.entries());
  }, [paginatedTransactions]);

  // ---- Category lookup map ----
  const catMap = useMemo(() => {
    const m = new Map<string, (typeof categories)[number]>();
    for (const c of categories) m.set(c.name, c);
    return m;
  }, [categories]);

  // ---- Date range display ----
  const dateRange = useMemo(() => {
    if (filtered.length === 0) return "";
    const dates = filtered.map((t) => toDate(t.date).getTime());
    const min = new Date(Math.min(...dates));
    const max = new Date(Math.max(...dates));
    return `${format(min, "dd MMM yyyy")} - ${format(max, "dd MMM yyyy")}`;
  }, [filtered]);

  // ---- Form helpers ----
  const resetForm = useCallback((type: TransactionType = "expense") => {
    setFormType(type);
    setFormAmount("");
    setFormCategory("");
    setFormName("");
    setFormDate(dateToInputValue(new Date()));
    setFormPaymentMode("");
    setFormNote("");
  }, []);

  const openAdd = useCallback(
    (type: TransactionType) => {
      resetForm(type);
      setEditingTx(null);
      setSheetOpen(true);
    },
    [resetForm]
  );

  const openEdit = useCallback((tx: Transaction) => {
    setEditingTx(tx);
    setFormType(tx.type);
    setFormAmount(String(tx.amount));
    setFormCategory(tx.category);
    setFormName(tx.name);
    setFormDate(dateToInputValue(toDate(tx.date)));
    setFormPaymentMode(tx.paymentMode || "");
    setFormNote(tx.note || "");
    setSheetOpen(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!user || !userFirestore) return;
    const amt = parseFloat(formAmount);
    if (!amt || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (!formCategory) {
      toast.error("Select a category");
      return;
    }
    if (!formName.trim()) {
      toast.error("Enter a name");
      return;
    }

    setSaving(true);
    try {
      const data = {
        type: formType,
        amount: amt,
        category: formCategory,
        name: formName.trim(),
        date: Timestamp.fromDate(new Date(formDate)),
        paymentMode: (formType === "expense" ? formPaymentMode : "") as PaymentMode,
        note: formNote.trim() || "",
      };

      if (editingTx) {
        await updateTransaction(userFirestore, user.uid, editingTx.id, data);
        toast.success("Transaction updated");
      } else {
        await addTransaction(userFirestore, user.uid, data);
        toast.success("Transaction added");
      }
      setSheetOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }, [
    user,
    userFirestore,
    formAmount,
    formCategory,
    formName,
    formType,
    formDate,
    formPaymentMode,
    formNote,
    editingTx,
  ]);

  const handleDelete = useCallback(async () => {
    if (!user || !userFirestore || !editingTx) return;
    setDeleting(true);
    try {
      await deleteTransaction(userFirestore, user.uid, editingTx.id);
      toast.success("Transaction deleted");
      setDeleteDialogOpen(false);
      setSheetOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  }, [user, userFirestore, editingTx]);

  // ---- Active categories for form ----
  const activeCats = formType === "expense" ? expenseCategories : incomeCategories;

  // ---- Handle filter changes (also reset pagination) ----
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      setCurrentPage(0);
    },
    [setCurrentPage]
  );

  const handleTypeFilterChange = useCallback(
    (value: TypeFilter) => {
      setTypeFilter(value);
      setCurrentPage(0);
    },
    [setCurrentPage]
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between animate-stagger-in stagger-1 shrink-0">
        <h1 className="text-lg font-heading font-semibold">Transactions</h1>
        <div className="flex items-center gap-2">
          <Button variant="orange" size="default" onClick={() => openAdd("expense")}>
            <Plus className="size-4" />
            Add Expense
          </Button>
          <Button
            variant="income"
            size="default"
            onClick={() => openAdd("income")}
          >
            <Plus className="size-4" />
            Add Income
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="shrink-0 mt-4">
        <TransactionFilterBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          typeFilter={typeFilter}
          onTypeFilterChange={handleTypeFilterChange}
          dateRange={dateRange}
        />
      </div>

      {/* Transaction list — scrollable */}
      <div className="animate-stagger-in stagger-2 mt-4 min-h-0 flex flex-col flex-1">
      {grouped.length === 0 ? (
        <EmptyState message="No transactions found" />
      ) : (
        <>
          <div className="flex-1 min-h-0 overflow-y-auto space-y-5 custom-scrollbar">
            {grouped.map(([month, txs]) => (
              <div key={month}>
                <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">
                  {month}
                </h2>
                <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
                  {/* Column headers */}
                  <div className="hidden sm:flex items-center gap-3 px-3 h-8 border-b border-border/30 bg-muted/20">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 flex-1 min-w-0 pl-11">Name</span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-24 text-right shrink-0">Date</span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-10 text-center shrink-0 hidden md:block">Mode</span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-28 text-right shrink-0">Amount</span>
                    <span className="w-3.5 shrink-0" />
                  </div>
                  {txs.map((tx) => (
                    <TransactionRow
                      key={tx.id}
                      tx={tx}
                      category={catMap.get(tx.category)}
                      onClick={openEdit}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="shrink-0 pt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalItems}
              pageSize={pageSize}
            />
          </div>
        </>
      )}
      </div>

      {/* Add / Edit Sheet */}
      <TransactionForm
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editingTx={editingTx}
        formType={formType}
        formAmount={formAmount}
        formCategory={formCategory}
        formName={formName}
        formDate={formDate}
        formPaymentMode={formPaymentMode}
        formNote={formNote}
        onTypeChange={setFormType}
        onAmountChange={setFormAmount}
        onCategoryChange={setFormCategory}
        onNameChange={setFormName}
        onDateChange={setFormDate}
        onPaymentModeChange={setFormPaymentMode}
        onNoteChange={setFormNote}
        onSave={handleSave}
        onDeleteRequest={() => setDeleteDialogOpen(true)}
        saving={saving}
        activeCats={activeCats}
      />

      {/* Delete confirmation */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Transaction"
        message={`Are you sure you want to delete "${editingTx?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={deleting}
        destructive
      />
    </div>
  );
}
