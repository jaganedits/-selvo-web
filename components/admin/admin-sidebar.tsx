"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SelvoLogo } from "@/components/shared/selvo-logo";
import {
  LayoutDashboard, Users, Bell, MessageSquare, Settings2, ArrowLeft, Shield,
} from "lucide-react";

const navGroups = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Users", href: "/admin/users", icon: Users },
    ],
  },
  {
    label: "Engage",
    items: [
      { name: "Notifications", href: "/admin/notifications", icon: Bell },
      { name: "Messaging", href: "/admin/messaging", icon: MessageSquare },
    ],
  },
  {
    label: "System",
    items: [
      { name: "Config", href: "/admin/config", icon: Settings2 },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 z-40 w-56 bg-card border-r border-border shadow-[1px_0_3px_rgba(0,0,0,0.03)]">
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Logo + Admin badge */}
        <div className="flex items-center gap-2.5 h-12 px-4 shrink-0">
          <Link href="/admin" className="flex items-center gap-2.5">
            <SelvoLogo className="h-7 w-7 text-orange" />
            <span className="font-heading text-base font-bold tracking-tight">Selvo</span>
          </Link>
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-orange/10 text-orange text-[10px] font-semibold uppercase tracking-wider">
            <Shield className="size-2.5" />
            Admin
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pt-3 pb-2">
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
        <div className="border-t border-border px-3 py-2.5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 rounded-lg h-8 px-2.5 text-[13px] text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 w-full transition-colors"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            <span className="text-xs">Back to App</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
