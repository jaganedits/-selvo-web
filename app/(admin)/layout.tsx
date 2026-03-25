"use client";

import { AdminGuard } from "@/components/shared/admin-guard";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        <div className="flex flex-col min-h-screen md:ml-56">
          <AdminHeader />
          <main className="flex-1 p-4 md:p-5 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
