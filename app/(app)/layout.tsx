"use client";

import { createContext, useContext, useMemo, useCallback, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { cn } from "@/lib/utils";
import { trackPageView } from "@/lib/services/analytics";

const SidebarContext = createContext({ collapsed: false, setCollapsed: (_: boolean) => {} });
export function useSidebar() { return useContext(SidebarContext); }

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const toggleSidebar = useCallback(() => setCollapsed((c) => !c), []);
  const contextValue = useMemo(() => ({ collapsed, setCollapsed }), [collapsed]);
  const pathname = usePathname();

  // Track page views
  useEffect(() => {
    const pageName = pathname.replace("/", "") || "dashboard";
    trackPageView(pageName);
  }, [pathname]);

  return (
    <SidebarContext.Provider value={contextValue}>
      <div className="min-h-screen bg-background">
        <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />
        <div className={cn(
          "flex flex-col min-h-screen",
          collapsed ? "md:ml-14" : "md:ml-60"
        )}>
          <Header />
          <main className="flex-1 p-4 md:p-5 lg:p-6 pb-24 md:pb-6">
            {children}
          </main>
        </div>
        <MobileNav />
      </div>
    </SidebarContext.Provider>
  );
}
