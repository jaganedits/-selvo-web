import { useMemo } from "react";
import { addMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatMonthYear } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";

interface MonthNavigationProps {
  monthOffset: number;
  onMonthChange: (offset: number) => void;
}

export function MonthNavigation({
  monthOffset,
  onMonthChange,
}: MonthNavigationProps) {
  const currentDate = useMemo(
    () => addMonths(new Date(), monthOffset),
    [monthOffset]
  );

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onMonthChange(monthOffset - 1)}
      >
        <ChevronLeft className="size-4" />
      </Button>
      <span className="text-[13px] font-medium w-32 text-center tabular-nums">
        {formatMonthYear(currentDate)}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onMonthChange(monthOffset + 1)}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
