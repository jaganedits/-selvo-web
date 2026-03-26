"use client";

import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getCategoryIcon, argbToHex } from "@/lib/utils/icon-helpers";
import type { Transaction, TransactionType, PaymentMode, Category } from "@/lib/types";

const PAYMENT_MODES: PaymentMode[] = ["Cash", "Card", "UPI"];

export interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTx: Transaction | null;

  // Form field values
  formType: TransactionType;
  formAmount: string;
  formCategory: string;
  formName: string;
  formDate: string;
  formPaymentMode: PaymentMode;
  formNote: string;

  // Setters
  onTypeChange: (type: TransactionType) => void;
  onAmountChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onPaymentModeChange: (value: PaymentMode) => void;
  onNoteChange: (value: string) => void;

  // Actions
  onSave: () => void;
  onDeleteRequest: () => void;
  saving: boolean;

  // Category data for chips
  activeCats: Category[];
}

export function TransactionForm({
  open,
  onOpenChange,
  editingTx,
  formType,
  formAmount,
  formCategory,
  formName,
  formDate,
  formPaymentMode,
  formNote,
  onTypeChange,
  onAmountChange,
  onCategoryChange,
  onNameChange,
  onDateChange,
  onPaymentModeChange,
  onNoteChange,
  onSave,
  onDeleteRequest,
  saving,
  activeCats,
}: TransactionFormProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col overflow-y-auto">
        {/* Colored header */}
        <div
          className={`px-4 pt-4 pb-3 ${
            formType === "expense"
              ? "bg-orange/10"
              : "bg-income/10"
          }`}
        >
          <SheetHeader className="p-0">
            <SheetTitle className="text-base font-heading font-semibold">
              {editingTx ? "Edit Transaction" : "Add Transaction"}
            </SheetTitle>
          </SheetHeader>

          {/* Type toggle */}
          <div className="flex items-center gap-1 mt-3 rounded-lg border border-input p-0.5 w-fit bg-background">
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  onTypeChange(t);
                  onCategoryChange("");
                }}
                className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                  formType === t
                    ? t === "expense"
                      ? "bg-orange text-white"
                      : "bg-income text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 px-4 py-3 space-y-4">
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
                onChange={(e) => onAmountChange(e.target.value)}
              />
            </div>
          </div>

          {/* Category chips */}
          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">Category</Label>
            <div className="flex flex-wrap gap-1.5">
              {activeCats.map((c) => {
                const CatIcon = getCategoryIcon(c.iconCode, c.name);
                const catColor = argbToHex(c.colorValue);
                const selected = formCategory === c.name;
                return (
                  <button
                    key={c.id}
                    onClick={() => onCategoryChange(c.name)}
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
              onChange={(e) => onNameChange(e.target.value)}
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">Date</Label>
            <Input
              type="date"
              className="h-9 text-[13px] w-fit"
              value={formDate}
              onChange={(e) => onDateChange(e.target.value)}
            />
          </div>

          {/* Payment Mode — expense only */}
          {formType === "expense" && (
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Payment Mode</Label>
              <div className="flex items-center gap-1.5">
                {PAYMENT_MODES.map((pm) => (
                  <button
                    key={pm}
                    onClick={() =>
                      onPaymentModeChange(formPaymentMode === pm ? "" : pm)
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
              onChange={(e) => onNoteChange(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-3 flex items-center gap-2">
          {editingTx && (
            <Button
              variant="destructive"
              size="default"
              onClick={onDeleteRequest}
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
            onClick={onSave}
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            {editingTx ? "Update" : "Save"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
