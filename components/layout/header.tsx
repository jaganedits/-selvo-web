"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@/providers/auth-provider";
import { signOut } from "@/lib/firebase/auth";
import { cn } from "@/lib/utils";
import {
  Search, User, Settings, LogOut, ChevronDown,
  Sun, Moon, LayoutDashboard, ArrowLeftRight, Wallet,
  PieChart, Receipt, Tag, Repeat, Menu,
} from "lucide-react";

const PAGE_NAMES: Record<string, { label: string; icon: React.ElementType }> = {
  "/dashboard": { label: "Dashboard", icon: LayoutDashboard },
  "/transactions": { label: "Transactions", icon: ArrowLeftRight },
  "/budget": { label: "Budget", icon: Wallet },
  "/reports": { label: "Reports", icon: PieChart },
  "/splitwise": { label: "Splitwise", icon: Receipt },
  "/categories": { label: "Categories", icon: Tag },
  "/recurring": { label: "Recurring", icon: Repeat },
  "/settings": { label: "Settings", icon: Settings },
};

export function Header() {
  const { user } = useAuth();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [dropdownOpen]);

  // Find current page
  const currentPage = Object.entries(PAGE_NAMES).find(
    ([path]) => pathname === path || (path !== "/dashboard" && pathname.startsWith(path))
  );
  const pageLabel = currentPage?.[1].label || "Dashboard";
  const PageIcon = currentPage?.[1].icon || LayoutDashboard;
  const initials = (user?.displayName || "U").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex h-11 items-center gap-3 px-4 md:px-5 lg:px-6">
        {/* Left: Page context */}
        <div className="flex items-center gap-2 min-w-0">
          <PageIcon className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
          <span className="text-[13px] font-medium truncate">{pageLabel}</span>
        </div>

        {/* Center: Command palette trigger */}
        <div className="flex-1 flex justify-center max-w-md mx-auto">
          <button className="group flex items-center gap-2 w-full max-w-xs rounded-lg border border-border/50 bg-muted/30 px-3 py-1 text-xs text-muted-foreground/60 transition-all hover:border-border hover:bg-muted/50 hover:text-muted-foreground">
            <Search className="h-3 w-3 shrink-0" />
            <span className="flex-1 text-left">Search or jump to...</span>
            <div className="flex items-center gap-0.5">
              <kbd className="h-4 min-w-[18px] inline-flex items-center justify-center rounded border border-border/50 bg-background/80 px-1 font-mono text-[9px] text-muted-foreground/50">
                ⌘
              </kbd>
              <kbd className="h-4 min-w-[18px] inline-flex items-center justify-center rounded border border-border/50 bg-background/80 px-1 font-mono text-[9px] text-muted-foreground/50">
                K
              </kbd>
            </div>
          </button>
        </div>

        {/* Right: Theme + User */}
        <div className="flex items-center gap-1">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-muted/60 overflow-hidden"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            <Sun
              className="h-3.5 w-3.5 absolute"
              style={{
                transform: theme === "dark" ? "rotate(-90deg) scale(0)" : "rotate(0deg) scale(1)",
                opacity: theme === "dark" ? 0 : 1,
                transition: "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 300ms ease",
              }}
            />
            <Moon
              className="h-3.5 w-3.5 absolute"
              style={{
                transform: theme === "dark" ? "rotate(0deg) scale(1)" : "rotate(90deg) scale(0)",
                opacity: theme === "dark" ? 1 : 0,
                transition: "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 300ms ease",
              }}
            />
          </button>

          {/* User dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg pl-1.5 pr-2 py-1 transition-colors",
                dropdownOpen ? "bg-muted" : "hover:bg-muted/60"
              )}
            >
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-orange to-orange-light flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">{initials}</span>
              </div>
              <ChevronDown className={cn(
                "h-3 w-3 text-muted-foreground/50 transition-transform",
                dropdownOpen && "rotate-180"
              )} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 rounded-xl border border-border/60 bg-card shadow-xl shadow-black/10 overflow-hidden animate-fade-in">
                {/* User info */}
                <div className="px-3 py-3 bg-muted/30">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange to-orange-light flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-white">{initials}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{user?.displayName || "User"}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>

                <div className="py-1">
                  <DropdownItem
                    href="/settings"
                    icon={User}
                    label="Profile"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <DropdownItem
                    href="/settings"
                    icon={Settings}
                    label="Settings"
                    onClick={() => setDropdownOpen(false)}
                  />
                </div>

                <div className="border-t border-border/40 py-1">
                  <button
                    onClick={() => { setDropdownOpen(false); signOut(); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function DropdownItem({
  href, icon: Icon, label, onClick,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </Link>
  );
}
