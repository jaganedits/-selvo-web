"use client";

import { useAuth } from "@/providers/auth-provider";
import { useFirebase } from "@/providers/firebase-provider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Preloader } from "@/components/shared/preloader";
import { SelvoLogo } from "@/components/shared/selvo-logo";

const PUBLIC_ROUTES = ["/", "/login", "/welcome", "/setup", "/guide", "/about"];
const ADMIN_ROUTES_PREFIX = "/admin";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { isConnected, loading: firebaseLoading } = useFirebase();
  const router = useRouter();
  const pathname = usePathname();
  const [showPreloader, setShowPreloader] = useState(() => {
    if (typeof window === "undefined") return false;
    // Set by login page on first-ever sign-in
    const pending = sessionStorage.getItem("selvo_preloader_pending");
    if (pending) {
      sessionStorage.removeItem("selvo_preloader_pending");
      return true;
    }
    return false;
  });

  useEffect(() => {
    if (loading) return;

    const isPublicRoute = PUBLIC_ROUTES.some((route) =>
      route === "/" ? pathname === "/" : pathname.startsWith(route)
    );
    const isAuthPage = pathname.startsWith("/login");
    const isOnboardingPage =
      pathname.startsWith("/welcome") || pathname.startsWith("/setup");
    const isAdminRoute = pathname.startsWith(ADMIN_ROUTES_PREFIX);

    if (!user && !isPublicRoute) {
      router.replace("/login");
    } else if (user && isAuthPage) {
      router.replace("/dashboard");
    } else if (
      user &&
      !isConnected &&
      !firebaseLoading &&
      !isOnboardingPage &&
      !isAdminRoute &&
      pathname !== "/"
    ) {
      router.replace("/welcome");
    }
  }, [user, loading, isConnected, firebaseLoading, pathname, router]);

  if (loading || (user && firebaseLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <SelvoLogo className="h-14 w-14 text-orange" />
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

  return (
    <>
      {showPreloader && (
        <Preloader
          onComplete={() => {
            localStorage.setItem("selvo_preloader_shown", "true");
            setShowPreloader(false);
          }}
        />
      )}
      {children}
    </>
  );
}
