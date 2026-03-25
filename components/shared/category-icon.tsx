import { getCategoryIcon, argbToHex } from "@/lib/utils/icon-helpers";
import { cn } from "@/lib/utils";

interface CategoryIconProps {
  iconCode: number;
  colorValue: number;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
} as const;

const iconSizeClasses = {
  sm: "size-3",
  md: "size-4",
  lg: "size-5",
} as const;

export function CategoryIcon({
  iconCode,
  colorValue,
  size = "md",
}: CategoryIconProps) {
  const Icon = getCategoryIcon(iconCode);
  const color = argbToHex(colorValue);

  return (
    <div
      className={cn(
        "rounded-lg flex items-center justify-center shrink-0",
        sizeClasses[size]
      )}
      style={{ backgroundColor: `${color}18` }}
    >
      <Icon className={iconSizeClasses[size]} style={{ color }} />
    </div>
  );
}
