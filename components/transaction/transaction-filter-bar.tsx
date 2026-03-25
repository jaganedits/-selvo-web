"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export type TypeFilter = "all" | "income" | "expense";

export interface TransactionFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  typeFilter: TypeFilter;
  onTypeFilterChange: (value: TypeFilter) => void;
  dateRange: string;
}

export function TransactionFilterBar({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  dateRange,
}: TransactionFilterBarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-56">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <Input
          placeholder="Search transactions..."
          className="pl-7 h-8 text-[13px]"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-0.5 rounded-lg border border-input p-0.5">
        {(["all", "income", "expense"] as const).map((f) => (
          <button
            key={f}
            onClick={() => onTypeFilterChange(f)}
            className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors ${
              typeFilter === f
                ? f === "income"
                  ? "bg-income text-white"
                  : f === "expense"
                    ? "bg-orange text-white"
                    : "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      {dateRange && (
        <span className="text-[11px] text-muted-foreground ml-auto">
          {dateRange}
        </span>
      )}
    </div>
  );
}
