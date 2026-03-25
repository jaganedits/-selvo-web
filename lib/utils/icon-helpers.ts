import { MATERIAL_TO_LUCIDE } from "@/lib/constants/icon-map";
import * as LucideIcons from "lucide-react";
import type React from "react";

type IconComponent = React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

const iconCache = new Map<number, IconComponent>();

/**
 * Maps a Material icon code to the corresponding Lucide React component.
 * Falls back to CircleDot when the code has no mapping. Results are cached.
 */
export function getCategoryIcon(iconCode: number): IconComponent {
  const cached = iconCache.get(iconCode);
  if (cached) return cached;

  const name = MATERIAL_TO_LUCIDE[iconCode];
  if (!name) {
    iconCache.set(iconCode, LucideIcons.CircleDot);
    return LucideIcons.CircleDot;
  }
  const pascal = name
    .split("-")
    .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
  const icon =
    (
      LucideIcons as unknown as Record<string, IconComponent>
    )[pascal] || LucideIcons.CircleDot;
  iconCache.set(iconCode, icon);
  return icon;
}

/**
 * Converts an ARGB int32 value (as stored in Firestore category colorValue)
 * to a CSS hex color string, e.g. 0xFF2ECC71 → "#2ecc71".
 */
export function argbToHex(argb: number): string {
  return `#${(argb & 0x00ffffff).toString(16).padStart(6, "0")}`;
}
