"use client";

import { useAuth } from "@/providers/auth-provider";
import { signOut } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button";
import { getGreeting } from "@/lib/utils/format";
import { LogOut } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-8 overflow-hidden">
      {/* Decorative gradient */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-orange/5 blur-3xl" />

      <div
        style={{ animation: "fade-up 0.5s ease-out forwards", opacity: 0 }}
      >
        <h1 className="font-heading text-4xl font-extrabold tracking-tight text-center">
          {getGreeting()},{" "}
          <span className="text-orange">{user?.displayName || "User"}</span>
        </h1>
      </div>

      <p
        className="text-muted-foreground text-base"
        style={{ animation: "fade-up 0.5s ease-out forwards", animationDelay: "100ms", opacity: 0 }}
      >
        Dashboard coming soon
      </p>

      <div
        style={{ animation: "fade-up 0.5s ease-out forwards", animationDelay: "200ms", opacity: 0 }}
      >
        <Button
          variant="outline"
          onClick={() => signOut()}
          className="rounded-xl border-orange text-orange hover:bg-orange/5"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
