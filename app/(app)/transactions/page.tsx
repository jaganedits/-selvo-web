"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Timestamp } from "firebase/firestore";
import { format } from "date-fns";
import { toast } from "sonner";
import * as LucideIcons from "lucide-react";
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  CircleDot,
  Loader2,
} from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { useFirebase } from "@/providers/firebase-provider";
import { useTransactions } from "@/lib/hooks/use-transactions";
import { useCategories } from "@/lib/hooks/use-categories";
import {
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/lib/services/firestore";
import { formatCurrency } from "@/lib/utils/format";
import { MATERIAL_TO_LUCIDE } from "@/lib/constants/icon-map";
import type { Transaction, TransactionType, PaymentMode } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Pagination, usePagination } from "@/components/shared/pagination";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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

function toDate(d: Timestamp | Date | string): Date {
  if (d instanceof Timestamp) return d.toDate();
  if (d instanceof Date) return d;
  return new Date(d as string);
}

function dateToInputValue(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { userFirestore } = useFirebase();
  const { transactions, loading } = useTransactions();
  const { categories, expenseCategories, incomeCategories } = useCategories();

  // ---- Filter state ----
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");

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
      // Clear the param from URL
      router.replace("/transactions", { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ---- Filtered & grouped transactions ----
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

  const { paginatedItems: paginatedTransactions, currentPage, totalPages, setCurrentPage, totalItems, pageSize } = usePagination(filtered, 20);

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

  // ---- Category lookup ----
  const catMap = useMemo(() => {
    const m = new Map<string, (typeof categories)[number]>();
    for (const c of categories) m.set(c.name, c);
    return m;
  }, [categories]);

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

  const openEdit = useCallback(
    (tx: Transaction) => {
      setEditingTx(tx);
      setFormType(tx.type);
      setFormAmount(String(tx.amount));
      setFormCategory(tx.category);
      setFormName(tx.name);
      setFormDate(dateToInputValue(toDate(tx.date)));
      setFormPaymentMode(tx.paymentMode || "");
      setFormNote(tx.note || "");
      setSheetOpen(true);
    },
    []
  );

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

  // ---- Date range display ----
  const dateRange = useMemo(() => {
    if (filtered.length === 0) return "";
    const dates = filtered.map((t) => toDate(t.date).getTime());
    const min = new Date(Math.min(...dates));
    const max = new Date(Math.max(...dates));
    return `${format(min, "dd MMM yyyy")} - ${format(max, "dd MMM yyyy")}`;
  }, [filtered]);

  // ---- Payment mode chips ----
  const paymentModes: PaymentMode[] = ["Cash", "Card", "UPI"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ================================================================== */}
      {/* HEADER                                                             */}
      {/* ================================================================== */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Transactions</h1>
        <div className="flex items-center gap-2">
          <Button variant="orange" size="default" onClick={() => openAdd("expense")}>
            <Plus className="size-4" />
            Add Expense
          </Button>
          <Button
            variant="outline"
            size="default"
            className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
            onClick={() => openAdd("income")}
          >
            <Plus className="size-4" />
            Add Income
          </Button>
        </div>
      </div>

      {/* ================================================================== */}
      {/* FILTER BAR                                                         */}
      {/* ================================================================== */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            className="pl-7 h-8 text-[13px]"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(0); }}
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-input p-0.5">
          {(["all", "income", "expense"] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setTypeFilter(f); setCurrentPage(0); }}
              className={`px-3 py-1 rounded-md text-[13px] font-medium transition-colors ${
                typeFilter === f
                  ? f === "income"
                    ? "bg-emerald-500 text-white"
                    : f === "expense"
                      ? "bg-orange text-white"
                      : "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        {dateRange && (
          <span className="text-[12px] text-muted-foreground ml-auto">
            {dateRange}
          </span>
        )}
      </div>

      <Separator />

      {/* ================================================================== */}
      {/* TRANSACTION TABLE                                                  */}
      {/* ================================================================== */}
      {grouped.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <CircleDot className="size-10 mb-3 opacity-30" />
          <p className="text-sm">No transactions found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([month, txs]) => (
            <div key={month}>
              <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {month}
              </h2>
              <div className="rounded-lg border divide-y">
                {txs.map((tx) => {
                  const cat = catMap.get(tx.category);
                  const Icon = cat ? getCategoryIcon(cat.iconCode) : CircleDot;
                  const color = cat ? argbToHex(cat.colorValue) : "#95A5A6";
                  const d = toDate(tx.date);
                  const isExpense = tx.type === "expense";

                  return (
                    <button
                      key={tx.id}
                      onClick={() => openEdit(tx)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors group"
                    >
                      {/* Icon */}
                      <div
                        className="size-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${color}18` }}
                      >
                        <Icon className="size-4" style={{ color }} />
                      </div>

                      {/* Name & category */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium truncate">{tx.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {tx.category}
                        </p>
                      </div>

                      {/* Date */}
                      <span className="text-[12px] text-muted-foreground w-24 text-right shrink-0 hidden sm:block">
                        {format(d, "dd MMM yyyy")}
                      </span>

                      {/* Payment mode */}
                      {tx.paymentMode ? (
                        <span className="text-[11px] text-muted-foreground w-10 text-center shrink-0 hidden md:block">
                          {tx.paymentMode}
                        </span>
                      ) : (
                        <span className="w-10 shrink-0 hidden md:block" />
                      )}

                      {/* Amount */}
                      <span
                        className={`text-[13px] font-semibold tabular-nums w-28 text-right shrink-0 ${
                          isExpense ? "text-red-500" : "text-emerald-500"
                        }`}
                      >
                        {isExpense ? "-" : "+"}
                        {formatCurrency(tx.amount)}
                      </span>

                      {/* Edit hint */}
                      <Pencil className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            pageSize={pageSize}
          />
        </div>
      )}

      {/* ================================================================== */}
      {/* ADD / EDIT SHEET                                                   */}
      {/* ================================================================== */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col overflow-y-auto">
          {/* Colored header */}
          <div
            className={`px-5 pt-5 pb-4 ${
              formType === "expense"
                ? "bg-orange/10"
                : "bg-emerald-500/10"
            }`}
          >
            <SheetHeader className="p-0">
              <SheetTitle>
                {editingTx ? "Edit Transaction" : "Add Transaction"}
              </SheetTitle>
            </SheetHeader>

            {/* Type toggle */}
            <div className="flex items-center gap-1 mt-3 rounded-lg border border-input p-0.5 w-fit bg-background">
              {(["expense", "income"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setFormType(t);
                    setFormCategory("");
                  }}
                  className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                    formType === t
                      ? t === "expense"
                        ? "bg-orange text-white"
                        : "bg-emerald-500 text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 px-5 py-4 space-y-5">
            {/* Amount */}
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
                  ₹
                </span>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  className="pl-8 h-12 text-2xl font-semibold"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                />
              </div>
            </div>

            {/* Category chips */}
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Category</Label>
              <div className="flex flex-wrap gap-1.5">
                {activeCats.map((c) => {
                  const CatIcon = getCategoryIcon(c.iconCode);
                  const catColor = argbToHex(c.colorValue);
                  const selected = formCategory === c.name;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setFormCategory(c.name)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium border transition-colors ${
                        selected
                          ? "border-foreground/30 bg-foreground/5"
                          : "border-transparent bg-muted/50 hover:bg-muted"
                      }`}
                    >
                      <CatIcon className="size-3.5" style={{ color: catColor }} />
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Name</Label>
              <Input
                placeholder="e.g. Groceries at DMart"
                className="h-9 text-[13px]"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Date</Label>
              <Input
                type="date"
                className="h-9 text-[13px] w-fit"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
              />
            </div>

            {/* Payment Mode — expense only */}
            {formType === "expense" && (
              <div className="space-y-1.5">
                <Label className="text-[12px] text-muted-foreground">Payment Mode</Label>
                <div className="flex items-center gap-1.5">
                  {paymentModes.map((pm) => (
                    <button
                      key={pm}
                      onClick={() =>
                        setFormPaymentMode(formPaymentMode === pm ? "" : pm)
                      }
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-colors ${
                        formPaymentMode === pm
                          ? "border-foreground/30 bg-foreground/5"
                          : "border-transparent bg-muted/50 hover:bg-muted"
                      }`}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Note */}
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Note</Label>
              <textarea
                rows={2}
                placeholder="Optional note..."
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-[13px] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none dark:bg-input/30"
                value={formNote}
                onChange={(e) => setFormNote(e.target.value)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="border-t px-5 py-4 flex items-center gap-2">
            {editingTx && (
              <Button
                variant="destructive"
                size="default"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="size-4" />
                Delete
              </Button>
            )}
            <div className="flex-1" />
            <Button
              variant="orange"
              size="xl"
              disabled={saving}
              onClick={handleSave}
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              {editingTx ? "Update" : "Save"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ================================================================== */}
      {/* DELETE CONFIRMATION DIALOG                                         */}
      {/* ================================================================== */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete Transaction</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-muted-foreground">
            Are you sure you want to delete &quot;{editingTx?.name}&quot;? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={deleting} onClick={handleDelete}>
              {deleting && <Loader2 className="size-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
