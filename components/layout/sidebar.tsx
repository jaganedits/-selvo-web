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

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <>
      {/* Fixed sidebar — always 240px wide, slides off-screen when collapsed */}
      <aside
        className="hidden md:flex md:flex-col md:fixed md:inset-y-0 z-40 w-60 will-change-transform"
        style={{
          transform: collapsed ? "translateX(-184px)" : "translateX(0)",
          transition: "transform 200ms ease-out",
        }}
      >
        <div className="flex flex-col flex-1 bg-card border-r border-border/60 overflow-hidden">
          {/* Logo */}
          <div className="flex items-center h-11 px-4 shrink-0">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-md overflow-hidden shrink-0">
                <Image src="/assets/logo.png" alt="Selvo" width={28} height={28} className="h-full w-full object-cover" />
              </div>
              <span
                className="font-heading text-base font-bold tracking-tight whitespace-nowrap overflow-hidden"
                style={{
                  opacity: collapsed ? 0 : 1,
                  transition: "opacity 150ms ease-out",
                }}
              >
                Selvo
              </span>
            </Link>
          </div>

          {/* Add Transaction */}
          <div className="px-2 pb-1">
            <Link
              href="/transactions?add=expense"
              title="New Transaction"
              className="flex items-center gap-2 rounded-lg bg-orange text-white hover:bg-orange-light h-9 px-2.5 overflow-hidden whitespace-nowrap"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span
                className="text-xs font-semibold"
                style={{
                  opacity: collapsed ? 0 : 1,
                  transition: "opacity 150ms ease-out",
                }}
              >
                New Transaction
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 pt-1 pb-2">
            {navGroups.map((group, gi) => (
              <div key={group.label}>
                <div
                  className="overflow-hidden whitespace-nowrap"
                  style={{
                    height: collapsed ? 8 : 24,
                    opacity: collapsed ? 0 : 1,
                    transition: "height 200ms ease-out, opacity 150ms ease-out",
                  }}
                >
                  {gi > 0 && !collapsed && (
                    <div className="mx-2.5 mb-1.5 mt-0.5 h-px bg-border/40" />
                  )}
                  <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/60">
                    {group.label}
                  </p>
                </div>

                {group.items.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href)) ||
                    (item.href === "/dashboard" && pathname === "/dashboard");

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      title={item.name}
                      className={cn(
                        "group relative flex items-center gap-2.5 rounded-lg h-8 px-2.5 text-[13px] font-medium overflow-hidden whitespace-nowrap my-px",
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
                      <span
                        style={{
                          opacity: collapsed ? 0 : 1,
                          transition: "opacity 150ms ease-out",
                        }}
                      >
                        {item.name}
                      </span>
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
              className="flex items-center gap-2.5 rounded-lg h-8 px-2.5 text-muted-foreground/60 hover:text-foreground hover:bg-muted/60 overflow-hidden whitespace-nowrap w-full"
              title={collapsed ? "Expand" : "Collapse"}
            >
              {collapsed ? (
                <ChevronsRight className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronsLeft className="h-4 w-4 shrink-0" />
              )}
              <span
                className="text-xs"
                style={{
                  opacity: collapsed ? 0 : 1,
                  transition: "opacity 150ms ease-out",
                }}
              >
                Collapse
              </span>
            </button>

            <div className="flex items-center gap-2.5 h-8 px-2.5 overflow-hidden">
              <div className="h-5 w-5 rounded-full bg-gradient-to-br from-orange to-orange-light flex items-center justify-center shrink-0">
                <span className="text-[9px] font-bold text-white">
                  {(user?.displayName || "U").charAt(0).toUpperCase()}
                </span>
              </div>
              <span
                className="text-xs font-medium truncate"
                style={{
                  opacity: collapsed ? 0 : 1,
                  transition: "opacity 150ms ease-out",
                }}
              >
                {user?.displayName || "User"}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
