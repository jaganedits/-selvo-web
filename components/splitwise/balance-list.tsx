"use client";

import { Loader2, User, Users } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/lib/utils/format";
import type { SplitwiseFriend } from "@/lib/services/splitwise";

interface BalanceListProps {
  loading: boolean;
  friends: SplitwiseFriend[];
}

export function BalanceList({ loading, friends }: BalanceListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (friends.length === 0) {
    return <EmptyState icon={Users} message="No friends found" />;
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      <div className="divide-y divide-border/30">
        {friends.map((friend) => {
          const balance = friend.balance?.[0];
          const amount = balance ? parseFloat(balance.amount) : 0;
          const isPositive = amount > 0;
          const isZero = amount === 0;

          return (
            <div
              key={friend.id}
              className="flex items-center gap-3 px-4 h-12"
            >
              <div className="size-8 rounded-full bg-muted/60 flex items-center justify-center shrink-0">
                <User className="size-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium truncate">
                  {friend.first_name} {friend.last_name}
                </p>
                {friend.email && (
                  <p className="text-[11px] text-muted-foreground truncate">
                    {friend.email}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                {isZero ? (
                  <span className="text-[13px] text-muted-foreground">
                    Settled
                  </span>
                ) : (
                  <>
                    <p
                      className={`text-[13px] tabular-nums font-medium ${
                        isPositive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatCurrency(Math.abs(amount))}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {isPositive ? "owes you" : "you owe"}
                    </p>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
