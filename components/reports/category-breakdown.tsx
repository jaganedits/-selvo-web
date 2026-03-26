"use client";

import { getCategoryIcon } from "@/lib/utils/icon-helpers";
import { formatCurrency } from "@/lib/utils/format";

export interface CategoryBreakdownItem {
  name: string;
  amount: number;
  percentage: number;
  color: string;
  iconCode: number;
}

interface CategoryBreakdownProps {
  items: CategoryBreakdownItem[];
  type: "expense" | "income";
}

export function CategoryBreakdown({ items, type }: CategoryBreakdownProps) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
        No {type} categories this month
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const Icon = getCategoryIcon(item.iconCode, item.name);
        return (
          <div key={item.name} className="flex items-center gap-2.5 text-sm">
            <div
              className="size-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${item.color}18` }}
            >
              <Icon className="size-3.5" style={{ color: item.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className="truncate text-[13px] font-medium">
                  {item.name}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[12px] text-muted-foreground tabular-nums">
                    {item.percentage}%
                  </span>
                  <span className="text-[13px] font-semibold tabular-nums w-24 text-right">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              </div>
              <div className="h-1 rounded-full bg-border/40 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
