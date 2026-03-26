"use client";

import { ExternalLink, CheckCircle, XCircle, Database, Shield, Bell, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/lib/hooks/use-page-title";

export default function AdminConfigPage() {
  usePageTitle("System Config");
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "Not configured";
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "Not configured";
  const hasVapidKey = !!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  const hasMeasurementId = !!process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

  const consoleUrl = `https://console.firebase.google.com/project/${projectId}`;

  return (
    <div className="space-y-4 animate-stagger-in stagger-1">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-heading font-semibold">Configuration</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(consoleUrl, "_blank")}
        >
          <ExternalLink className="size-3.5" />
          Firebase Console
        </Button>
      </div>

      {/* Project Info */}
      <div className="rounded-xl border border-border/60 bg-card p-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Firebase Project
        </h2>
        <div className="space-y-3">
          <ConfigRow label="Project ID" value={projectId} mono />
          <ConfigRow label="Auth Domain" value={authDomain} mono />
        </div>
      </div>

      {/* Service Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatusCard
          icon={<Shield className="size-4" />}
          label="Authentication"
          status="active"
          detail="Email + Google OAuth"
        />
        <StatusCard
          icon={<Database className="size-4" />}
          label="Firestore"
          status="active"
          detail="Main + Per-user instances"
        />
        <StatusCard
          icon={<Bell className="size-4" />}
          label="Cloud Messaging"
          status={hasVapidKey ? "active" : "not-configured"}
          detail={hasVapidKey ? "VAPID key configured" : "VAPID key missing in .env"}
        />
        <StatusCard
          icon={<BarChart3 className="size-4" />}
          label="Analytics"
          status={hasMeasurementId ? "active" : "not-configured"}
          detail={hasMeasurementId ? "Measurement ID configured" : "Measurement ID missing in .env"}
        />
      </div>

      {/* Quick Links */}
      <div className="rounded-xl border border-border/60 bg-card p-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Quick Links
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { label: "Authentication", path: "authentication/users" },
            { label: "Firestore Database", path: "firestore" },
            { label: "Cloud Messaging", path: "messaging" },
            { label: "Analytics", path: "analytics" },
            { label: "In-App Messaging", path: "inappmessaging" },
            { label: "Project Settings", path: "settings/general" },
          ].map((link) => (
            <button
              key={link.path}
              onClick={() => window.open(`${consoleUrl}/${link.path}`, "_blank")}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 text-[13px] font-medium text-foreground hover:bg-muted/50 transition-colors"
            >
              {link.label}
              <ExternalLink className="size-3 text-muted-foreground/50" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConfigRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[12px] text-muted-foreground shrink-0">{label}</span>
      <span className={`text-[12px] font-medium truncate text-right ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function StatusCard({
  icon,
  label,
  status,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  status: "active" | "not-configured";
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-[12px] font-semibold">{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        {status === "active" ? (
          <CheckCircle className="size-3 text-income" />
        ) : (
          <XCircle className="size-3 text-muted-foreground" />
        )}
        <span className="text-[11px] text-muted-foreground">{detail}</span>
      </div>
    </div>
  );
}
