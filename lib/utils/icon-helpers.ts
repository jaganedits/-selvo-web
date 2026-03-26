import type React from "react";
import {
  Utensils,
  ShoppingCart,
  Bus,
  ShoppingBag,
  Receipt,
  Home,
  Film,
  Plane,
  HeartPulse,
  GraduationCap,
  MoreHorizontal,
  Landmark,
  Laptop,
  Store,
  TrendingUp,
  Gift,
  Grid2x2,
  Smartphone,
  Gamepad2,
  PawPrint,
  Coffee,
  Dumbbell,
  Baby,
  Wrench,
  Wifi,
  Fuel,
  CircleParking,
  DollarSign,
  PiggyBank,
  Briefcase,
  Star,
  CircleDot,
} from "lucide-react";

type IconComponent = React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

/**
 * Direct map from Material icon code → Lucide component.
 * Using explicit imports so tree-shaking (optimizePackageImports) works correctly.
 */
const ICON_MAP: Record<number, IconComponent> = {
  0xe56c: Utensils,
  0xe547: ShoppingCart,
  0xe530: Bus,
  0xf37b: ShoppingBag,
  0xe14b: Receipt,
  0xe318: Home,
  0xe02c: Film,
  0xe539: Plane,
  0xe548: HeartPulse,
  0xe559: GraduationCap,
  0xe5d3: MoreHorizontal,
  0xe84f: Landmark,
  0xe31e: Laptop,
  0xea12: Store,
  0xe8e5: TrendingUp,
  0xe8f6: Gift,
  0xe1b1: Grid2x2,
  0xe324: Smartphone,
  0xe338: Gamepad2,
  0xe535: PawPrint,
  0xe541: Coffee,
  0xe340: Dumbbell,
  0xe139: Baby,
  0xe869: Wrench,
  0xe63e: Wifi,
  0xe546: Fuel,
  0xe54f: CircleParking,
  0xe227: DollarSign,
  0xf8e1: PiggyBank,
  0xe8f9: Briefcase,
  0xe838: Star,
};

/**
 * Fallback: map category name → icon for default categories seeded by the
 * Flutter app (which may store different Material icon codePoints).
 */
const NAME_ICON_MAP: Record<string, IconComponent> = {
  "food & dining": Utensils,
  "groceries": ShoppingCart,
  "transport": Bus,
  "shopping": ShoppingBag,
  "bills": Receipt,
  "home": Home,
  "entertainment": Film,
  "travel": Plane,
  "health": HeartPulse,
  "education": GraduationCap,
  "other": MoreHorizontal,
  "salary": Landmark,
  "freelance": Laptop,
  "business": Store,
  "investment": TrendingUp,
  "gift": Gift,
};

/**
 * Maps a Material icon code to the corresponding Lucide React component.
 * Falls back to name-based lookup for default categories, then CircleDot.
 */
export function getCategoryIcon(iconCode: number, categoryName?: string): IconComponent {
  return ICON_MAP[iconCode]
    || (categoryName ? NAME_ICON_MAP[categoryName.toLowerCase().trim()] : undefined)
    || CircleDot;
}

export { CircleDot as FallbackIcon };

/**
 * Converts an ARGB int32 value (as stored in Firestore category colorValue)
 * to a CSS hex color string, e.g. 0xFF2ECC71 → "#2ecc71".
 */
export function argbToHex(argb: number): string {
  return `#${(argb & 0x00ffffff).toString(16).padStart(6, "0")}`;
}
