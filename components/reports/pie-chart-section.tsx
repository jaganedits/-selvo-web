"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { ValueType } from "recharts/types/component/DefaultTooltipContent";
import { getCategoryIcon } from "@/lib/utils/icon-helpers";
import { formatCurrency } from "@/lib/utils/format";

export interface PieChartEntry {
  name: string;
  value: number;
  color: string;
  iconCode?: number;
  percentage?: number;
}

interface PieChartSectionProps {
  data: PieChartEntry[];
  title?: string;
  emptyMessage?: string;
}

export function PieChartSection({
  data,
  title,
  emptyMessage = "No data this month",
}: PieChartSectionProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      {title && (
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          {title}
        </h2>
      )}
      {data.length > 0 ? (
        <div className="flex flex-col items-center gap-5">
          <div className="w-48 h-48 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={88}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value?: ValueType) =>
                    formatCurrency(Number(value ?? 0))
                  }
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="w-full space-y-1.5">
            {data.map((entry) => {
              const Icon = getCategoryIcon(entry.iconCode ?? 0);
              return (
                <div
                  key={entry.name}
                  className="flex items-center gap-2 text-sm"
                >
                  <div
                    className="size-6 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${entry.color}18` }}
                  >
                    <Icon
                      className="size-3"
                      style={{ color: entry.color }}
                    />
                  </div>
                  <span className="truncate text-[12px] font-medium flex-1 min-w-0">
                    {entry.name}
                  </span>
                  {entry.percentage !== undefined && (
                    <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
                      {entry.percentage}%
                    </span>
                  )}
                  <span className="text-[12px] font-semibold tabular-nums shrink-0 text-right">
                    {formatCurrency(entry.value)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-48 text-xs text-muted-foreground">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}
