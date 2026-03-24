"use client";

import { useAuth } from "@/providers/auth-provider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

const PUBLIC_ROUTES = ["/login", "/welcome", "/setup"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    const isPublicRoute = PUBLIC_ROUTES.some((route) =>
      pathname.startsWith(route)
    );

    if (!user && !isPublicRoute) {
      router.replace("/login");
    } else if (user && isPublicRoute) {
      router.replace("/");
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange animate-pulse-glow"
          >
            <span className="font-heading text-2xl font-bold text-white">S</span>
          </div>
          <p
            className="font-heading text-xl font-bold"
            style={{ animation: "fade-in 0.4s ease-out forwards", animationDelay: "200ms", opacity: 0 }}
          >
            Selvo
          </p>
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange border-t-transparent" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
