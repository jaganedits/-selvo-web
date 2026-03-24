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
      className="hidden md:flex md:flex-col md:fixed md:inset-y-0 z-40 transition-[width] duration-300 ease-in-out overflow-hidden"
      style={{ width: collapsed ? 60 : 240 }}
    >
      <div className="flex flex-col flex-1 bg-card/50 border-r border-border/60 min-w-0">
        {/* Logo + Collapse toggle */}
        <div className="flex items-center justify-between px-3 pt-3 pb-1 whitespace-nowrap">
          <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
            <div className="h-7 w-7 rounded-md overflow-hidden shrink-0">
              <Image src="/assets/logo.png" alt="Selvo" width={28} height={28} className="h-full w-full object-cover" />
            </div>
            <span className={cn(
              "font-heading text-base font-bold tracking-tight transition-opacity duration-200",
              collapsed ? "opacity-0 w-0" : "opacity-100"
            )}>Selvo</span>
          </Link>
          <button
            onClick={onToggle}
            className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-muted/60 transition-colors shrink-0"
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
            className="flex items-center gap-2 rounded-lg bg-orange text-white transition-all duration-200 hover:bg-orange-light active:scale-[0.98] px-2.5 py-2 whitespace-nowrap overflow-hidden"
            title="New Transaction"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span className={cn(
              "text-xs font-semibold transition-opacity duration-200",
              collapsed ? "opacity-0 w-0" : "opacity-100"
            )}>New Transaction</span>
          </Link>
        </div>

        {/* Navigation groups */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 pt-2 pb-2">
          {navGroups.map((group, gi) => (
            <div key={group.label} className="mb-1">
              <div className={cn(
                "overflow-hidden transition-all duration-200",
                collapsed ? "h-0 opacity-0" : "h-6 opacity-100"
              )}>
                <p className="px-2.5 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/60 whitespace-nowrap">
                  {group.label}
                </p>
              </div>
              {gi > 0 && (
                <div className={cn(
                  "mx-2 h-px bg-border/40 transition-all duration-200",
                  collapsed ? "my-1.5 opacity-100" : "my-0 opacity-0 h-0"
                )} />
              )}
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const exactDashboard = item.href === "/dashboard" && pathname === "/dashboard";
                const active = isActive || exactDashboard;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={item.name}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] font-medium transition-all duration-200 relative whitespace-nowrap overflow-hidden",
                      active
                        ? "text-orange bg-orange/[0.08]"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-orange transition-all duration-200" />
                    )}
                    <item.icon className={cn(
                      "h-4 w-4 shrink-0",
                      active ? "text-orange" : "text-muted-foreground/70 group-hover:text-foreground"
                    )} />
                    <span className={cn(
                      "truncate transition-opacity duration-200",
                      collapsed ? "opacity-0" : "opacity-100"
                    )}>{item.name}</span>
                    {active && !collapsed && (
                      <ChevronRight className="ml-auto h-3 w-3 text-orange/50 shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-border/60 px-2 py-2">
          <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 overflow-hidden whitespace-nowrap">
            <div className="h-6 w-6 rounded-full bg-orange/10 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-orange">
                {(user?.displayName || "U").charAt(0).toUpperCase()}
              </span>
            </div>
            <p className={cn(
              "text-xs font-medium truncate transition-opacity duration-200",
              collapsed ? "opacity-0" : "opacity-100"
            )}>{user?.displayName || "User"}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
