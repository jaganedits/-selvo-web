"use client";

import { Lock, Trash2 } from "lucide-react";

import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
} from "@/lib/constants/categories";
import type { CategoryType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/shared/category-icon";
import { EmptyState } from "@/components/shared/empty-state";

// ---------------------------------------------------------------------------
// Default-category lookup sets (built once at module level)
// ---------------------------------------------------------------------------

const DEFAULT_EXPENSE_NAMES = new Set(
  DEFAULT_EXPENSE_CATEGORIES.map((c) => c.name.toLowerCase().trim())
);
const DEFAULT_INCOME_NAMES = new Set(
  DEFAULT_INCOME_CATEGORIES.map((c) => c.name.toLowerCase().trim())
);

function isDefaultCategory(name: string, type: CategoryType): boolean {
  const norm = name.toLowerCase().trim();
  return type === "expense"
    ? DEFAULT_EXPENSE_NAMES.has(norm)
    : DEFAULT_INCOME_NAMES.has(norm);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CategoryItem {
  id: string;
  name: string;
  iconCode: number;
  colorValue: number;
}

interface CategoryGridProps {
  categories: CategoryItem[];
  type: CategoryType;
  onDelete: (cat: { id: string; name: string }) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CategoryGrid({ categories, type, onDelete }: CategoryGridProps) {
  if (categories.length === 0) {
    return <EmptyState message={`No ${type} categories`} />;
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 mt-3">
      {categories.map((cat) => {
        const isDefault = isDefaultCategory(cat.name, type);

        return (
          <div
            key={cat.id}
            className="rounded-xl border border-border/60 bg-card p-3 flex flex-col items-center gap-2 relative group transition-all duration-200 hover:shadow-(--shadow-card-hover) hover:scale-[1.02]"
          >
            {/* Default badge */}
            {isDefault && (
              <div className="absolute top-1.5 right-1.5">
                <Lock className="size-2.5 text-muted-foreground/50" />
              </div>
            )}

            {/* Delete button for custom categories */}
            {!isDefault && (
              <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onDelete(cat)}
                >
                  <Trash2 className="size-3 text-red-500" />
                </Button>
              </div>
            )}

            {/* Icon */}
            <CategoryIcon
              iconCode={cat.iconCode}
              colorValue={cat.colorValue}
              name={cat.name}
              size="md"
            />

            {/* Name */}
            <p className="text-[12px] font-medium text-center truncate w-full">
              {cat.name}
            </p>
          </div>
        );
      })}
    </div>
  );
}
