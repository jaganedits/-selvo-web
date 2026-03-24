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
          className="flex flex-col min-h-screen will-change-[margin-left]"
          style={{
            marginLeft: collapsed ? 56 : 240,
            transition: "margin-left 200ms ease-out",
          }}
        >
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
