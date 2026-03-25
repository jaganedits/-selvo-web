import { memo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/shared/category-icon";
import { formatCurrency } from "@/lib/utils/format";
import type { Budget } from "@/lib/types";
import type { Category } from "@/lib/types";

interface BudgetCardProps {
  budget: Budget;
  category: Category | undefined;
  spent: number;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Pick<Budget, "id" | "category">) => void;
}

export const BudgetCard = memo(function BudgetCard({
  budget,
  category,
  spent,
  onEdit,
  onDelete,
}: BudgetCardProps) {
  const pct = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;
  const barColor =
    pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-orange" : "bg-emerald-500";

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 group relative transition-shadow duration-200 hover:shadow-(--shadow-card-hover)">
      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onEdit(budget)}
        >
          <Pencil className="size-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onDelete({ id: budget.id, category: budget.category })}
        >
          <Trash2 className="size-3 text-red-500" />
        </Button>
      </div>

      {/* Category info */}
      <div className="flex items-center gap-2.5 mb-3">
        {category ? (
          <CategoryIcon
            iconCode={category.iconCode}
            colorValue={category.colorValue}
            size="md"
          />
        ) : (
          <div className="size-8 rounded-lg bg-muted/50 shrink-0" />
        )}
        <div className="min-w-0">
          <p className="text-[13px] font-medium truncate">{budget.category}</p>
          {budget.name && (
            <p className="text-[11px] text-muted-foreground truncate">
              {budget.name}
            </p>
          )}
        </div>
      </div>

      {/* Amounts */}
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[13px] tabular-nums font-medium">
          {formatCurrency(spent)}
        </span>
        <span className="text-[11px] text-muted-foreground tabular-nums">
          / {formatCurrency(budget.amount)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>

      {/* Percentage */}
      <p
        className={`text-[11px] mt-1.5 tabular-nums ${
          pct >= 100
            ? "text-red-500 font-medium"
            : pct >= 80
              ? "text-orange font-medium"
              : "text-muted-foreground"
        }`}
      >
        {pct}% used
      </p>
    </div>
  );
});
