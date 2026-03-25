"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  pageSize: number;
}

export function Pagination({ currentPage, totalPages, onPageChange, totalItems, pageSize }: PaginationProps) {
  if (totalPages <= 1) return null;

  const start = currentPage * pageSize + 1;
  const end = Math.min((currentPage + 1) * pageSize, totalItems);

  // Build page numbers to show
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 0; i < totalPages; i++) pages.push(i);
  } else {
    pages.push(0);
    if (currentPage > 2) pages.push("...");
    for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages - 2, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 3) pages.push("...");
    pages.push(totalPages - 1);
  }

  return (
    <div className="flex items-center justify-between pt-3 border-t border-border/40">
      <p className="text-[11px] text-muted-foreground tabular-nums">
        {start}–{end} of {totalItems}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="text-[11px] text-muted-foreground px-1">...</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                "h-7 min-w-[28px] rounded-md text-[11px] font-medium tabular-nums",
                p === currentPage
                  ? "bg-orange text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {p + 1}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/** Hook for pagination logic */
export function usePagination<T>(items: T[], pageSize: number = 20) {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(items.length / pageSize);

  // Reset page when items shrink below current page
  useEffect(() => {
    if (totalPages > 0 && currentPage >= totalPages) {
      setCurrentPage(totalPages - 1);
    }
  }, [totalPages, currentPage]);

  const safeCurrentPage = currentPage >= totalPages ? Math.max(0, totalPages - 1) : currentPage;
  const paginatedItems = useMemo(
    () => items.slice(safeCurrentPage * pageSize, (safeCurrentPage + 1) * pageSize),
    [items, safeCurrentPage, pageSize]
  );

  return {
    paginatedItems,
    currentPage: safeCurrentPage,
    totalPages,
    setCurrentPage,
    totalItems: items.length,
    pageSize,
  };
}
