"use client";

import { useState, useMemo, useCallback } from "react";
import { Timestamp } from "firebase/firestore";
import { format } from "date-fns";
import { toast } from "sonner";
import { Plus, CircleDot } from "lucide-react";

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
import type { Frequency, TransactionType, PaymentMode } from "@/lib/types";
import type { Recurring } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Pagination, usePagination } from "@/components/shared/pagination";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";

import { RecurringRow } from "@/components/recurring/recurring-row";
import {
  RecurringForm,
  type RecurringFormValues,
} from "@/components/recurring/recurring-form";
import { usePageTitle } from "@/lib/hooks/use-page-title";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function dateToInputValue(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

const DEFAULT_FORM: RecurringFormValues = {
  type: "expense",
  category: "",
  name: "",
  amount: "",
  frequency: "monthly",
  nextDate: dateToInputValue(new Date()),
  paymentMode: "",
  note: "",
  isActive: true,
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function RecurringPage() {
  usePageTitle("Recurring");
  const { user } = useAuth();
  const { userFirestore } = useFirebase();
  const { recurring, loading } = useRecurring();
  const { categories, expenseCategories, incomeCategories } = useCategories();

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formValues, setFormValues] =
    useState<RecurringFormValues>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Category lookup map
  const catMap = useMemo(() => {
    const m = new Map<string, (typeof categories)[number]>();
    for (const c of categories) m.set(c.name, c);
    return m;
  }, [categories]);

  // Pagination
  const {
    paginatedItems: paginatedRecurring,
    currentPage,
    totalPages,
    setCurrentPage,
    totalItems,
    pageSize,
  } = usePagination(recurring, 15);

  // Active categories for the form
  const activeCats =
    formValues.type === "expense" ? expenseCategories : incomeCategories;

  // Form field change handler
  const handleChange = useCallback(
    <K extends keyof RecurringFormValues>(
      field: K,
      value: RecurringFormValues[K]
    ) => {
      setFormValues((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const resetForm = useCallback(() => {
    setEditingId(null);
    setFormValues({ ...DEFAULT_FORM, nextDate: dateToInputValue(new Date()) });
  }, []);

  const openAdd = useCallback(() => {
    resetForm();
    setDialogOpen(true);
  }, [resetForm]);

  const openEdit = useCallback((r: Recurring) => {
    setEditingId(r.id);
    setFormValues({
      type: r.type as TransactionType,
      category: r.category,
      name: r.name,
      amount: String(r.amount),
      frequency: r.frequency as Frequency,
      nextDate: dateToInputValue(
        r.nextDate instanceof Timestamp ? r.nextDate.toDate() : new Date()
      ),
      paymentMode: (r.paymentMode as PaymentMode) || "",
      note: r.note || "",
      isActive: r.isActive,
    });
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!user || !userFirestore) return;
    const amt = parseFloat(formValues.amount);
    if (!amt || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (!formValues.category) {
      toast.error("Select a category");
      return;
    }
    if (!formValues.name.trim()) {
      toast.error("Enter a name");
      return;
    }

    setSaving(true);
    try {
      const data = {
        type: formValues.type,
        amount: amt,
        category: formValues.category,
        name: formValues.name.trim(),
        frequency: formValues.frequency,
        nextDate: Timestamp.fromDate(new Date(formValues.nextDate)),
        paymentMode:
          formValues.type === "expense"
            ? formValues.paymentMode || undefined
            : undefined,
        note: formValues.note.trim() || undefined,
        isActive: formValues.isActive,
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
  }, [user, userFirestore, formValues, editingId]);

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

  // Delete triggered from inside the form (edit mode)
  const handleDeleteFromForm = useCallback(() => {
    const item = recurring.find((r) => r.id === editingId);
    if (item) openDelete({ id: item.id, name: item.name });
  }, [recurring, editingId, openDelete]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4 animate-stagger-in stagger-1">
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
        <EmptyState
          icon={CircleDot}
          message="No recurring transactions"
          submessage='Click "Add Recurring" to get started'
        />
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
            {paginatedRecurring.map((r) => (
              <RecurringRow
                key={r.id}
                item={r}
                category={catMap.get(r.category)}
                onToggle={handleToggle}
                onEdit={openEdit}
                onDelete={openDelete}
              />
            ))}
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
      <RecurringForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        isEditing={!!editingId}
        values={formValues}
        onChange={handleChange}
        activeCats={activeCats}
        saving={saving}
        onSave={handleSave}
        onDelete={handleDeleteFromForm}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Recurring"
        message={`Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={deleting}
        destructive
      />
    </div>
  );
}
