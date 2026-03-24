"use client";

import { Receipt } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SplitwisePage() {
  return (
    <div className="space-y-4 max-w-2xl">
      {/* Header */}
      <h1 className="text-xl font-semibold tracking-tight">Splitwise</h1>

      {/* Coming soon card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col items-center text-center py-8">
          <div className="size-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
            <Receipt className="size-7 text-muted-foreground/60" />
          </div>
          <h2 className="text-base font-semibold mb-1">
            Splitwise integration coming soon
          </h2>
          <p className="text-[13px] text-muted-foreground max-w-sm">
            Connect your Splitwise account to import shared expenses and keep
            track of balances with friends.
          </p>
        </div>

        <div className="space-y-1.5 mt-4">
          <Label className="text-[12px] text-muted-foreground">
            API Key
          </Label>
          <Input
            placeholder="Enter your Splitwise API key"
            className="h-9 text-[13px]"
            disabled
          />
          <p className="text-[11px] text-muted-foreground">
            This feature is not yet available. Stay tuned for updates.
          </p>
        </div>
      </div>
    </div>
  );
}
