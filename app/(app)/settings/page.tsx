"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import {
  User,
  Pencil,
  Sun,
  Moon,
  Monitor,
  Loader2,
  Download,
  LogOut,
  Unplug,
  Trash2,
  Tag,
  Repeat,
  Receipt,
  ChevronRight,
} from "lucide-react";
import { Timestamp } from "firebase/firestore";

import { useAuth } from "@/providers/auth-provider";
import { useFirebase } from "@/providers/firebase-provider";
import { useTransactions } from "@/lib/hooks/use-transactions";
import { signOut } from "@/lib/firebase/auth";
import { saveUserProfile } from "@/lib/services/user-profile";
import { formatDate } from "@/lib/utils/format";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const { user } = useAuth();
  const { disconnect } = useFirebase();
  const { transactions } = useTransactions();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  // Edit name dialog
  const [editNameOpen, setEditNameOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Disconnect confirmation dialog
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

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

  const exportAllCSV = useCallback(() => {
    if (transactions.length === 0) {
      toast.error("No transactions to export");
      return;
    }
    const header = "Name,Category,Amount,Date,Type,Payment Mode,Note";
    const rows = transactions.map((t) => {
      const date = formatDate(t.date);
      return `"${t.name}","${t.category}",${t.amount},"${date}","${t.type}","${t.paymentMode || ""}","${(t.note || "").replace(/"/g, '""')}"`;
    });
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "selvo-all-transactions.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  }, [transactions]);

  const themeOptions: { value: string; label: string; icon: React.ReactNode }[] = [
    { value: "light", label: "Light", icon: <Sun className="size-3.5" /> },
    { value: "dark", label: "Dark", icon: <Moon className="size-3.5" /> },
    { value: "system", label: "System", icon: <Monitor className="size-3.5" /> },
  ];

  const navLinks: { href: string; label: string; icon: React.ReactNode }[] = [
    { href: "/categories", label: "Categories", icon: <Tag className="size-4" /> },
    { href: "/recurring", label: "Recurring", icon: <Repeat className="size-4" /> },
    { href: "/splitwise", label: "Splitwise", icon: <Receipt className="size-4" /> },
  ];

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Header */}
      <h1 className="text-xl font-semibold tracking-tight">Settings</h1>

      {/* Profile section */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Profile
        </h2>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange to-orange-light flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-white">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              {user?.displayName || "User"}
            </p>
            <p className="text-[12px] text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={openEditName}>
            <Pencil className="size-3.5" />
            Edit
          </Button>
        </div>
      </div>

      {/* Appearance section */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Appearance
        </h2>
        <div className="flex items-center gap-2">
          {themeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium border transition-colors ${
                theme === opt.value
                  ? "border-foreground/30 bg-foreground/5 text-foreground"
                  : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation section */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Navigation
        </h2>
        <div className="space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-[13px] font-medium text-foreground hover:bg-muted/60 transition-colors"
            >
              <span className="text-muted-foreground">{link.icon}</span>
              <span className="flex-1 text-left">{link.label}</span>
              <ChevronRight className="size-3.5 text-muted-foreground/50" />
            </button>
          ))}
        </div>
      </div>

      {/* Data section */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Data
        </h2>
        <p className="text-[13px] text-muted-foreground mb-3">
          Export all your transactions as a CSV file.
        </p>
        <Button variant="outline" size="sm" onClick={exportAllCSV}>
          <Download className="size-3.5" />
          Export CSV
        </Button>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-red-500/30 bg-card p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-red-500 mb-3">
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

      {/* Edit Name Dialog */}
      <Dialog open={editNameOpen} onOpenChange={setEditNameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Display Name</DialogTitle>
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

      {/* Disconnect Confirmation Dialog */}
      <Dialog
        open={disconnectDialogOpen}
        onOpenChange={setDisconnectDialogOpen}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Disconnect Firebase</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-muted-foreground">
            Are you sure you want to disconnect your Firebase project? You will
            need to re-enter your configuration to reconnect.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDisconnectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={disconnecting}
              onClick={handleDisconnect}
            >
              {disconnecting && <Loader2 className="size-4 animate-spin" />}
              Disconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
