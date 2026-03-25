"use client";

import { useState, useCallback } from "react";
import { LogOut, Unplug, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useFirebase } from "@/providers/firebase-provider";
import { signOut } from "@/lib/firebase/auth";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";

export function DangerZone() {
  const { disconnect } = useFirebase();

  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      toast.success("Signed out");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to sign out");
    }
  }, []);

  const handleDisconnect = useCallback(async () => {
    setDisconnecting(true);
    try {
      await disconnect();
      toast.success("Firebase disconnected");
      setDisconnectDialogOpen(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to disconnect"
      );
    } finally {
      setDisconnecting(false);
    }
  }, [disconnect]);

  return (
    <>
      <div className="rounded-xl border border-red-500/30 bg-red-500/2 dark:bg-red-500/4 p-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-red-500/60 mb-3">
          Danger Zone
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium">Sign Out</p>
              <p className="text-[12px] text-muted-foreground">
                Sign out of your account on this device.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="size-3.5" />
              Sign Out
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium">Disconnect Firebase</p>
              <p className="text-[12px] text-muted-foreground">
                Remove your Firebase connection. You can reconnect later.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDisconnectDialogOpen(true)}
            >
              <Unplug className="size-3.5" />
              Disconnect
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-muted-foreground">
                Delete Account
              </p>
              <p className="text-[12px] text-muted-foreground">
                Permanently delete your account and all data.
              </p>
            </div>
            <div className="relative group">
              <Button variant="destructive" size="sm" disabled>
                <Trash2 className="size-3.5" />
                Delete
              </Button>
              <div className="absolute bottom-full right-0 mb-1.5 px-2.5 py-1 rounded-md bg-foreground text-background text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Coming soon
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={disconnectDialogOpen}
        onOpenChange={setDisconnectDialogOpen}
        title="Disconnect Firebase"
        message="Are you sure you want to disconnect your Firebase project? You will need to re-enter your configuration to reconnect."
        confirmLabel="Disconnect"
        onConfirm={handleDisconnect}
        loading={disconnecting}
        destructive
      />
    </>
  );
}
