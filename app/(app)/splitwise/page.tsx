"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Timestamp } from "firebase/firestore";
import { toast } from "sonner";
import { Loader2, RefreshCw, Download, Receipt, Users } from "lucide-react";

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

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { usePagination } from "@/components/shared/pagination";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

import { ConnectForm } from "@/components/splitwise/connect-form";
import { SplitwiseHeader } from "@/components/splitwise/splitwise-header";
import { ExpenseTable } from "@/components/splitwise/expense-table";
import { BalanceList } from "@/components/splitwise/balance-list";

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
// Page
// ---------------------------------------------------------------------------

export default function SplitwisePage() {
  const { user } = useAuth();
  const { userFirestore } = useFirebase();

  // Connection state
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{
    first_name: string;
    last_name: string;
    id: number;
  } | null>(null);

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
    return () => {
      cancelled = true;
    };
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
      void err;
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
      void err;
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

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const {
    paginatedItems: paginatedExpenses,
    currentPage: expensePage,
    totalPages: expenseTotalPages,
    setCurrentPage: setExpensePage,
    totalItems: expenseTotalItems,
    pageSize: expensePageSize,
  } = usePagination(parsedExpenses, 20);

  const pageSelectableExpenses = useMemo(
    () => paginatedExpenses.filter((e) => !importedIds.has(e.splitwiseId)),
    [paginatedExpenses, importedIds]
  );

  const toggleSelectAll = useCallback(() => {
    if (
      pageSelectableExpenses.length > 0 &&
      pageSelectableExpenses.every((e) => selectedIds.has(e.splitwiseId))
    ) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(
        new Set(pageSelectableExpenses.map((e) => e.splitwiseId))
      );
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
      void err;
    } finally {
      setImporting(false);
    }
  }, [user, userFirestore, selectedIds, parsedExpenses]);

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

  if (initialLoading) {
    return <LoadingSpinner />;
  }

  // ---------------------------------------------------------------------------
  // Not connected
  // ---------------------------------------------------------------------------

  if (!apiKey || !currentUser) {
    return (
      <ConnectForm
        apiKeyInput={apiKeyInput}
        onApiKeyInputChange={setApiKeyInput}
        connecting={connecting}
        onConnect={handleConnect}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // Connected
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-4 animate-stagger-in stagger-1">
      <SplitwiseHeader
        firstName={currentUser.first_name}
        lastName={currentUser.last_name}
        onDisconnectClick={() => setDisconnectOpen(true)}
      />

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

        <TabsContent value={0}>
          <ExpenseTable
            loading={loadingExpenses}
            parsedExpenses={parsedExpenses}
            paginatedExpenses={paginatedExpenses}
            importedIds={importedIds}
            selectedIds={selectedIds}
            pageSelectableExpenses={pageSelectableExpenses}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            currentPage={expensePage}
            totalPages={expenseTotalPages}
            totalItems={expenseTotalItems}
            pageSize={expensePageSize}
            onPageChange={setExpensePage}
          />
        </TabsContent>

        <TabsContent value={1}>
          <BalanceList loading={loadingFriends} friends={friends} />
        </TabsContent>
      </Tabs>

      {/* Disconnect Confirmation Dialog */}
      <Dialog open={disconnectOpen} onOpenChange={setDisconnectOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-base font-heading font-semibold">
              Disconnect Splitwise
            </DialogTitle>
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
