import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="md:pl-55 lg:pl-60">
        <div className="p-4 md:p-5 lg:p-6 pb-24 md:pb-6">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
