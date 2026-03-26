"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { SelvoLogo } from "@/components/shared/selvo-logo";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, ArrowLeftRight, Wallet, PieChart, Receipt,
  Tag, Repeat, Settings, Plus, ChevronsLeft, ChevronsRight,
} from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";

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

  const initials = (user?.displayName || "U").charAt(0).toUpperCase();

  // Collapsed: icon rail only (56px)
  if (collapsed) {
    return (
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 z-40 w-14 bg-card border-r border-border shadow-[1px_0_3px_rgba(0,0,0,0.03)]">
        {/* Logo */}
        <div className="flex items-center justify-center h-12 shrink-0">
          <Link href="/dashboard">
            <SelvoLogo className="h-7 w-7 text-orange" />
          </Link>
        </div>

        {/* Add */}
        <div className="flex justify-center pb-2.5">
          <Link
            href="/transactions?add=expense"
            title="New Transaction"
            className="flex items-center justify-center h-9 w-9 rounded-lg bg-orange text-white hover:bg-orange-light transition-colors shadow-sm shadow-orange/20"
          >
            <Plus className="h-4 w-4" />
          </Link>
        </div>

        {/* Nav icons */}
        <nav className="flex-1 flex flex-col items-center gap-1 px-1.5 overflow-y-auto">
          {allItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                title={item.name}
                className={cn(
                  "relative flex items-center justify-center h-9 w-9 rounded-lg transition-colors",
                  active
                    ? "text-orange bg-orange/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-4 rounded-r-full bg-orange" />
                )}
                <item.icon className="h-4 w-4" />
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border flex flex-col items-center gap-1.5 py-2.5">
          <button
            onClick={onToggle}
            title="Expand"
            className="flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
          <UserAvatar size="sm" />
        </div>
      </aside>
    );
  }

  // Expanded: full sidebar (240px)
  return (
    <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 z-40 w-60 bg-card border-r border-border shadow-[1px_0_3px_rgba(0,0,0,0.03)]">
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Logo */}
        <div className="flex items-center gap-2.5 h-12 px-4 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <SelvoLogo className="h-7 w-7 text-orange" />
            <span className="font-heading text-base font-bold tracking-tight">Selvo</span>
          </Link>
        </div>

        {/* Add Transaction */}
        <div className="px-3 pb-2">
          <Link
            href="/transactions?add=expense"
            className="flex items-center justify-center gap-2 rounded-xl bg-orange text-white hover:bg-orange-light h-9 px-3 transition-colors shadow-sm shadow-orange/20"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span className="text-xs font-semibold">New Transaction</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 pt-1 pb-2">
          {navGroups.map((group, gi) => (
            <div key={group.label}>
              {gi > 0 && <div className="my-2.5" />}
              <p className="px-2.5 pt-1.5 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "group relative flex items-center gap-2.5 rounded-lg h-9 px-2.5 text-[13px] font-medium transition-colors",
                        active
                          ? "text-orange bg-orange/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-4 rounded-r-full bg-orange" />
                      )}
                      <item.icon
                        className={cn(
                          "h-4.5 w-4.5 shrink-0",
                          active ? "text-orange" : "text-muted-foreground/70 group-hover:text-foreground"
                        )}
                      />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-border px-3 py-2.5 space-y-1">
          <button
            onClick={onToggle}
            className="flex items-center gap-2.5 rounded-lg h-8 px-2.5 text-[13px] text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 w-full transition-colors"
            title="Collapse"
          >
            <ChevronsLeft className="h-4 w-4 shrink-0" />
            <span className="text-xs">Collapse</span>
          </button>

          <div className="flex items-center gap-2.5 h-8 px-2.5">
            <UserAvatar size="sm" />
            <span className="text-xs font-medium truncate">{user?.displayName || "User"}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
