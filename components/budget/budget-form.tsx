"use client";

import { Loader2, Trash2 } from "lucide-react";
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
import { getCategoryIcon, argbToHex } from "@/lib/utils/icon-helpers";
import type { Budget } from "@/lib/types";
import type { Category } from "@/lib/types";

interface BudgetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingBudget: Budget | null;
  formCategory: string;
  onFormCategoryChange: (category: string) => void;
  formAmount: string;
  onFormAmountChange: (amount: string) => void;
  formName: string;
  onFormNameChange: (name: string) => void;
  availableCategories: Category[];
  catMap: Map<string, Category>;
  saving: boolean;
  onSave: () => void;
  onDelete: (budget: Pick<Budget, "id" | "category">) => void;
}

export function BudgetForm({
  open,
  onOpenChange,
  editingBudget,
  formCategory,
  onFormCategoryChange,
  formAmount,
  onFormAmountChange,
  formName,
  onFormNameChange,
  availableCategories,
  catMap,
  saving,
  onSave,
  onDelete,
}: BudgetFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-base font-heading font-semibold">
            {editingBudget ? "Edit Budget" : "Add Budget"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">Category</Label>
            {editingBudget ? (
              <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-muted/50 text-[13px]">
                {(() => {
                  const cat = catMap.get(editingBudget.category);
                  if (!cat) return <span>{editingBudget.category}</span>;
                  const EIcon = getCategoryIcon(cat.iconCode, cat.name);
                  const eColor = argbToHex(cat.colorValue);
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
                  const CatIcon = getCategoryIcon(c.iconCode, c.name);
                  const catColor = argbToHex(c.colorValue);
                  const selected = formCategory === c.name;
                  return (
                    <button
                      key={c.id}
                      onClick={() => onFormCategoryChange(c.name)}
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
                onChange={(e) => onFormAmountChange(e.target.value)}
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
              onChange={(e) => onFormNameChange(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          {editingBudget && (
            <Button
              variant="destructive"
              onClick={() =>
                onDelete({ id: editingBudget.id, category: editingBudget.category })
              }
            >
              <Trash2 className="size-3.5" />
              Delete
            </Button>
          )}
          <Button variant="orange" disabled={saving} onClick={onSave}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            {editingBudget ? "Update" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
