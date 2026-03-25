"use client";

import { User, Unplug } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SplitwiseHeaderProps {
  firstName: string;
  lastName: string;
  onDisconnectClick: () => void;
}

export function SplitwiseHeader({
  firstName,
  lastName,
  onDisconnectClick,
}: SplitwiseHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-heading font-semibold">Splitwise</h1>
        <Separator orientation="vertical" className="h-5" />
        <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <User className="size-3.5" />
          <span>
            {firstName} {lastName}
          </span>
        </div>
      </div>
      <Button
        variant="destructive"
        size="sm"
        onClick={onDisconnectClick}
      >
        <Unplug className="size-3.5" />
        Disconnect
      </Button>
    </div>
  );
}
