"use client";

import { useAuth } from "@/providers/auth-provider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

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
          <div className="h-14 w-14 rounded-2xl overflow-hidden animate-pulse-glow">
            <Image
              src="/assets/logo.png"
              alt="Selvo"
              width={56}
              height={56}
              className="h-full w-full object-cover"
              priority
            />
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
