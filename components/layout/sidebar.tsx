"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, ArrowLeftRight, Wallet, PieChart, Receipt,
  Tag, Repeat, Settings, Plus, ChevronRight,
} from "lucide-react";

const navGroups = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
    ],
  },
  {
    label: "Finance",
    items: [
      { name: "Budget", href: "/budget", icon: Wallet },
      { name: "Reports", href: "/reports", icon: PieChart },
      { name: "Splitwise", href: "/splitwise", icon: Receipt },
    ],
  },
  {
    label: "Manage",
    items: [
      { name: "Categories", href: "/categories", icon: Tag },
      { name: "Recurring", href: "/recurring", icon: Repeat },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="hidden md:flex md:w-[220px] lg:w-[240px] md:flex-col md:fixed md:inset-y-0 z-40">
      <div className="flex flex-col flex-1 bg-card/50 border-r border-border/60">
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 pt-4 pb-1">
          <div className="h-7 w-7 rounded-md overflow-hidden">
            <Image src="/assets/logo.png" alt="Selvo" width={28} height={28} className="h-full w-full object-cover" />
          </div>
          <span className="font-heading text-base font-bold tracking-tight">Selvo</span>
        </div>

        {/* Add Transaction — accent pill */}
        <div className="px-3 pt-3 pb-1">
          <Link
            href="/transactions?add=expense"
            className="flex items-center gap-2 rounded-lg bg-orange px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-orange-light active:scale-[0.98]"
          >
            <Plus className="h-3.5 w-3.5" />
            New Transaction
          </Link>
        </div>

        {/* Navigation groups */}
        <nav className="flex-1 overflow-y-auto px-2 pt-2 pb-2">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-1.5">
              <p className="px-2.5 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/60">
                {group.label}
              </p>
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const exactDashboard = item.href === "/dashboard" && pathname === "/dashboard";
                const active = isActive || exactDashboard;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] font-medium transition-all relative",
                      active
                        ? "text-orange bg-orange/[0.08]"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    {/* Active indicator bar */}
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-orange" />
                    )}
                    <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-orange" : "text-muted-foreground/70 group-hover:text-foreground")} />
                    <span className="truncate">{item.name}</span>
                    {active && (
                      <ChevronRight className="ml-auto h-3 w-3 text-orange/50" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User footer — compact, sign out is in header dropdown */}
        <div className="border-t border-border/60 px-2 py-2">
          <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5">
            <div className="h-6 w-6 rounded-full bg-orange/10 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-orange">
                {(user?.displayName || "U").charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate leading-tight">{user?.displayName || "User"}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
