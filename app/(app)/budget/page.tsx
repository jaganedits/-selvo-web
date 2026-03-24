"use client";

import { useState, useMemo, useCallback } from "react";
import { Timestamp } from "firebase/firestore";
import { toast } from "sonner";
import * as LucideIcons from "lucide-react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Trash2,
  CircleDot,
} from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { useFirebase } from "@/providers/firebase-provider";
import { useTransactions } from "@/lib/hooks/use-transactions";
import { useCategories } from "@/lib/hooks/use-categories";
import { useBudgets } from "@/lib/hooks/use-budgets";
import { setBudget, deleteBudget } from "@/lib/services/firestore";
import { formatCurrency, getMonthKey, formatMonthYear } from "@/lib/utils/format";
import { MATERIAL_TO_LUCIDE } from "@/lib/constants/icon-map";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BudgetPage() {
  const { user } = useAuth();
  const { userFirestore } = useFirebase();
  const { transactions } = useTransactions();
  const { categories, expenseCategories } = useCategories();

  // Month navigation
  const [monthOffset, setMonthOffset] = useState(0);
  const currentDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);
  const monthKey = getMonthKey(currentDate);

  const { budgets, loading } = useBudgets(monthKey);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<{ id: string; category: string; amount: number; name?: string } | null>(null);
  const [formCategory, setFormCategory] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formName, setFormName] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingBudget, setDeletingBudget] = useState<{ id: string; category: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Calculate spent per category for current month
  const spentByCategory = useMemo(() => {
    const map = new Map<string, number>();
    const cm = currentDate.getMonth();
    const cy = currentDate.getFullYear();
    transactions.forEach((t) => {
      if (t.type !== "expense") return;
      const d = t.date instanceof Timestamp ? t.date.toDate() : new Date(t.date as unknown as string);
      if (d.getMonth() === cm && d.getFullYear() === cy) {
        map.set(t.category, (map.get(t.category) || 0) + t.amount);
      }
    });
    return map;
  }, [transactions, currentDate]);

  // Category lookup
  const catMap = useMemo(() => {
    const m = new Map<string, (typeof categories)[number]>();
    for (const c of categories) m.set(c.name, c);
    return m;
  }, [categories]);

  // Already-budgeted categories (for filtering the add dialog)
  const budgetedCategoryNames = useMemo(
    () => new Set(budgets.map((b) => b.category)),
    [budgets]
  );

  // Form helpers
  const openAdd = useCallback(() => {
    setEditingBudget(null);
    setFormCategory("");
    setFormAmount("");
    setFormName("");
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((b: { id: string; category: string; amount: number; name?: string }) => {
    setEditingBudget(b);
    setFormCategory(b.category);
    setFormAmount(String(b.amount));
    setFormName(b.name || "");
    setDialogOpen(true);
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

    setSaving(true);
    try {
      await setBudget(
        userFirestore,
        user.uid,
        formCategory,
        amt,
        monthKey,
        formName.trim() || undefined
      );
      toast.success(editingBudget ? "Budget updated" : "Budget added");
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }, [user, userFirestore, formAmount, formCategory, formName, monthKey, editingBudget]);

  const openDelete = useCallback((b: { id: string; category: string }) => {
    setDeletingBudget(b);
    setDeleteDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!user || !userFirestore || !deletingBudget) return;
    setDeleting(true);
    try {
      await deleteBudget(userFirestore, user.uid, deletingBudget.id, monthKey);
      toast.success("Budget deleted");
      setDeleteDialogOpen(false);
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  }, [user, userFirestore, deletingBudget, monthKey]);

  // Available categories for the add form (exclude already-budgeted)
  const availableCategories = useMemo(() => {
    if (editingBudget) return expenseCategories;
    return expenseCategories.filter((c) => !budgetedCategoryNames.has(c.name));
  }, [expenseCategories, budgetedCategoryNames, editingBudget]);

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
        <h1 className="text-xl font-semibold tracking-tight">Budget</h1>
        <div className="flex items-center gap-3">
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
          <Button variant="orange" size="default" onClick={openAdd}>
            <Plus className="size-4" />
            Add Budget
          </Button>
        </div>
      </div>

      {/* Budget grid */}
      {budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <CircleDot className="size-10 mb-3 opacity-30" />
          <p className="text-sm">No budgets set for {formatMonthYear(currentDate)}</p>
          <p className="text-[11px] mt-1">Click &quot;Add Budget&quot; to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {budgets.map((b) => {
            const cat = catMap.get(b.category);
            const Icon = cat ? getCategoryIcon(cat.iconCode) : CircleDot;
            const color = cat ? argbToHex(cat.colorValue) : "#95A5A6";
            const spent = spentByCategory.get(b.category) || 0;
            const pct = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
            const barColor =
              pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-orange" : "bg-emerald-500";

            return (
              <div
                key={b.id}
                className="rounded-xl border border-border bg-card p-4 group relative"
              >
                {/* Action buttons */}
                <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => openEdit(b)}
                  >
                    <Pencil className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => openDelete(b)}
                  >
                    <Trash2 className="size-3 text-red-500" />
                  </Button>
                </div>

                {/* Category info */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className="size-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${color}18` }}
                  >
                    <Icon className="size-4" style={{ color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium truncate">{b.category}</p>
                    {b.name && (
                      <p className="text-[11px] text-muted-foreground truncate">{b.name}</p>
                    )}
                  </div>
                </div>

                {/* Amounts */}
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[13px] font-semibold tabular-nums">
                    {formatCurrency(spent)}
                  </span>
                  <span className="text-[11px] text-muted-foreground tabular-nums">
                    / {formatCurrency(b.amount)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${barColor}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>

                {/* Percentage */}
                <p
                  className={`text-[11px] mt-1.5 tabular-nums ${
                    pct >= 100
                      ? "text-red-500 font-medium"
                      : pct >= 80
                        ? "text-orange font-medium"
                        : "text-muted-foreground"
                  }`}
                >
                  {pct}% used
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBudget ? "Edit Budget" : "Add Budget"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Category */}
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Category</Label>
              {editingBudget ? (
                <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-muted/50 text-[13px]">
                  {(() => {
                    const cat = catMap.get(editingBudget.category);
                    const EIcon = cat ? getCategoryIcon(cat.iconCode) : CircleDot;
                    const eColor = cat ? argbToHex(cat.colorValue) : "#95A5A6";
                    return (
                      <>
                        <EIcon className="size-3.5" style={{ color: eColor }} />
                        <span>{editingBudget.category}</span>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {availableCategories.map((c) => {
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
                  {availableCategories.length === 0 && (
                    <p className="text-[11px] text-muted-foreground py-2">
                      All expense categories already have a budget
                    </p>
                  )}
                </div>
              )}
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

            {/* Name (optional) */}
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">
                Label <span className="text-muted-foreground/60">(optional)</span>
              </Label>
              <Input
                placeholder="e.g. Groceries limit"
                className="h-9 text-[13px]"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            {editingBudget && (
              <Button
                variant="destructive"
                onClick={() => openDelete(editingBudget)}
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
              {editingBudget ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete Budget</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-muted-foreground">
            Are you sure you want to delete the budget for &quot;{deletingBudget?.category}&quot;?
            This action cannot be undone.
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
