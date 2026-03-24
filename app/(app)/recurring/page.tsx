"use client";

import { useState, useMemo, useCallback } from "react";
import { Timestamp } from "firebase/firestore";
import { format } from "date-fns";
import { toast } from "sonner";
import * as LucideIcons from "lucide-react";
import {
  Plus,
  Loader2,
  Trash2,
  Pencil,
  CircleDot,
} from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { useFirebase } from "@/providers/firebase-provider";
import { useRecurring } from "@/lib/hooks/use-recurring";
import { useCategories } from "@/lib/hooks/use-categories";
import {
  addRecurring,
  updateRecurring,
  toggleRecurring,
  deleteRecurring,
} from "@/lib/services/firestore";
import { formatCurrency } from "@/lib/utils/format";
import { MATERIAL_TO_LUCIDE } from "@/lib/constants/icon-map";
import type { Frequency, TransactionType, PaymentMode } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Pagination, usePagination } from "@/components/shared/pagination";
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

function dateToInputValue(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RecurringPage() {
  const { user } = useAuth();
  const { userFirestore } = useFirebase();
  const { recurring, loading } = useRecurring();
  const { categories, expenseCategories, incomeCategories } = useCategories();

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formType, setFormType] = useState<TransactionType>("expense");
  const [formCategory, setFormCategory] = useState("");
  const [formName, setFormName] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formFrequency, setFormFrequency] = useState<Frequency>("monthly");
  const [formNextDate, setFormNextDate] = useState(dateToInputValue(new Date()));
  const [formPaymentMode, setFormPaymentMode] = useState<PaymentMode>("");
  const [formNote, setFormNote] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Category lookup
  const catMap = useMemo(() => {
    const m = new Map<string, (typeof categories)[number]>();
    for (const c of categories) m.set(c.name, c);
    return m;
  }, [categories]);

  // Pagination
  const { paginatedItems: paginatedRecurring, currentPage, totalPages, setCurrentPage, totalItems, pageSize } = usePagination(recurring, 15);

  // Active categories for form
  const activeCats = formType === "expense" ? expenseCategories : incomeCategories;

  // Payment modes
  const paymentModes: PaymentMode[] = ["Cash", "Card", "UPI"];
  const frequencies: Frequency[] = ["daily", "weekly", "monthly"];

  // Form helpers
  const resetForm = useCallback(() => {
    setEditingId(null);
    setFormType("expense");
    setFormCategory("");
    setFormName("");
    setFormAmount("");
    setFormFrequency("monthly");
    setFormNextDate(dateToInputValue(new Date()));
    setFormPaymentMode("");
    setFormNote("");
    setFormIsActive(true);
  }, []);

  const openAdd = useCallback(() => {
    resetForm();
    setDialogOpen(true);
  }, [resetForm]);

  const openEdit = useCallback(
    (r: (typeof recurring)[number]) => {
      setEditingId(r.id);
      setFormType(r.type);
      setFormCategory(r.category);
      setFormName(r.name);
      setFormAmount(String(r.amount));
      setFormFrequency(r.frequency);
      setFormNextDate(
        dateToInputValue(
          r.nextDate instanceof Timestamp ? r.nextDate.toDate() : new Date()
        )
      );
      setFormPaymentMode((r.paymentMode as PaymentMode) || "");
      setFormNote(r.note || "");
      setFormIsActive(r.isActive);
      setDialogOpen(true);
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
        frequency: formFrequency,
        nextDate: Timestamp.fromDate(new Date(formNextDate)),
        paymentMode: formType === "expense" ? (formPaymentMode || undefined) : undefined,
        note: formNote.trim() || undefined,
        isActive: formIsActive,
      };

      if (editingId) {
        await updateRecurring(userFirestore, user.uid, editingId, data);
        toast.success("Recurring updated");
      } else {
        await addRecurring(userFirestore, user.uid, data);
        toast.success("Recurring added");
      }
      setDialogOpen(false);
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
    formFrequency,
    formNextDate,
    formPaymentMode,
    formNote,
    formIsActive,
    editingId,
  ]);

  const handleToggle = useCallback(
    async (id: string, currentActive: boolean) => {
      if (!user || !userFirestore) return;
      try {
        await toggleRecurring(userFirestore, user.uid, id, !currentActive);
        toast.success(currentActive ? "Paused" : "Activated");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to toggle");
      }
    },
    [user, userFirestore]
  );

  const openDelete = useCallback((item: { id: string; name: string }) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!user || !userFirestore || !deletingItem) return;
    setDeleting(true);
    try {
      await deleteRecurring(userFirestore, user.uid, deletingItem.id);
      toast.success("Recurring deleted");
      setDeleteDialogOpen(false);
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  }, [user, userFirestore, deletingItem]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-heading font-semibold">Recurring</h1>
        <Button variant="orange" size="default" onClick={openAdd}>
          <Plus className="size-4" />
          Add Recurring
        </Button>
      </div>

      {/* List */}
      {recurring.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <CircleDot className="size-8 mb-3 opacity-30" />
          <p className="text-[13px]">No recurring transactions</p>
          <p className="text-[11px] mt-1">Click &quot;Add Recurring&quot; to get started</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto_auto] gap-3 items-center px-4 h-8 border-b border-border/30 bg-muted/20 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            <span className="w-16">Type</span>
            <span>Name</span>
            <span className="w-20">Frequency</span>
            <span className="w-24 text-right">Amount</span>
            <span className="w-24 text-right">Next Date</span>
            <span className="w-14 text-center">Active</span>
            <span className="w-8" />
            <span className="w-8" />
          </div>

          {/* Rows */}
          <div className="divide-y divide-border/30">
            {paginatedRecurring.map((r) => {
              const cat = catMap.get(r.category);
              const Icon = cat ? getCategoryIcon(cat.iconCode) : CircleDot;
              const color = cat ? argbToHex(cat.colorValue) : "#95A5A6";
              const isExpense = r.type === "expense";
              const nextDate =
                r.nextDate instanceof Timestamp
                  ? r.nextDate.toDate()
                  : new Date();

              return (
                <div
                  key={r.id}
                  className={`grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto_auto_auto_auto_auto_auto] gap-3 items-center px-4 h-10 hover:bg-muted/40 transition-colors ${
                    !r.isActive ? "opacity-50" : ""
                  }`}
                >
                  {/* Type badge */}
                  <span
                    className={`inline-flex items-center justify-center w-16 text-[10px] font-medium px-1.5 py-0.5 rounded-md ${
                      isExpense
                        ? "bg-red-500/10 text-red-500"
                        : "bg-emerald-500/10 text-emerald-500"
                    }`}
                  >
                    {isExpense ? "Expense" : "Income"}
                  </span>

                  {/* Name + category icon */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="size-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${color}18` }}
                    >
                      <Icon className="size-3.5" style={{ color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium truncate">{r.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate md:hidden">
                        {r.category} · {r.frequency} · {format(nextDate, "dd MMM yyyy")}
                      </p>
                    </div>
                  </div>

                  {/* Mobile: amount + actions */}
                  <div className="flex items-center gap-2 md:hidden">
                    <span
                      className={`text-[13px] tabular-nums font-medium ${
                        isExpense ? "text-red-500" : "text-emerald-500"
                      }`}
                    >
                      {formatCurrency(r.amount)}
                    </span>
                    <Checkbox
                      checked={r.isActive}
                      onCheckedChange={() => handleToggle(r.id, r.isActive)}
                    />
                  </div>

                  {/* Frequency (desktop) */}
                  <span className="hidden md:inline-flex items-center justify-center w-20 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-muted capitalize">
                    {r.frequency}
                  </span>

                  {/* Amount (desktop) */}
                  <span
                    className={`hidden md:block w-24 text-right text-[13px] tabular-nums font-medium ${
                      isExpense ? "text-red-500" : "text-emerald-500"
                    }`}
                  >
                    {formatCurrency(r.amount)}
                  </span>

                  {/* Next date (desktop) */}
                  <span className="hidden md:block w-24 text-right text-[12px] text-muted-foreground tabular-nums">
                    {format(nextDate, "dd MMM yyyy")}
                  </span>

                  {/* Active toggle (desktop) */}
                  <div className="hidden md:flex w-14 justify-center">
                    <Checkbox
                      checked={r.isActive}
                      onCheckedChange={() => handleToggle(r.id, r.isActive)}
                    />
                  </div>

                  {/* Edit (desktop) */}
                  <div className="hidden md:flex w-8 justify-center">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => openEdit(r)}
                    >
                      <Pencil className="size-3" />
                    </Button>
                  </div>

                  {/* Delete (desktop) */}
                  <div className="hidden md:flex w-8 justify-center">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => openDelete(r)}
                    >
                      <Trash2 className="size-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-4 pb-3">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalItems}
              pageSize={pageSize}
            />
          </div>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-heading font-semibold">
              {editingId ? "Edit Recurring" : "Add Recurring"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Type toggle */}
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Type</Label>
              <div className="flex items-center gap-1 rounded-lg border border-input p-0.5 w-fit">
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
                placeholder="e.g. Netflix subscription"
                className="h-9 text-[13px]"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                  ₹
                </span>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  className="pl-7 h-9 text-[13px]"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                />
              </div>
            </div>

            {/* Frequency */}
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Frequency</Label>
              <div className="flex items-center gap-1.5">
                {frequencies.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormFrequency(f)}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-colors capitalize ${
                      formFrequency === f
                        ? "border-foreground/30 bg-foreground/5"
                        : "border-transparent bg-muted/50 hover:bg-muted"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Next date */}
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Next Date</Label>
              <Input
                type="date"
                className="h-9 text-[13px] w-fit"
                value={formNextDate}
                onChange={(e) => setFormNextDate(e.target.value)}
              />
            </div>

            {/* Payment mode — expense only */}
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

            {/* Active toggle */}
            <div className="flex items-center gap-2">
              <Checkbox
                checked={formIsActive}
                onCheckedChange={(checked) => setFormIsActive(checked as boolean)}
              />
              <Label className="text-[13px] cursor-pointer">Active</Label>
            </div>
          </div>

          <DialogFooter>
            {editingId && (
              <Button
                variant="destructive"
                onClick={() => {
                  const item = recurring.find((r) => r.id === editingId);
                  if (item) openDelete({ id: item.id, name: item.name });
                }}
              >
                <Trash2 className="size-3.5" />
                Delete
              </Button>
            )}
            <Button
              variant="orange"
              disabled={saving}
              onClick={handleSave}
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              {editingId ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-base font-heading font-semibold">Delete Recurring</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-muted-foreground">
            Are you sure you want to delete &quot;{deletingItem?.name}&quot;? This action
            cannot be undone.
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
