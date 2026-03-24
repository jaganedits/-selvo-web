"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, ArrowLeftRight, Wallet, PieChart, Receipt,
  Tag, Repeat, Settings, Plus, ChevronRight, PanelLeftClose, PanelLeft,
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

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside
      className={cn(
        "hidden md:flex md:flex-col md:fixed md:inset-y-0 z-40 transition-all duration-200",
        collapsed ? "md:w-[60px]" : "md:w-[220px] lg:w-[240px]"
      )}
    >
      <div className="flex flex-col flex-1 bg-card/50 border-r border-border/60">
        {/* Logo + Collapse toggle */}
        <div className={cn("flex items-center px-3 pt-3 pb-1", collapsed ? "justify-center" : "justify-between")}>
          <Link href="/dashboard" className={cn("flex items-center gap-2", collapsed && "justify-center")}>
            <div className="h-7 w-7 rounded-md overflow-hidden shrink-0">
              <Image src="/assets/logo.png" alt="Selvo" width={28} height={28} className="h-full w-full object-cover" />
            </div>
            {!collapsed && (
              <span className="font-heading text-base font-bold tracking-tight">Selvo</span>
            )}
          </Link>
          <button
            onClick={onToggle}
            className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-muted/60 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeft className="h-3.5 w-3.5" />
            ) : (
              <PanelLeftClose className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Add Transaction */}
        <div className="px-2 pt-3 pb-1">
          <Link
            href="/transactions?add=expense"
            className={cn(
              "flex items-center rounded-lg bg-orange text-white transition-all hover:bg-orange-light active:scale-[0.98]",
              collapsed
                ? "justify-center h-9 w-9 mx-auto"
                : "gap-2 px-3 py-2 text-xs font-semibold"
            )}
            title={collapsed ? "New Transaction" : undefined}
          >
            <Plus className={cn("shrink-0", collapsed ? "h-4 w-4" : "h-3.5 w-3.5")} />
            {!collapsed && "New Transaction"}
          </Link>
        </div>

        {/* Navigation groups */}
        <nav className="flex-1 overflow-y-auto px-2 pt-2 pb-2">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-1.5">
              {!collapsed && (
                <p className="px-2.5 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/60">
                  {group.label}
                </p>
              )}
              {collapsed && group.label !== "Overview" && (
                <div className="my-2 mx-2 h-px bg-border/40" />
              )}
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const exactDashboard = item.href === "/dashboard" && pathname === "/dashboard";
                const active = isActive || exactDashboard;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={collapsed ? item.name : undefined}
                    className={cn(
                      "group flex items-center rounded-lg transition-all relative",
                      collapsed
                        ? "justify-center h-9 w-9 mx-auto my-0.5"
                        : "gap-2.5 px-2.5 py-[7px] text-[13px] font-medium",
                      active
                        ? "text-orange bg-orange/[0.08]"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    {active && !collapsed && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-orange" />
                    )}
                    {active && collapsed && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-3 rounded-r-full bg-orange" />
                    )}
                    <item.icon className={cn(
                      "shrink-0",
                      collapsed ? "h-4.5 w-4.5" : "h-4 w-4",
                      active ? "text-orange" : "text-muted-foreground/70 group-hover:text-foreground"
                    )} />
                    {!collapsed && (
                      <>
                        <span className="truncate">{item.name}</span>
                        {active && <ChevronRight className="ml-auto h-3 w-3 text-orange/50" />}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-border/60 px-2 py-2">
          <div className={cn(
            "flex items-center rounded-lg",
            collapsed ? "justify-center py-1.5" : "gap-2.5 px-2.5 py-1.5"
          )}>
            <div className="h-6 w-6 rounded-full bg-orange/10 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-orange">
                {(user?.displayName || "U").charAt(0).toUpperCase()}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate leading-tight">{user?.displayName || "User"}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
