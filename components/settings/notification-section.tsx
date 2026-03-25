"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
  requestNotificationPermission,
  removeFcmToken,
  getNotificationPermissionStatus,
} from "@/lib/services/fcm";

export function NotificationSection() {
  const { user } = useAuth();
  const [permStatus, setPermStatus] = useState<NotificationPermission | "unsupported">("default");
  const [enabling, setEnabling] = useState(false);

  useEffect(() => {
    setPermStatus(getNotificationPermissionStatus());
  }, []);

  const handleEnable = async () => {
    if (!user) return;
    setEnabling(true);
    try {
      const token = await requestNotificationPermission(user.uid);
      if (token) {
        setPermStatus("granted");
        toast.success("Notifications enabled");
      } else {
        toast.error("Permission denied or not supported");
        setPermStatus(getNotificationPermissionStatus());
      }
    } catch {
      toast.error("Failed to enable notifications");
    } finally {
      setEnabling(false);
    }
  };

  const handleDisable = async () => {
    if (!user) return;
    try {
      await removeFcmToken(user.uid);
      toast.success("Notifications disabled");
    } catch {
      toast.error("Failed to disable notifications");
    }
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Notifications
      </h2>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] font-medium">Push Notifications</p>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {permStatus === "granted"
              ? "You will receive push notifications"
              : permStatus === "denied"
                ? "Notifications are blocked in your browser settings"
                : permStatus === "unsupported"
                  ? "Your browser does not support notifications"
                  : "Get notified about budget alerts and updates"}
          </p>
        </div>
        {permStatus === "granted" ? (
          <Button variant="outline" size="sm" onClick={handleDisable}>
            <BellOff className="size-3.5" />
            Disable
          </Button>
        ) : permStatus !== "denied" && permStatus !== "unsupported" ? (
          <Button variant="orange" size="sm" disabled={enabling} onClick={handleEnable}>
            <Bell className="size-3.5" />
            {enabling ? "Enabling..." : "Enable"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
