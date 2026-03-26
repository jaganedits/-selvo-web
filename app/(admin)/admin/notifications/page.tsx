"use client";

import { useState, useEffect, useCallback } from "react";
import { Send, Bell, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

import { useAuth } from "@/providers/auth-provider";
import { getAllUsers, type AdminUser } from "@/lib/services/admin";
import {
  logSentNotification,
  getNotificationHistory,
  type SentNotification,
} from "@/lib/services/notifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { usePageTitle } from "@/lib/hooks/use-page-title";

export default function AdminNotificationsPage() {
  usePageTitle("Notifications");
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [history, setHistory] = useState<SentNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState<"all" | "single">("all");
  const [targetUid, setTargetUid] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    Promise.all([getAllUsers(), getNotificationHistory(20)])
      .then(([u, h]) => {
        setUsers(u);
        setHistory(h);
      })
      .finally(() => setLoading(false));
  }, []);

  const usersWithFcm = users.filter(
    (u) => !!(u as AdminUser & { fcmToken?: string }).uid
  );

  const handleSend = useCallback(async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Title and body are required");
      return;
    }
    if (target === "single" && !targetUid.trim()) {
      toast.error("Select a target user");
      return;
    }

    setSending(true);
    try {
      // Log the notification (actual FCM sending requires a server-side API with Firebase Admin SDK)
      await logSentNotification({
        title: title.trim(),
        body: body.trim(),
        target,
        targetUid: target === "single" ? targetUid : undefined,
        sentBy: user?.email || "admin",
      });

      toast.success("Notification logged successfully");
      toast("Note: Actual push delivery requires Firebase Admin SDK on the server", {
        duration: 5000,
      });

      // Refresh history
      const updated = await getNotificationHistory(20);
      setHistory(updated);
      setTitle("");
      setBody("");
      setTargetUid("");
    } catch {
      toast.error("Failed to send notification");
    } finally {
      setSending(false);
    }
  }, [title, body, target, targetUid, user]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-5 animate-stagger-in stagger-1">
      <h1 className="text-lg font-heading font-semibold">Notifications</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Compose */}
        <div className="rounded-xl border border-border/60 bg-card p-4 space-y-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Compose Notification
          </h2>

          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">Title</Label>
            <Input
              placeholder="Notification title"
              className="h-9 text-[13px]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">Body</Label>
            <textarea
              rows={3}
              placeholder="Notification message..."
              className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-[13px] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none dark:bg-input/30"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">Target</Label>
            <div className="flex items-center gap-1.5">
              {(["all", "single"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTarget(t)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-colors capitalize ${
                    target === t
                      ? "border-foreground/30 bg-foreground/5"
                      : "border-transparent bg-muted/50 hover:bg-muted"
                  }`}
                >
                  {t === "all" ? "All Users" : "Specific User"}
                </button>
              ))}
            </div>
          </div>

          {target === "single" && (
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">User</Label>
              <select
                className="w-full h-9 rounded-lg border border-input bg-transparent px-2.5 text-[13px] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                value={targetUid}
                onChange={(e) => setTargetUid(e.target.value)}
              >
                <option value="">Select a user...</option>
                {users.map((u) => (
                  <option key={u.uid} value={u.uid}>
                    {u.name || u.email} ({u.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button variant="orange" disabled={sending} onClick={handleSend}>
            {sending ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
            Send Notification
          </Button>
        </div>

        {/* History */}
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Sent History
          </h2>
          {history.length === 0 ? (
            <p className="text-[13px] text-muted-foreground text-center py-8">No notifications sent yet</p>
          ) : (
            <div className="space-y-2">
              {history.map((n) => (
                <div
                  key={n.id}
                  className="flex items-start gap-2.5 rounded-lg px-2 py-2 hover:bg-muted/40 transition-colors -mx-2"
                >
                  <div className="h-7 w-7 rounded-lg bg-orange/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Bell className="h-3.5 w-3.5 text-orange" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium truncate">{n.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{n.body}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      To {n.target === "all" ? "all users" : n.targetUid?.slice(0, 8)} · by {n.sentBy} · {formatDistanceToNow(n.sentAt, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
