"use client";

import { useState, useEffect } from "react";
import { Bell, MessageSquare, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { getNotificationHistory, type SentNotification } from "@/lib/services/notifications";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { usePageTitle } from "@/lib/hooks/use-page-title";

export default function AdminMessagingPage() {
  usePageTitle("Messaging");
  const [history, setHistory] = useState<SentNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotificationHistory(30)
      .then(setHistory)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4 animate-stagger-in stagger-1">
      <h1 className="text-lg font-heading font-semibold">Messaging</h1>

      <Tabs defaultValue={0}>
        <TabsList className="w-fit">
          <TabsTrigger value={0}>
            <Bell className="size-3.5" />
            Push (FCM)
          </TabsTrigger>
          <TabsTrigger value={1}>
            <MessageSquare className="size-3.5" />
            In-App (FIAM)
          </TabsTrigger>
        </TabsList>

        <TabsContent value={0}>
          <div className="space-y-4 mt-3">
            {/* Push history */}
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Push Notification History
                </h2>
                <Button variant="orange" size="sm" onClick={() => window.location.href = "/admin/notifications"}>
                  <Bell className="size-3.5" />
                  Compose
                </Button>
              </div>
              {history.length === 0 ? (
                <p className="text-[13px] text-muted-foreground text-center py-8">No notifications sent yet</p>
              ) : (
                <div className="space-y-1.5">
                  {history.map((n) => (
                    <div key={n.id} className="flex items-start gap-2.5 rounded-lg px-2 py-2 hover:bg-muted/40 transition-colors -mx-2">
                      <div className="h-7 w-7 rounded-lg bg-orange/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Bell className="h-3.5 w-3.5 text-orange" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium">{n.title}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{n.body}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {n.target === "all" ? "All users" : `User ${n.targetUid?.slice(0, 8)}`} · {n.sentBy} · {formatDistanceToNow(n.sentAt, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value={1}>
          <div className="space-y-4 mt-3">
            <div className="rounded-xl border border-border/60 bg-card p-6">
              <div className="flex flex-col items-center text-center max-w-md mx-auto py-4">
                <div className="size-12 rounded-xl bg-muted/60 flex items-center justify-center mb-3">
                  <MessageSquare className="size-5 text-muted-foreground" />
                </div>
                <h3 className="text-base font-heading font-semibold mb-1">
                  Firebase In-App Messaging
                </h3>
                <p className="text-[13px] text-muted-foreground mb-4">
                  In-App Messaging campaigns are created and managed in the Firebase Console. Create banners, modals, and image cards that display to users inside the app based on triggers you define.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open("https://console.firebase.google.com", "_blank")}
                >
                  <ExternalLink className="size-3.5" />
                  Open Firebase Console
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-card p-4">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                FIAM Setup Guide
              </h2>
              <div className="space-y-2 text-[13px] text-muted-foreground">
                <p>1. Go to Firebase Console → Engage → In-App Messaging</p>
                <p>2. Click "New campaign" to create a message</p>
                <p>3. Choose a layout: Banner, Modal, Image, or Card</p>
                <p>4. Set trigger conditions (e.g., app_open, specific event)</p>
                <p>5. Publish — messages will automatically display in the Selvo app</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
