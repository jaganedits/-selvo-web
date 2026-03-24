"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { Timestamp } from "firebase/firestore";
import { toast } from "sonner";
import {
  Loader2,
  Unplug,
  RefreshCw,
  Download,
  User,
  Users,
  Receipt,
} from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { useFirebase } from "@/providers/firebase-provider";
import {
  addTransaction,
  getImportedSplitwiseIds,
  saveSplitWiseApiKey,
  getSplitWiseApiKey,
  clearSplitWiseApiKey,
} from "@/lib/services/firestore";
import {
  splitwiseGetCurrentUser,
  splitwiseGetExpenses,
  splitwiseGetFriends,
  parseSplitwiseExpense,
  type SplitwiseExpense,
  type SplitwiseFriend,
} from "@/lib/services/splitwise";
import { formatCurrency, formatDate } from "@/lib/utils/format";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Pagination, usePagination } from "@/components/shared/pagination";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ParsedExpense {
  splitwiseId: string;
  amount: number;
  name: string;
  category: string;
  date: string;
  isSettlement: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SplitwisePage() {
  const { user } = useAuth();
  const { userFirestore } = useFirebase();

  // Connection state
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ first_name: string; last_name: string; id: number } | null>(null);

  // Disconnect dialog
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  // Expenses state
  const [expenses, setExpenses] = useState<SplitwiseExpense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);

  // Friends state
  const [friends, setFriends] = useState<SplitwiseFriend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<number>(0);

  // ---------------------------------------------------------------------------
  // Load saved API key on mount
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      try {
        const saved = await getSplitWiseApiKey(user!.uid);
        if (cancelled) return;
        if (saved) {
          setApiKey(saved);
          // Validate the key by fetching current user
          try {
            const res = await splitwiseGetCurrentUser(saved);
            if (cancelled) return;
            if (res.user) {
              setCurrentUser(res.user);
            } else {
              // Invalid key
              setApiKey(null);
              await clearSplitWiseApiKey(user!.uid);
            }
          } catch {
            setApiKey(null);
            await clearSplitWiseApiKey(user!.uid);
          }
        }
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [user]);

  // ---------------------------------------------------------------------------
  // Load expenses & friends when connected
  // ---------------------------------------------------------------------------

  const loadExpenses = useCallback(async () => {
    if (!apiKey || !user || !userFirestore) return;
    setLoadingExpenses(true);
    try {
      const [rawExpenses, imported] = await Promise.all([
        splitwiseGetExpenses(apiKey, 100, 0),
        getImportedSplitwiseIds(userFirestore, user.uid),
      ]);
      setExpenses(rawExpenses.filter((e) => !e.deleted_at));
      setImportedIds(imported);
      setSelectedIds(new Set());
    } catch (err) {
      toast.error("Failed to load Splitwise expenses");
      console.error(err);
    } finally {
      setLoadingExpenses(false);
    }
  }, [apiKey, user, userFirestore]);

  const loadFriends = useCallback(async () => {
    if (!apiKey) return;
    setLoadingFriends(true);
    try {
      const data = await splitwiseGetFriends(apiKey);
      setFriends(data);
    } catch (err) {
      toast.error("Failed to load Splitwise friends");
      console.error(err);
    } finally {
      setLoadingFriends(false);
    }
  }, [apiKey]);

  useEffect(() => {
    if (apiKey && currentUser) {
      loadExpenses();
      loadFriends();
    }
  }, [apiKey, currentUser, loadExpenses, loadFriends]);

  // ---------------------------------------------------------------------------
  // Parse expenses
  // ---------------------------------------------------------------------------

  const parsedExpenses = useMemo(() => {
    if (!currentUser) return [];
    return expenses
      .map((e) => parseSplitwiseExpense(e, currentUser.id))
      .filter((p): p is ParsedExpense => p !== null && !p.isSettlement);
  }, [expenses, currentUser]);

  // ---------------------------------------------------------------------------
  // Connect
  // ---------------------------------------------------------------------------

  const handleConnect = useCallback(async () => {
    if (!user) return;
    const key = apiKeyInput.trim();
    if (!key) {
      toast.error("Enter your Splitwise API key");
      return;
    }

    setConnecting(true);
    try {
      const res = await splitwiseGetCurrentUser(key);
      if (!res.user) {
        toast.error("Invalid API key");
        return;
      }
      setCurrentUser(res.user);
      setApiKey(key);
      await saveSplitWiseApiKey(user.uid, key);
      setApiKeyInput("");
      toast.success(`Connected as ${res.user.first_name}`);
    } catch {
      toast.error("Failed to connect. Check your API key.");
    } finally {
      setConnecting(false);
    }
  }, [user, apiKeyInput]);

  // ---------------------------------------------------------------------------
  // Disconnect
  // ---------------------------------------------------------------------------

  const handleDisconnect = useCallback(async () => {
    if (!user) return;
    setDisconnecting(true);
    try {
      await clearSplitWiseApiKey(user.uid);
      setApiKey(null);
      setCurrentUser(null);
      setExpenses([]);
      setFriends([]);
      setSelectedIds(new Set());
      setImportedIds(new Set());
      setDisconnectOpen(false);
      toast.success("Disconnected from Splitwise");
    } catch {
      toast.error("Failed to disconnect");
    } finally {
      setDisconnecting(false);
    }
  }, [user]);

  // ---------------------------------------------------------------------------
  // Selection
  // ---------------------------------------------------------------------------

  const toggleSelect = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    []
  );

  const selectableExpenses = useMemo(
    () => parsedExpenses.filter((e) => !importedIds.has(e.splitwiseId)),
    [parsedExpenses, importedIds]
  );

  const { paginatedItems: paginatedExpenses, currentPage: expensePage, totalPages: expenseTotalPages, setCurrentPage: setExpensePage, totalItems: expenseTotalItems, pageSize: expensePageSize } = usePagination(parsedExpenses, 20);

  const pageSelectableExpenses = useMemo(
    () => paginatedExpenses.filter((e) => !importedIds.has(e.splitwiseId)),
    [paginatedExpenses, importedIds]
  );

  const toggleSelectAll = useCallback(() => {
    if (pageSelectableExpenses.length > 0 && pageSelectableExpenses.every((e) => selectedIds.has(e.splitwiseId))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pageSelectableExpenses.map((e) => e.splitwiseId)));
    }
  }, [selectedIds, pageSelectableExpenses]);

  // ---------------------------------------------------------------------------
  // Import
  // ---------------------------------------------------------------------------

  const handleImport = useCallback(async () => {
    if (!user || !userFirestore || selectedIds.size === 0) return;
    setImporting(true);
    let count = 0;

    try {
      for (const parsed of parsedExpenses) {
        if (!selectedIds.has(parsed.splitwiseId)) continue;

        await addTransaction(userFirestore, user.uid, {
          type: "expense",
          amount: parsed.amount,
          category: parsed.category,
          name: parsed.name,
          date: Timestamp.fromDate(new Date(parsed.date)),
          note: "Imported from Splitwise",
          splitwiseId: parsed.splitwiseId,
        });
        count++;
      }

      toast.success(`Imported ${count} expense${count !== 1 ? "s" : ""}`);

      // Refresh imported IDs
      const updated = await getImportedSplitwiseIds(userFirestore, user.uid);
      setImportedIds(updated);
      setSelectedIds(new Set());
    } catch (err) {
      toast.error("Failed to import some expenses");
      console.error(err);
    } finally {
      setImporting(false);
    }
  }, [user, userFirestore, selectedIds, parsedExpenses]);

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Not connected
  // ---------------------------------------------------------------------------

  if (!apiKey || !currentUser) {
    return (
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-lg font-heading font-semibold">Splitwise</h1>

        <div className="rounded-xl border border-border/60 bg-card p-6">
          <div className="flex flex-col items-center text-center py-6">
            <div className="size-12 rounded-xl bg-muted/60 flex items-center justify-center mb-3">
              <Image
                src="/assets/splitwise.svg"
                alt="Splitwise"
                width={24}
                height={24}
              />
            </div>
            <h2 className="text-base font-heading font-semibold mb-1">
              Connect Splitwise
            </h2>
            <p className="text-[13px] text-muted-foreground max-w-sm">
              Connect your Splitwise account to import shared expenses and keep
              track of balances with friends.
            </p>
          </div>

          <div className="space-y-3 mt-4">
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">
                API Key
              </Label>
              <Input
                placeholder="Enter your Splitwise API key"
                className="h-9 text-[13px]"
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConnect();
                }}
              />
              <p className="text-[11px] text-muted-foreground">
                Get your API key from{" "}
                <a
                  href="https://secure.splitwise.com/apps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  secure.splitwise.com/apps
                </a>
              </p>
            </div>

            <Button
              variant="orange"
              size="lg"
              className="w-full"
              disabled={connecting}
              onClick={handleConnect}
            >
              {connecting && <Loader2 className="size-4 animate-spin" />}
              Connect
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Connected
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-heading font-semibold">Splitwise</h1>
          <Separator orientation="vertical" className="h-5" />
          <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <User className="size-3.5" />
            <span>{currentUser.first_name} {currentUser.last_name}</span>
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setDisconnectOpen(true)}
        >
          <Unplug className="size-3.5" />
          Disconnect
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue={0}
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as number)}
      >
        <div className="flex items-center justify-between">
          <TabsList className="w-fit">
            <TabsTrigger value={0}>
              <Receipt className="size-3.5" />
              Expenses
            </TabsTrigger>
            <TabsTrigger value={1}>
              <Users className="size-3.5" />
              Balances
            </TabsTrigger>
          </TabsList>

          {activeTab === 0 && (
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 && (
                <Button
                  variant="orange"
                  size="sm"
                  disabled={importing}
                  onClick={handleImport}
                >
                  {importing ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Download className="size-3.5" />
                  )}
                  Import {selectedIds.size} selected
                </Button>
              )}
              <Button
                variant="outline"
                size="icon-sm"
                onClick={loadExpenses}
                disabled={loadingExpenses}
              >
                <RefreshCw
                  className={`size-3.5 ${loadingExpenses ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          )}

          {activeTab === 1 && (
            <Button
              variant="outline"
              size="icon-sm"
              onClick={loadFriends}
              disabled={loadingFriends}
            >
              <RefreshCw
                className={`size-3.5 ${loadingFriends ? "animate-spin" : ""}`}
              />
            </Button>
          )}
        </div>

        {/* Expenses Tab */}
        <TabsContent value={0}>
          {loadingExpenses ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : parsedExpenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Receipt className="size-8 mb-3 opacity-30" />
              <p className="text-[13px]">No expenses found</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              {/* Column headers */}
              <div className="hidden sm:flex items-center gap-3 px-4 h-8 border-b border-border/30 bg-muted/20">
                <span className="w-5 shrink-0" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 flex-1 min-w-0">Name</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-20 shrink-0">Category</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-24 text-right shrink-0">Date</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-24 text-right shrink-0">Amount</span>
              </div>

              {/* Select all */}
              {pageSelectableExpenses.length > 0 && (
                <div className="flex items-center gap-3 px-4 h-8 border-b border-border/30 bg-muted/10">
                  <Checkbox
                    checked={pageSelectableExpenses.length > 0 && pageSelectableExpenses.every((e) => selectedIds.has(e.splitwiseId))}
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="text-[11px] text-muted-foreground">
                    Select all ({pageSelectableExpenses.length})
                  </span>
                </div>
              )}

              {/* Expense list */}
              <div className="divide-y divide-border/30">
                {paginatedExpenses.map((expense) => {
                  const alreadyImported = importedIds.has(expense.splitwiseId);
                  return (
                    <div
                      key={expense.splitwiseId}
                      className={`flex items-center gap-3 px-4 h-10 transition-colors ${
                        alreadyImported
                          ? "opacity-50 bg-muted/20"
                          : "hover:bg-muted/40"
                      }`}
                    >
                      <Checkbox
                        checked={selectedIds.has(expense.splitwiseId)}
                        onCheckedChange={() => toggleSelect(expense.splitwiseId)}
                        disabled={alreadyImported}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[13px] font-medium truncate">
                            {expense.name}
                          </p>
                          <p className="text-[13px] tabular-nums font-medium shrink-0">
                            {formatCurrency(expense.amount)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-0.5 sm:hidden">
                          <span className="text-[11px] text-muted-foreground">
                            {expense.category}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {alreadyImported
                              ? "Already imported"
                              : formatDate(expense.date)}
                          </span>
                        </div>
                      </div>
                      {/* Desktop columns */}
                      <span className="hidden sm:block text-[12px] text-muted-foreground w-20 truncate shrink-0">
                        {expense.category}
                      </span>
                      <span className="hidden sm:block text-[12px] text-muted-foreground w-24 text-right shrink-0 tabular-nums">
                        {alreadyImported
                          ? "Imported"
                          : formatDate(expense.date)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="px-4 pb-3">
                <Pagination
                  currentPage={expensePage}
                  totalPages={expenseTotalPages}
                  onPageChange={setExpensePage}
                  totalItems={expenseTotalItems}
                  pageSize={expensePageSize}
                />
              </div>
            </div>
          )}
        </TabsContent>

        {/* Balances Tab */}
        <TabsContent value={1}>
          {loadingFriends ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : friends.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="size-8 mb-3 opacity-30" />
              <p className="text-[13px]">No friends found</p>
            </div>
          ) : (
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
          )}
        </TabsContent>
      </Tabs>

      {/* Disconnect Confirmation Dialog */}
      <Dialog open={disconnectOpen} onOpenChange={setDisconnectOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-base font-heading font-semibold">Disconnect Splitwise</DialogTitle>
            <DialogDescription>
              This will remove your Splitwise API key. Previously imported
              transactions will not be affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisconnectOpen(false)}>
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
