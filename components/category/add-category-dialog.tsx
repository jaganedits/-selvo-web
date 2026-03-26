"use client";

import { Loader2 } from "lucide-react";

import type { CategoryType } from "@/lib/types";
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
import { getCategoryIcon } from "@/lib/utils/icon-helpers";
import { MATERIAL_TO_LUCIDE } from "@/lib/constants/icon-map";
import { cn } from "@/lib/utils";

// Build icon options from the map (code + component)
const ICON_OPTIONS = Object.keys(MATERIAL_TO_LUCIDE).map((key) => {
  const code = Number(key);
  return { code, component: getCategoryIcon(code) };
});

// Available color options
const COLOR_OPTIONS = [
  { hex: "#E74C3C", argb: 0xFFE74C3C },
  { hex: "#FF7043", argb: 0xFFFF7043 },
  { hex: "#F39C12", argb: 0xFFF39C12 },
  { hex: "#2ECC71", argb: 0xFF2ECC71 },
  { hex: "#3498DB", argb: 0xFF3498DB },
  { hex: "#9B59B6", argb: 0xFF9B59B6 },
  { hex: "#E91E63", argb: 0xFFE91E63 },
  { hex: "#26A69A", argb: 0xFF26A69A },
  { hex: "#00BCD4", argb: 0xFF00BCD4 },
  { hex: "#8D6E63", argb: 0xFF8D6E63 },
  { hex: "#95A5A6", argb: 0xFF95A5A6 },
  { hex: "#607D8B", argb: 0xFF607D8B },
];

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeType: CategoryType;
  name: string;
  onNameChange: (name: string) => void;
  iconCode: number;
  onIconCodeChange: (code: number) => void;
  colorValue: number;
  onColorValueChange: (value: number) => void;
  onSubmit: () => void;
  saving: boolean;
}

export function AddCategoryDialog({
  open,
  onOpenChange,
  activeType,
  name,
  onNameChange,
  iconCode,
  onIconCodeChange,
  colorValue,
  onColorValueChange,
  onSubmit,
  saving,
}: AddCategoryDialogProps) {
  const selectedColor = COLOR_OPTIONS.find((c) => c.argb === colorValue)?.hex || "#95A5A6";
  const SelectedIcon = getCategoryIcon(iconCode);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-heading font-semibold">
            Add {activeType === "expense" ? "Expense" : "Income"} Category
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview + Name */}
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${selectedColor}18` }}
            >
              <SelectedIcon className="size-5" style={{ color: selectedColor }} />
            </div>
            <div className="flex-1 space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Name</Label>
              <Input
                placeholder="e.g. Subscriptions"
                className="h-9 text-[13px]"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSubmit();
                }}
              />
            </div>
          </div>

          {/* Color Picker */}
          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.argb}
                  type="button"
                  onClick={() => onColorValueChange(c.argb)}
                  className={cn(
                    "h-7 w-7 rounded-full transition-all",
                    colorValue === c.argb
                      ? "ring-2 ring-offset-2 ring-offset-background scale-110"
                      : "hover:scale-110"
                  )}
                  style={{
                    backgroundColor: c.hex,
                    ...(colorValue === c.argb ? { "--tw-ring-color": c.hex } as React.CSSProperties : {}),
                  }}
                />
              ))}
            </div>
          </div>

          {/* Icon Picker */}
          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">Icon</Label>
            <div className="grid grid-cols-8 gap-1.5 max-h-36 overflow-y-auto rounded-lg border border-border/60 p-2">
              {ICON_OPTIONS.map((icon) => {
                const IconComp = icon.component;
                const selected = iconCode === icon.code;
                return (
                  <button
                    key={icon.code}
                    type="button"
                    onClick={() => onIconCodeChange(icon.code)}
                    className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
                      selected
                        ? "bg-foreground/10 ring-1 ring-foreground/20"
                        : "hover:bg-muted"
                    )}
                  >
                    <IconComp
                      className="size-4"
                      style={{ color: selected ? selectedColor : undefined }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="orange" disabled={saving} onClick={onSubmit}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
