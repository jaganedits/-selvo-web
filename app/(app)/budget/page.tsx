"use client";

import { useState, useMemo, useCallback } from "react";
import { Timestamp } from "firebase/firestore";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { useFirebase } from "@/providers/firebase-provider";
import { useTransactions } from "@/lib/hooks/use-transactions";
import { useCategories } from "@/lib/hooks/use-categories";
import { useBudgets } from "@/lib/hooks/use-budgets";
import { setBudget, deleteBudget } from "@/lib/services/firestore";
import { formatMonthYear, getMonthKey } from "@/lib/utils/format";
import type { Budget } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { MonthNavigation } from "@/components/shared/month-navigation";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { BudgetCard } from "@/components/budget/budget-card";
import { BudgetForm } from "@/components/budget/budget-form";

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
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formCategory, setFormCategory] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formName, setFormName] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingBudget, setDeletingBudget] = useState<Pick<Budget, "id" | "category"> | null>(null);
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

  // Category lookup map
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

  // Available categories for the add form (exclude already-budgeted)
  const availableCategories = useMemo(() => {
    if (editingBudget) return expenseCategories;
    return expenseCategories.filter((c) => !budgetedCategoryNames.has(c.name));
  }, [expenseCategories, budgetedCategoryNames, editingBudget]);

  // Form helpers
  const openAdd = useCallback(() => {
    setEditingBudget(null);
    setFormCategory("");
    setFormAmount("");
    setFormName("");
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((b: Budget) => {
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

  const openDelete = useCallback((b: Pick<Budget, "id" | "category">) => {
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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4 animate-stagger-in stagger-1">
      <PageHeader title="Budget">
        <MonthNavigation
          monthOffset={monthOffset}
          onMonthChange={setMonthOffset}
        />
        <Button variant="orange" size="default" onClick={openAdd}>
          <Plus className="size-4" />
          Add Budget
        </Button>
      </PageHeader>

      {budgets.length === 0 ? (
        <EmptyState
          message={`No budgets set for ${formatMonthYear(currentDate)}`}
          submessage='Click "Add Budget" to get started'
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {budgets.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              category={catMap.get(b.category)}
              spent={spentByCategory.get(b.category) || 0}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          ))}
        </div>
      )}

      <BudgetForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingBudget={editingBudget}
        formCategory={formCategory}
        onFormCategoryChange={setFormCategory}
        formAmount={formAmount}
        onFormAmountChange={setFormAmount}
        formName={formName}
        onFormNameChange={setFormName}
        availableCategories={availableCategories}
        catMap={catMap}
        saving={saving}
        onSave={handleSave}
        onDelete={openDelete}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Budget"
        message={`Are you sure you want to delete the budget for "${deletingBudget?.category}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={deleting}
        destructive
      />
    </div>
  );
}
