"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, ArrowLeftRight, Plus, Wallet, Settings,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { name: "Add", href: "/transactions?add=expense", icon: Plus, isAction: true },
  { name: "Budget", href: "/budget", icon: Wallet },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-lg">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = !item.isAction && pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 text-xs transition-colors",
                item.isAction
                  ? ""
                  : isActive
                    ? "text-orange"
                    : "text-muted-foreground"
              )}
            >
              {item.isAction ? (
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-orange text-white -mt-5 shadow-lg shadow-orange/30">
                  <item.icon className="h-5 w-5" />
                </div>
              ) : (
                <div className={cn(
                  "flex items-center justify-center h-7 w-7 rounded-lg transition-colors",
                  isActive && "bg-orange/10"
                )}>
                  <item.icon className="h-5 w-5" />
                </div>
              )}
              <span className={cn(item.isAction && "mt-0.5")}>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
