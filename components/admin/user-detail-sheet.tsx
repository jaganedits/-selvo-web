"use client";

import { useState, useEffect } from "react";
import { Shield, ShieldOff, Ban, CheckCircle, Trash2, Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import {
  updateUserRole,
  disableUser,
  enableUser,
  deleteUserAccount,
  type AdminUser,
} from "@/lib/services/admin";
import { getLoginHistory, type LoginEvent } from "@/lib/services/login-history";

interface UserDetailSheetProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
}

export function UserDetailSheet({ user, open, onOpenChange, onUserUpdated }: UserDetailSheetProps) {
  const [loading, setLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loginEvents, setLoginEvents] = useState<LoginEvent[]>([]);

  useEffect(() => {
    if (user && open) {
      getLoginHistory(user.uid, 10).then(setLoginEvents).catch(console.error);
    }
  }, [user, open]);

  if (!user) return null;

  const handleRoleToggle = async () => {
    setLoading(true);
    try {
      const newRole = user.role === "admin" ? "user" : "admin";
      await updateUserRole(user.uid, newRole);
      toast.success(`${user.name} is now ${newRole}`);
      onUserUpdated();
    } catch {
      toast.error("Failed to update role");
    } finally {
      setLoading(false);
    }
  };

  const handleDisableToggle = async () => {
    setLoading(true);
    try {
      if (user.disabled) {
        await enableUser(user.uid);
        toast.success(`${user.name} enabled`);
      } else {
        await disableUser(user.uid);
        toast.success(`${user.name} disabled`);
      }
      onUserUpdated();
    } catch {
      toast.error("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteUserAccount(user.uid);
      toast.success("User deleted");
      setDeleteOpen(false);
      onOpenChange(false);
      onUserUpdated();
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col overflow-y-auto">
          {/* Header */}
          <div className="px-4 pt-4 pb-3 bg-muted/30">
            <SheetHeader className="p-0">
              <SheetTitle className="text-base font-heading font-semibold">
                User Details
              </SheetTitle>
            </SheetHeader>
          </div>

          <div className="flex-1 px-4 py-4 space-y-5">
            {/* Profile */}
            <div className="flex items-center gap-4">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="h-14 w-14 rounded-full object-cover shrink-0 shadow-md shadow-orange/20" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden"); }} />
              ) : null}
              <div className={`h-14 w-14 rounded-full bg-linear-to-br from-orange to-orange-light flex items-center justify-center shrink-0 shadow-md shadow-orange/20 ${user.photoURL ? "hidden" : ""}`}>
                <span className="text-xl font-bold text-white">
                  {(user.name || user.email || "U").charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold truncate">{user.name || "Unnamed"}</p>
                <p className="text-[12px] text-muted-foreground truncate mt-0.5">{user.email}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  {user.role === "admin" && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-orange/10 text-orange">Admin</span>
                  )}
                  {user.isConnected ? (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-income/10 text-income">Connected</span>
                  ) : (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">Not Connected</span>
                  )}
                  {user.disabled && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-destructive/10 text-destructive">Disabled</span>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Details */}
            <div className="space-y-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Account Info</h3>
              <InfoRow label="UID" value={user.uid} mono />
              <InfoRow label="Role" value={user.role} />
              {user.projectId && <InfoRow label="Firebase Project" value={user.projectId} mono />}
              {user.createdAt && <InfoRow label="Joined" value={format(user.createdAt, "dd MMM yyyy, HH:mm")} />}
              {user.updatedAt && <InfoRow label="Last Active" value={format(user.updatedAt, "dd MMM yyyy, HH:mm")} />}
              {user.configSetAt && <InfoRow label="Connected On" value={format(user.configSetAt, "dd MMM yyyy, HH:mm")} />}
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Actions</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  onClick={handleRoleToggle}
                >
                  {user.role === "admin" ? (
                    <><ShieldOff className="size-3.5" /> Demote to User</>
                  ) : (
                    <><Shield className="size-3.5" /> Promote to Admin</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  onClick={handleDisableToggle}
                >
                  {user.disabled ? (
                    <><CheckCircle className="size-3.5" /> Enable</>
                  ) : (
                    <><Ban className="size-3.5" /> Disable</>
                  )}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Login History */}
            <div className="space-y-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Login History</h3>
              {loginEvents.length === 0 ? (
                <p className="text-[12px] text-muted-foreground">No login records</p>
              ) : (
                <div className="space-y-1">
                  {loginEvents.map((ev) => (
                    <div key={ev.id} className="flex items-center gap-2.5 py-1">
                      <LogIn className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="text-[11px] text-muted-foreground capitalize">{ev.method}</span>
                      <span className="text-[11px] text-muted-foreground truncate flex-1">{ev.platform || ""}</span>
                      <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                        {format(ev.timestamp, "dd MMM, HH:mm")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Danger zone */}
            <div className="space-y-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-red-500/60">Danger Zone</h3>
              <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="size-3.5" />
                Delete User
              </Button>
              <p className="text-[11px] text-muted-foreground">
                This removes the user profile from the main database. Their personal Firebase project is not affected.
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete User"
        message={`Are you sure you want to delete ${user.name || user.email}? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={deleting}
        destructive
      />
    </>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[12px] text-muted-foreground shrink-0">{label}</span>
      <span className={`text-[12px] font-medium truncate text-right ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
