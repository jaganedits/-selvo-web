"use client";

import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import * as LucideIcons from "lucide-react";
import {
  Plus,
  Loader2,
  Trash2,
  CircleDot,
  Lock,
} from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { useFirebase } from "@/providers/firebase-provider";
import { useCategories } from "@/lib/hooks/use-categories";
import { addCategory, deleteCategory } from "@/lib/services/firestore";
import { MATERIAL_TO_LUCIDE } from "@/lib/constants/icon-map";
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
} from "@/lib/constants/categories";
import type { CategoryType } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

const DEFAULT_EXPENSE_NAMES = new Set(
  DEFAULT_EXPENSE_CATEGORIES.map((c) => c.name.toLowerCase().trim())
);
const DEFAULT_INCOME_NAMES = new Set(
  DEFAULT_INCOME_CATEGORIES.map((c) => c.name.toLowerCase().trim())
);

function isDefaultCategory(name: string, type: CategoryType): boolean {
  const norm = name.toLowerCase().trim();
  return type === "expense"
    ? DEFAULT_EXPENSE_NAMES.has(norm)
    : DEFAULT_INCOME_NAMES.has(norm);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

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

  const activeCats = activeTab === 0 ? expenseCategories : incomeCategories;

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
        <h1 className="text-lg font-heading font-semibold">Categories</h1>
        <Button variant="orange" size="default" onClick={openAdd}>
          <Plus className="size-4" />
          Add Category
        </Button>
      </div>

      {/* Tabs */}
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

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base font-heading font-semibold">
              Add {activeType === "expense" ? "Expense" : "Income"} Category
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Name</Label>
              <Input
                placeholder="e.g. Subscriptions"
                className="h-9 text-[13px]"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd();
                }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              A default icon and color will be assigned. You can change them from the mobile app.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="orange" disabled={saving} onClick={handleAdd}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-base font-heading font-semibold">Delete Category</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-muted-foreground">
            Are you sure you want to delete &quot;{deletingCategory?.name}&quot;? Existing
            transactions using this category will not be affected.
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

// ---------------------------------------------------------------------------
// Category Grid sub-component
// ---------------------------------------------------------------------------

function CategoryGrid({
  categories,
  type,
  onDelete,
}: {
  categories: { id: string; name: string; iconCode: number; colorValue: number }[];
  type: CategoryType;
  onDelete: (cat: { id: string; name: string }) => void;
}) {
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <CircleDot className="size-8 mb-3 opacity-30" />
        <p className="text-[13px]">No {type} categories</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 mt-3">
      {categories.map((cat) => {
        const Icon = getCategoryIcon(cat.iconCode);
        const color = argbToHex(cat.colorValue);
        const isDefault = isDefaultCategory(cat.name, type);

        return (
          <div
            key={cat.id}
            className="rounded-xl border border-border/60 bg-card p-3 flex flex-col items-center gap-2 relative group"
          >
            {/* Default badge */}
            {isDefault && (
              <div className="absolute top-1.5 right-1.5">
                <Lock className="size-2.5 text-muted-foreground/50" />
              </div>
            )}

            {/* Delete button for custom categories */}
            {!isDefault && (
              <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onDelete(cat)}
                >
                  <Trash2 className="size-3 text-red-500" />
                </Button>
              </div>
            )}

            {/* Icon */}
            <div
              className="size-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon className="size-4" style={{ color }} />
            </div>

            {/* Name */}
            <p className="text-[12px] font-medium text-center truncate w-full">
              {cat.name}
            </p>
          </div>
        );
      })}
    </div>
  );
}
