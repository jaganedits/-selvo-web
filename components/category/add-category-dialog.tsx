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

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeType: CategoryType;
  name: string;
  onNameChange: (name: string) => void;
  onSubmit: () => void;
  saving: boolean;
}

export function AddCategoryDialog({
  open,
  onOpenChange,
  activeType,
  name,
  onNameChange,
  onSubmit,
  saving,
}: AddCategoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSubmit();
              }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            A default icon and color will be assigned. You can change them from the mobile app.
          </p>
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
