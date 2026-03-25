"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { useFirebase } from "@/providers/firebase-provider";
import { useCategories } from "@/lib/hooks/use-categories";
import { addCategory, deleteCategory } from "@/lib/services/firestore";
import type { CategoryType } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { CategoryGrid } from "@/components/category/category-grid";
import { AddCategoryDialog } from "@/components/category/add-category-dialog";

export default function CategoriesPage() {
  const { user } = useAuth();
  const { userFirestore } = useFirebase();
  const { expenseCategories, incomeCategories, loading } = useCategories();

  // Active tab: 0 = expense, 1 = income
  const [activeTab, setActiveTab] = useState<number>(0);
  const activeType: CategoryType = activeTab === 0 ? "expense" : "income";

  // Add dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openAdd = useCallback(() => {
    setFormName("");
    setAddDialogOpen(true);
  }, []);

  const handleAdd = useCallback(async () => {
    if (!user || !userFirestore) return;
    const trimmed = formName.trim();
    if (!trimmed) {
      toast.error("Enter a category name");
      return;
    }

    setSaving(true);
    try {
      await addCategory(userFirestore, user.uid, {
        name: trimmed,
        type: activeType,
        iconCode: 0xe5d3, // more-horizontal
        colorValue: 0xff95a5a6, // gray
      });
      toast.success("Category added");
      setAddDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add category");
    } finally {
      setSaving(false);
    }
  }, [user, userFirestore, formName, activeType]);

  const openDelete = useCallback((cat: { id: string; name: string }) => {
    setDeletingCategory(cat);
    setDeleteDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!user || !userFirestore || !deletingCategory) return;
    setDeleting(true);
    try {
      await deleteCategory(userFirestore, user.uid, deletingCategory.id);
      toast.success("Category deleted");
      setDeleteDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  }, [user, userFirestore, deletingCategory]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4 animate-stagger-in stagger-1">
      <PageHeader title="Categories">
        <Button variant="orange" size="default" onClick={openAdd}>
          <Plus className="size-4" />
          Add Category
        </Button>
      </PageHeader>

      <Tabs
        defaultValue={0}
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as number)}
      >
        <TabsList className="w-fit">
          <TabsTrigger value={0}>Expense</TabsTrigger>
          <TabsTrigger value={1}>Income</TabsTrigger>
        </TabsList>

        <TabsContent value={0}>
          <CategoryGrid
            categories={expenseCategories}
            type="expense"
            onDelete={openDelete}
          />
        </TabsContent>

        <TabsContent value={1}>
          <CategoryGrid
            categories={incomeCategories}
            type="income"
            onDelete={openDelete}
          />
        </TabsContent>
      </Tabs>

      <AddCategoryDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        activeType={activeType}
        name={formName}
        onNameChange={setFormName}
        onSubmit={handleAdd}
        saving={saving}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Category"
        message={`Are you sure you want to delete "${deletingCategory?.name}"? Existing transactions using this category will not be affected.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={deleting}
        destructive
      />
    </div>
  );
}
