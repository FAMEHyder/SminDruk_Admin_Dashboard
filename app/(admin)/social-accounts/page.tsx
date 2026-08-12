"use client";

import * as React from "react";
import Image from "next/image";
import { AlertTriangle, Database, RefreshCw, Search, UserCog } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminApi } from "@/lib/services";
import type { SocialAccountItem, SocialAccountsOverview } from "@/types/admin";
import { cn, formatDate, formatNumber } from "@/lib/utils";

const PLATFORM_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  x: "X",
};

function RefreshStatusBadge({ account }: { account: SocialAccountItem }) {
  if (account.refreshStatus === "healthy") {
    return <Badge variant="success">Healthy</Badge>;
  }
  if (account.refreshStatus === "refresh_due") {
    return <Badge variant="warning">Refresh due ({account.daysSinceIssued}d)</Badge>;
  }
  return <Badge variant="destructive">Cron expired ({account.daysSinceIssued}d)</Badge>;
}

function AccountTable({
  accounts,
  type,
  onRefresh,
  refreshingId,
}: {
  accounts: SocialAccountItem[];
  type: "manage" | "dataset";
  onRefresh: (type: "manage" | "dataset", id: string) => void;
  refreshingId: string | null;
}) {
  if (!accounts.length) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No {type === "manage" ? "manage" : "dataset"} accounts found.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Account</TableHead>
          {type === "dataset" && <TableHead>Page #</TableHead>}
          <TableHead>Status</TableHead>
          <TableHead>Token Age</TableHead>
          <TableHead>Last Sync</TableHead>
          <TableHead>Refresh</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {accounts.map((account) => (
          <TableRow key={account._id}>
            <TableCell>
              <div className="flex items-center gap-3">
                {account.avatar ? (
                  <Image
                    src={account.avatar}
                    alt=""
                    width={32}
                    height={32}
                    className="rounded-full"
                    unoptimized
                  />
                ) : (
                  <div className="size-8 rounded-full bg-muted" />
                )}
                <div>
                  <p className="font-medium">{account.name}</p>
                  <p className="text-xs text-muted-foreground">{account.accountId}</p>
                </div>
              </div>
            </TableCell>
            {type === "dataset" && (
              <TableCell>
                <Badge variant="outline">#{account.pageNumber}</Badge>
              </TableCell>
            )}
            <TableCell>
              <Badge variant={account.status === "connected" ? "success" : "secondary"}>
                {account.status}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <RefreshStatusBadge account={account} />
                <p className="text-xs text-muted-foreground">{account.daysSinceIssued} days since issued</p>
              </div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatDate(account.lastSyncedAt)}
            </TableCell>
            <TableCell>
              {account.manualRefreshAvailable ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={refreshingId === account._id}
                  onClick={() => onRefresh(type, account._id)}
                >
                  <RefreshCw className={cn("mr-1 size-3.5", refreshingId === account._id && "animate-spin")} />
                  Refresh
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">Auto OK</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function SocialAccountsPage() {
  const [data, setData] = React.useState<SocialAccountsOverview | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [refreshingId, setRefreshingId] = React.useState<string | null>(null);
  const manageAccountsByPlatform = React.useMemo(() => {
    const groups = new Map<string, SocialAccountItem[]>();
    for (const account of data?.manageAccounts || []) {
      const platform = account.platform || "other";
      groups.set(platform, [...(groups.get(platform) || []), account]);
    }
    return [...groups.entries()];
  }, [data?.manageAccounts]);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminApi.getSocialAccounts({ search: debouncedSearch || undefined });
      setData(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleRefresh(type: "manage" | "dataset", id: string) {
    setRefreshingId(id);
    try {
      const result = await adminApi.refreshToken(type, id);
      toast.success(`Token refreshed — ${result.pagesUpdated}/${result.totalPages} pages updated`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Token refresh failed");
    } finally {
      setRefreshingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Social Accounts</h1>
          <p className="text-sm text-muted-foreground">
            Manage Account vs Dataset Account — token refresh at 45 days
          </p>
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by page name..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading && !data ? (
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Connected</CardDescription>
                <CardTitle className="text-2xl">{formatNumber(data.summary.totalConnected)}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1">
                  <UserCog className="size-3.5" /> Manage Account
                </CardDescription>
                <CardTitle className="text-2xl">{formatNumber(data.summary.totalManageAccounts)}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1">
                  <Database className="size-3.5" /> Dataset Account
                </CardDescription>
                <CardTitle className="text-2xl">{formatNumber(data.summary.totalDatasetAccounts)}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Healthy Tokens</CardDescription>
                <CardTitle className="text-2xl text-emerald-600 dark:text-emerald-400">
                  {formatNumber(data.summary.healthy)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1 text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="size-3.5" /> Refresh Required
                </CardDescription>
                <CardTitle className="text-2xl text-amber-700 dark:text-amber-400">
                  {formatNumber(data.summary.tokenRefreshRequired)}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {data.tokenRefreshRequired.length > 0 && (
            <Card className="border-amber-500/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="size-5" />
                  Token Refresh Required
                </CardTitle>
                <CardDescription>
                  Accounts connected for {data.tokenRefreshPolicy.refreshAfterDays}+ days. Cron retries daily until
                  day {data.tokenRefreshPolicy.cronMaxDays}. Use manual refresh if cron fails.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.tokenRefreshRequired.map((account) => (
                  <div
                    key={account._id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{account.type === "manage" ? "Manage" : "Dataset"}</Badge>
                        <span className="font-medium">{account.name}</span>
                        {account.pageNumber ? (
                          <Badge variant="secondary">Page #{account.pageNumber}</Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {account.daysSinceIssued} days since token issued
                        {account.lastTokenRefreshError ? ` · Last error: ${account.lastTokenRefreshError}` : ""}
                      </p>
                      {account.cronEligible && (
                        <p className="text-xs text-muted-foreground">
                          Cron will retry daily (until day {data.tokenRefreshPolicy.cronMaxDays})
                        </p>
                      )}
                      {account.refreshStatus === "cron_expired" && (
                        <p className="text-xs text-destructive">
                          Cron window expired — manual refresh required
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      disabled={refreshingId === account._id}
                      onClick={() => handleRefresh(account.type, account._id)}
                    >
                      <RefreshCw
                        className={cn("mr-1 size-3.5", refreshingId === account._id && "animate-spin")}
                      />
                      Manual Refresh
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="size-5" />
                Manage Account
              </CardTitle>
              <CardDescription>
                &quot;Just want to manage my account&quot; — used for Create Post in user dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {manageAccountsByPlatform.map(([platform, accounts]) => (
                  <div key={platform}>
                    <div className="mb-3 flex items-center gap-2">
                      <Badge variant="outline">{PLATFORM_LABELS[platform] || platform}</Badge>
                      <span className="text-sm text-muted-foreground">{accounts.length} connected</span>
                    </div>
                    <AccountTable accounts={accounts} type="manage" onRefresh={handleRefresh} refreshingId={refreshingId} />
                  </div>
                ))}
                {!manageAccountsByPlatform.length && <AccountTable accounts={[]} type="manage" onRefresh={handleRefresh} refreshingId={refreshingId} />}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="size-5" />
                Dataset Account
              </CardTitle>
              <CardDescription>Trending dataset pages — used for Bulk Post globally</CardDescription>
            </CardHeader>
            <CardContent>
              <AccountTable
                accounts={data.datasetAccounts}
                type="dataset"
                onRefresh={handleRefresh}
                refreshingId={refreshingId}
              />
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
