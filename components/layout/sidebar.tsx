"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, ArrowLeftRight, Wallet, PieChart, Receipt,
  Tag, Repeat, Settings, Plus, ChevronsLeft, ChevronsRight,
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

const allItems = navGroups.flatMap((g) => g.items);

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  function isActive(href: string) {
    return (
      pathname === href ||
      (href !== "/dashboard" && pathname.startsWith(href)) ||
      (href === "/dashboard" && pathname === "/dashboard")
    );
  }

  // Collapsed: icon rail only (56px)
  if (collapsed) {
    return (
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 z-40 w-14 bg-card border-r border-border/60">
        {/* Logo */}
        <div className="flex items-center justify-center h-11 shrink-0">
          <Link href="/dashboard">
            <div className="h-7 w-7 rounded-md overflow-hidden">
              <Image src="/assets/logo.png" alt="Selvo" width={28} height={28} className="h-full w-full object-cover" />
            </div>
          </Link>
        </div>

        {/* Add */}
        <div className="flex justify-center pb-2">
          <Link
            href="/transactions?add=expense"
            title="New Transaction"
            className="flex items-center justify-center h-9 w-9 rounded-lg bg-orange text-white hover:bg-orange-light"
          >
            <Plus className="h-4 w-4" />
          </Link>
        </div>

        {/* Nav icons */}
        <nav className="flex-1 flex flex-col items-center gap-0.5 px-1.5 overflow-y-auto">
          {allItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                title={item.name}
                className={cn(
                  "relative flex items-center justify-center h-9 w-9 rounded-lg",
                  active
                    ? "text-orange bg-orange/8"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3 rounded-r-full bg-orange" />
                )}
                <item.icon className="h-4 w-4" />
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border/60 flex flex-col items-center gap-1 py-2">
          <button
            onClick={onToggle}
            title="Expand"
            className="flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-muted/60"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
          <div className="h-5 w-5 rounded-full bg-gradient-to-br from-orange to-orange-light flex items-center justify-center">
            <span className="text-[9px] font-bold text-white">
              {(user?.displayName || "U").charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </aside>
    );
  }

  // Expanded: full sidebar (240px)
  return (
    <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 z-40 w-60 bg-card border-r border-border/60">
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Logo */}
        <div className="flex items-center gap-2.5 h-11 px-4 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md overflow-hidden shrink-0">
              <Image src="/assets/logo.png" alt="Selvo" width={28} height={28} className="h-full w-full object-cover" />
            </div>
            <span className="font-heading text-base font-bold tracking-tight">Selvo</span>
          </Link>
        </div>

        {/* Add Transaction */}
        <div className="px-2 pb-1">
          <Link
            href="/transactions?add=expense"
            className="flex items-center gap-2 rounded-lg bg-orange text-white hover:bg-orange-light h-9 px-3"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span className="text-xs font-semibold">New Transaction</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 pt-1 pb-2">
          {navGroups.map((group, gi) => (
            <div key={group.label}>
              {gi > 0 && <div className="mx-2.5 my-2 h-px bg-border/40" />}
              <p className="px-2.5 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/60">
                {group.label}
              </p>
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-lg h-8 px-2.5 text-[13px] font-medium my-px",
                      active
                        ? "text-orange bg-orange/8"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3.5 rounded-r-full bg-orange" />
                    )}
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        active ? "text-orange" : "text-muted-foreground/70 group-hover:text-foreground"
                      )}
                    />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-border/60 px-2 py-1.5">
          <button
            onClick={onToggle}
            className="flex items-center gap-2.5 rounded-lg h-8 px-2.5 text-[13px] text-muted-foreground/60 hover:text-foreground hover:bg-muted/60 w-full"
            title="Collapse"
          >
            <ChevronsLeft className="h-4 w-4 shrink-0" />
            <span className="text-xs">Collapse</span>
          </button>

          <div className="flex items-center gap-2.5 h-8 px-2.5">
            <div className="h-5 w-5 rounded-full bg-gradient-to-br from-orange to-orange-light flex items-center justify-center shrink-0">
              <span className="text-[9px] font-bold text-white">
                {(user?.displayName || "U").charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs font-medium truncate">{user?.displayName || "User"}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
