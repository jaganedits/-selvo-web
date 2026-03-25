import { CircleDot } from "lucide-react";
import type React from "react";

interface EmptyStateProps {
  icon?: React.ElementType;
  message: string;
  submessage?: string;
}

export function EmptyState({
  icon: Icon = CircleDot,
  message,
  submessage,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground rounded-xl border border-dashed border-border/60 bg-muted/20">
      <div className="flex items-center justify-center size-14 rounded-full bg-muted/40 mb-4">
        <Icon className="size-6 opacity-40" />
      </div>
      <p className="text-[13px]">{message}</p>
      {submessage && (
        <p className="text-[11px] mt-1">{submessage}</p>
      )}
    </div>
  );
}
