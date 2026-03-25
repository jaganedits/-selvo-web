"use client";

import { useAuth } from "@/providers/auth-provider";
import { Shield } from "lucide-react";

export function AdminHeader() {
  const { user } = useAuth();
  const initials = (user?.displayName || "U").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex h-12 items-center justify-between px-4 md:px-5 lg:px-6">
        <div className="flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-orange" />
          <span className="text-[13px] font-medium">Admin Panel</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-[12px] text-muted-foreground">{user?.email}</span>
          <div className="h-6 w-6 rounded-full bg-linear-to-br from-orange to-orange-light flex items-center justify-center">
            <span className="text-[9px] font-bold text-white">{initials}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
