"use client";

import { Loader2, Trash2 } from "lucide-react";

import { getCategoryIcon, argbToHex } from "@/lib/utils/icon-helpers";
import type { Frequency, TransactionType, PaymentMode } from "@/lib/types";
import type { Category } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const FREQUENCIES: Frequency[] = ["daily", "weekly", "monthly"];
const PAYMENT_MODES: PaymentMode[] = ["Cash", "Card", "UPI"];

export interface RecurringFormValues {
  type: TransactionType;
  category: string;
  name: string;
  amount: string;
  frequency: Frequency;
  nextDate: string;
  paymentMode: PaymentMode;
  note: string;
  isActive: boolean;
}

interface RecurringFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  values: RecurringFormValues;
  onChange: <K extends keyof RecurringFormValues>(
    field: K,
    value: RecurringFormValues[K]
  ) => void;
  activeCats: Category[];
  saving: boolean;
  onSave: () => void;
  onDelete: () => void;
}

export function RecurringForm({
  open,
  onOpenChange,
  isEditing,
  values,
  onChange,
  activeCats,
  saving,
  onSave,
  onDelete,
}: RecurringFormProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col overflow-y-auto">
        {/* Colored header */}
        <div
          className={`px-4 pt-4 pb-3 ${
            values.type === "expense"
              ? "bg-orange/10"
              : "bg-income/10"
          }`}
        >
          <SheetHeader className="p-0">
            <SheetTitle className="text-base font-heading font-semibold">
              {isEditing ? "Edit Recurring" : "Add Recurring"}
            </SheetTitle>
          </SheetHeader>

          {/* Type toggle */}
          <div className="flex items-center gap-1 mt-3 rounded-lg border border-input p-0.5 w-fit bg-background">
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  onChange("type", t);
                  onChange("category", "");
                }}
                className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                  values.type === t
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
          {/* Category chips */}
          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">
              Category
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {activeCats.map((c) => {
                const CatIcon = getCategoryIcon(c.iconCode, c.name);
                const catColor = argbToHex(c.colorValue);
                const selected = values.category === c.name;
                return (
                  <button
                    key={c.id}
                    onClick={() => onChange("category", c.name)}
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
              value={values.name}
              onChange={(e) => onChange("name", e.target.value)}
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
                value={values.amount}
                onChange={(e) => onChange("amount", e.target.value)}
              />
            </div>
          </div>

          {/* Frequency */}
          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">
              Frequency
            </Label>
            <div className="flex items-center gap-1.5">
              {FREQUENCIES.map((f) => (
                <button
                  key={f}
                  onClick={() => onChange("frequency", f)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-colors capitalize ${
                    values.frequency === f
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
            <Label className="text-[12px] text-muted-foreground">
              Next Date
            </Label>
            <Input
              type="date"
              className="h-9 text-[13px] w-fit"
              value={values.nextDate}
              onChange={(e) => onChange("nextDate", e.target.value)}
            />
          </div>

          {/* Payment mode — expense only */}
          {values.type === "expense" && (
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">
                Payment Mode
              </Label>
              <div className="flex items-center gap-1.5">
                {PAYMENT_MODES.map((pm) => (
                  <button
                    key={pm}
                    onClick={() =>
                      onChange("paymentMode", values.paymentMode === pm ? "" : pm)
                    }
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-colors ${
                      values.paymentMode === pm
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
              value={values.note}
              onChange={(e) => onChange("note", e.target.value)}
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-2">
            <Checkbox
              checked={values.isActive}
              onCheckedChange={(checked) =>
                onChange("isActive", checked as boolean)
              }
            />
            <Label className="text-[13px] cursor-pointer">Active</Label>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-3 flex items-center gap-2 justify-end">
          {isEditing && (
            <Button variant="destructive" onClick={onDelete}>
              <Trash2 className="size-3.5" />
              Delete
            </Button>
          )}
          <Button variant="orange" disabled={saving} onClick={onSave}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            {isEditing ? "Update" : "Save"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
