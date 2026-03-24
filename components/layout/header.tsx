"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { signOut } from "@/lib/firebase/auth";
import { cn } from "@/lib/utils";
import {
  Search, Bell, User, Settings, LogOut, ChevronDown,
} from "lucide-react";

export function Header() {
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
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

  const initials = (user?.displayName || "U").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-md px-4 md:px-5 lg:px-6">
      {/* Left: Search */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden lg:inline-flex h-4 items-center rounded border border-border/60 bg-background px-1 font-mono text-[10px] text-muted-foreground/60">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Notifications + Profile */}
      <div className="flex items-center gap-1.5">
        {/* Notifications */}
        <button className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors relative">
          <Bell className="h-4 w-4" />
        </button>

        {/* User dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors",
              dropdownOpen ? "bg-muted" : "hover:bg-muted"
            )}
          >
            <div className="h-6 w-6 rounded-full bg-orange/10 flex items-center justify-center">
              <span className="text-[10px] font-bold text-orange">{initials}</span>
            </div>
            <span className="hidden sm:block text-xs font-medium max-w-[100px] truncate">
              {user?.displayName || "User"}
            </span>
            <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform", dropdownOpen && "rotate-180")} />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-52 rounded-xl border border-border bg-card shadow-lg shadow-black/10 py-1 animate-fade-in">
              {/* User info */}
              <div className="px-3 py-2.5 border-b border-border/60">
                <p className="text-xs font-medium truncate">{user?.displayName || "User"}</p>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">{user?.email}</p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <Link
                  href="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <User className="h-3.5 w-3.5" />
                  Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </Link>
              </div>

              <div className="border-t border-border/60 py-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    signOut();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors w-full"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
