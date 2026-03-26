"use client";

import { useState, useEffect, useMemo, useCallback, memo, type SyntheticEvent } from "react";
import { Search, Download, Shield, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { auth } from "@/lib/firebase/config";

import { getAllUsers, type AdminUser } from "@/lib/services/admin";
import { usePagination, Pagination } from "@/components/shared/pagination";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserDetailSheet } from "@/components/admin/user-detail-sheet";
import { usePageTitle } from "@/lib/hooks/use-page-title";

type Filter = "all" | "admin" | "connected" | "not-connected";

export default function AdminUsersPage() {
  usePageTitle("User Management");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const loadUsers = useCallback(() => {
    setLoading(true);
    getAllUsers()
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const filtered = useMemo(() => {
    let result = users;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    if (filter === "admin") result = result.filter((u) => u.role === "admin");
    if (filter === "connected") result = result.filter((u) => u.isConnected);
    if (filter === "not-connected") result = result.filter((u) => !u.isConnected);
    return result.sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0));
  }, [users, search, filter]);

  const {
    paginatedItems,
    currentPage,
    totalPages,
    setCurrentPage,
    totalItems,
    pageSize,
  } = usePagination(filtered, 20);

  const openDetail = useCallback((user: AdminUser) => {
    setSelectedUser(user);
    setSheetOpen(true);
  }, []);

  const exportCSV = useCallback(() => {
    if (users.length === 0) {
      toast.error("No users to export");
      return;
    }
    const header = "Name,Email,Role,Connected,Firebase Project,Last Active";
    const rows = users.map((u) =>
      `"${u.name}","${u.email}","${u.role}","${u.isConnected}","${u.projectId || ""}","${u.updatedAt ? format(u.updatedAt, "yyyy-MM-dd HH:mm") : ""}"`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "selvo-users.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  }, [users]);

  const [syncing, setSyncing] = useState(false);
  const syncPhotos = useCallback(async () => {
    setSyncing(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/admin/sync-photos", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Synced ${data.updated} profile photos`);
      loadUsers();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }, [loadUsers]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4 animate-stagger-in stagger-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-heading font-semibold">Users</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={syncPhotos} disabled={syncing}>
            <RefreshCw className={`size-3.5 ${syncing ? "animate-spin" : ""}`} />
            Sync Photos
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="size-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-2">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-8 h-8 text-[13px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-0.5 rounded-lg border border-input p-0.5">
          {(["all", "admin", "connected", "not-connected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors capitalize ${
                filter === f
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "not-connected" ? "Not Connected" : f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-muted-foreground ml-auto tabular-nums">
          {filtered.length} user{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        {/* Header row */}
        <div className="hidden sm:grid sm:grid-cols-[1fr_1fr_80px_90px_120px_80px] items-center gap-2 px-4 h-8 border-b border-border/30 bg-muted/20 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Status</span>
          <span className="text-right">Last Active</span>
          <span className="text-right">Actions</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border/30">
          {paginatedItems.length === 0 ? (
            <p className="text-[13px] text-muted-foreground text-center py-8">No users found</p>
          ) : (
            paginatedItems.map((u) => (
              <UserRow key={u.uid} user={u} onClick={openDetail} />
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="px-4 pb-3">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalItems}
              pageSize={pageSize}
            />
          </div>
        )}
      </div>

      <UserDetailSheet
        user={selectedUser}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onUserUpdated={loadUsers}
      />
    </div>
  );
}

const UserRow = memo(function UserRow({
  user,
  onClick,
}: {
  user: AdminUser;
  onClick: (user: AdminUser) => void;
}) {
  return (
    <button
      onClick={() => onClick(user)}
      className="w-full flex sm:grid sm:grid-cols-[1fr_1fr_80px_90px_120px_80px] items-center gap-2 px-4 h-11 text-left hover:bg-muted/40 transition-all border-l-2 border-l-transparent hover:border-l-orange/50"
    >
      {/* Name */}
      <div className="flex items-center gap-2.5 min-w-0">
        <AdminAvatar photoURL={user.photoURL} name={user.name || user.email} size="sm" />
        <span className="text-[13px] font-medium truncate">{user.name || "Unnamed"}</span>
      </div>

      {/* Email */}
      <span className="text-[12px] text-muted-foreground truncate hidden sm:block">{user.email}</span>

      {/* Role */}
      <span className="hidden sm:block">
        {user.role === "admin" ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-orange/10 text-orange">
            <Shield className="size-2.5" /> Admin
          </span>
        ) : (
          <span className="text-[11px] text-muted-foreground">User</span>
        )}
      </span>

      {/* Status */}
      <span className="hidden sm:block">
        {user.disabled ? (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-destructive/10 text-destructive">Disabled</span>
        ) : user.isConnected ? (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-income/10 text-income">Connected</span>
        ) : (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">Pending</span>
        )}
      </span>

      {/* Last Active */}
      <span className="text-[11px] text-muted-foreground tabular-nums text-right hidden sm:block">
        {user.updatedAt ? format(user.updatedAt, "dd MMM yyyy") : "—"}
      </span>

      {/* Action hint */}
      <span className="text-[11px] text-muted-foreground/50 text-right hidden sm:block">
        View →
      </span>
    </button>
  );
});

function AdminAvatar({ photoURL, name, size = "sm" }: { photoURL?: string; name?: string; size?: "sm" | "md" }) {
  const [imgError, setImgError] = useState(false);
  const sizeClass = size === "md" ? "h-14 w-14" : "h-7 w-7";
  const textClass = size === "md" ? "text-xl" : "text-[9px]";
  const initial = (name || "U").charAt(0).toUpperCase();

  if (photoURL && !imgError) {
    return (
      <img
        src={photoURL}
        alt=""
        className={`${sizeClass} rounded-full object-cover shrink-0`}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className={`${sizeClass} rounded-full bg-linear-to-br from-orange to-orange-light flex items-center justify-center shrink-0`}>
      <span className={`${textClass} font-bold text-white`}>{initial}</span>
    </div>
  );
}
