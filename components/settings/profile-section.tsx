"use client";

import { useState, useCallback } from "react";
import { Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/providers/auth-provider";
import { saveUserProfile } from "@/lib/services/user-profile";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/shared/user-avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function ProfileSection() {
  const { user } = useAuth();

  const [editNameOpen, setEditNameOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [savingName, setSavingName] = useState(false);

  const initials = (user?.displayName || "U").charAt(0).toUpperCase();

  const openEditName = useCallback(() => {
    setFormName(user?.displayName || "");
    setEditNameOpen(true);
  }, [user]);

  const handleSaveName = useCallback(async () => {
    if (!user) return;
    const trimmed = formName.trim();
    if (!trimmed) {
      toast.error("Name cannot be empty");
      return;
    }

    setSavingName(true);
    try {
      await saveUserProfile(user.uid, { name: trimmed });
      toast.success("Name updated");
      setEditNameOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update name");
    } finally {
      setSavingName(false);
    }
  }, [user, formName]);

  return (
    <>
      <div className="rounded-xl border border-border/60 bg-card p-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Profile
        </h2>
        <div className="flex items-center gap-4">
          <UserAvatar size="lg" className="size-14 text-xl shadow-md shadow-orange/20" />
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold truncate">
              {user?.displayName || "User"}
            </p>
            <p className="text-[12px] text-muted-foreground truncate mt-0.5">
              {user?.email}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={openEditName}>
            <Pencil className="size-3.5" />
            Edit
          </Button>
        </div>
      </div>

      {/* Edit Name Dialog */}
      <Dialog open={editNameOpen} onOpenChange={setEditNameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base font-heading font-semibold">
              Edit Display Name
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">Name</Label>
            <Input
              placeholder="Your name"
              className="h-9 text-[13px]"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveName();
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditNameOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="orange"
              disabled={savingName}
              onClick={handleSaveName}
            >
              {savingName && <Loader2 className="size-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
