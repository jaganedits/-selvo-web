"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, ArrowLeftRight, Wallet, PieChart, Receipt,
  Tag, Repeat, Settings, Plus, LogOut,
} from "lucide-react";
import { signOut } from "@/lib/firebase/auth";

const mainNav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { name: "Budget", href: "/budget", icon: Wallet },
  { name: "Reports", href: "/reports", icon: PieChart },
  { name: "Splitwise", href: "/splitwise", icon: Receipt },
];

const secondaryNav = [
  { name: "Categories", href: "/categories", icon: Tag },
  { name: "Recurring", href: "/recurring", icon: Repeat },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40">
      <div className="flex flex-col flex-1 bg-card border-r border-border">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 py-5">
          <div className="h-9 w-9 rounded-lg overflow-hidden">
            <Image src="/assets/logo.png" alt="Selvo" width={36} height={36} className="h-full w-full object-cover" />
          </div>
          <span className="font-heading text-xl font-bold">Selvo</span>
        </div>

        {/* Add Transaction */}
        <div className="px-4 mb-4">
          <Link href="/transactions?add=expense">
            <Button variant="orange" className="w-full justify-start gap-2">
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
          </Link>
        </div>

        {/* Main nav */}
        <nav className="flex-1 px-3 space-y-1">
          {mainNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-orange/10 text-orange"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4.5 w-4.5" />
                {item.name}
              </Link>
            );
          })}

          <Separator className="my-3" />

          {secondaryNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-orange/10 text-orange"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4.5 w-4.5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-border">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full"
          >
            <LogOut className="h-4.5 w-4.5" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
