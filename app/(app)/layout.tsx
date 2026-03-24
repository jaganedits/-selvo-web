"use client";

import { createContext, useContext, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";

const SidebarContext = createContext({ collapsed: false, setCollapsed: (_: boolean) => {} });
export function useSidebar() { return useContext(SidebarContext); }

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <div className="min-h-screen bg-background">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <div
          className="flex flex-col min-h-screen transition-all duration-200"
          style={{ paddingLeft: collapsed ? 60 : undefined }}
        >
          <div className={collapsed ? "" : "md:pl-55 lg:pl-60"}>
            <Header />
            <main className="p-4 md:p-5 lg:p-6 pb-24 md:pb-6">
              {children}
            </main>
          </div>
        </div>
        <MobileNav />
      </div>
    </SidebarContext.Provider>
  );
}
