"use client";

import { useState, useEffect, useMemo } from "react";
import { Users, Plug, UserPlus, Activity, LogIn } from "lucide-react";
import { getAllUsers, type AdminUser } from "@/lib/services/admin";
import { getRecentLoginsAllUsers, type LoginEvent } from "@/lib/services/login-history";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { formatDistanceToNow, format } from "date-fns";

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logins, setLogins] = useState<LoginEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllUsers(), getRecentLoginsAllUsers(15)])
      .then(([u, l]) => {
        setUsers(u);
        // Enrich login events with user names
        const userMap = new Map(u.map((usr) => [usr.uid, usr]));
        setLogins(
          l.map((ev) => ({
            ...ev,
            userName: userMap.get(ev.uid)?.name,
            userEmail: userMap.get(ev.uid)?.email,
          }))
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return {
      total: users.length,
      connected: users.filter((u) => u.isConnected).length,
      newThisWeek: users.filter((u) => u.createdAt && u.createdAt > weekAgo).length,
      activeThisWeek: users.filter((u) => u.updatedAt && u.updatedAt > weekAgo).length,
    };
  }, [users]);

  const recentUsers = useMemo(
    () =>
      [...users]
        .sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0))
        .slice(0, 10),
    [users]
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-5 animate-stagger-in stagger-1">
      <h1 className="text-lg font-heading font-semibold">Admin Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<Users className="size-4" />} label="Total Users" value={stats.total} />
        <StatCard icon={<Plug className="size-4" />} label="Connected" value={stats.connected} />
        <StatCard icon={<UserPlus className="size-4" />} label="New This Week" value={stats.newThisWeek} />
        <StatCard icon={<Activity className="size-4" />} label="Active This Week" value={stats.activeThisWeek} />
      </div>

      {/* Two-column: Recent Logins + Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      {/* Recent logins */}
      <div className="rounded-xl border border-border/60 bg-card p-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Recent Logins
        </h2>
        {logins.length === 0 ? (
          <p className="text-[13px] text-muted-foreground text-center py-8">No login history yet</p>
        ) : (
          <div className="space-y-1">
            {logins.map((ev) => (
              <div
                key={ev.id}
                className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-muted/40 transition-colors -mx-2"
              >
                <div className="h-7 w-7 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                  <LogIn className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium truncate">{ev.userName || ev.uid.slice(0, 8)}</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    via {ev.method} · {ev.platform || "unknown"}
                  </p>
                </div>
                <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                  {formatDistanceToNow(ev.timestamp, { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent users */}
      <div className="rounded-xl border border-border/60 bg-card p-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Recent Users
        </h2>
        {recentUsers.length === 0 ? (
          <p className="text-[13px] text-muted-foreground text-center py-8">No users yet</p>
        ) : (
          <div className="space-y-1">
            {recentUsers.map((u) => (
              <div
                key={u.uid}
                className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/40 transition-colors -mx-2"
              >
                <div className="h-8 w-8 rounded-full bg-linear-to-br from-orange to-orange-light flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-white">
                    {(u.name || u.email || "U").charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate">{u.name || "Unnamed"}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {u.isConnected && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-income/10 text-income">
                      Connected
                    </span>
                  )}
                  {u.role === "admin" && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-orange/10 text-orange">
                      Admin
                    </span>
                  )}
                  {u.updatedAt && (
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      {formatDistanceToNow(u.updatedAt, { addSuffix: true })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      </div>{/* end grid */}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-heading font-bold tabular-nums">{value}</p>
    </div>
  );
}
