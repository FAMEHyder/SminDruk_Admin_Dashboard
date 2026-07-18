"use client";

import * as React from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/page-header";
import { PaginationBar } from "@/components/admin/pagination-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { WorkspaceItem } from "@/types/admin";
import type { PaginationMeta } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function WorkspacesPage() {
  const [items, setItems] = React.useState<WorkspaceItem[]>([]);
  const [meta, setMeta] = React.useState<PaginationMeta | undefined>();
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getWorkspaces({ page, search: debounced || undefined });
      setItems(res.items);
      setMeta(res.meta);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [page, debounced]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workspaces"
        description="View, suspend, and delete workspaces"
        actions={
          <Input
            placeholder="Search workspaces..."
            className="w-64"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        }
      />

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((ws) => (
                <TableRow key={ws._id}>
                  <TableCell>
                    <p className="font-medium">{ws.name}</p>
                    <p className="text-xs text-muted-foreground">{ws.slug}</p>
                  </TableCell>
                  <TableCell>
                    {ws.owner ? `${ws.owner.firstName} ${ws.owner.lastName}` : "—"}
                    <p className="text-xs text-muted-foreground">{ws.owner?.email}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {ws.plan}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {ws.stats?.posts ?? 0} posts · {ws.stats?.accounts ?? 0} accounts ·{" "}
                    {ws.stats?.pages ?? 0} pages
                  </TableCell>
                  <TableCell>
                    <Badge variant={ws.isActive ? "success" : "destructive"}>
                      {ws.isActive ? "Active" : "Suspended"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(ws.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === ws._id}
                        onClick={async () => {
                          setBusyId(ws._id);
                          try {
                            await adminApi.updateWorkspace(ws._id, { isActive: !ws.isActive });
                            toast.success(ws.isActive ? "Workspace suspended" : "Workspace activated");
                            await load();
                          } catch (err) {
                            toast.error(err instanceof Error ? err.message : "Failed");
                          } finally {
                            setBusyId(null);
                          }
                        }}
                      >
                        {ws.isActive ? "Suspend" : "Activate"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={busyId === ws._id}
                        onClick={async () => {
                          if (!confirm(`Delete workspace "${ws.name}"?`)) return;
                          setBusyId(ws._id);
                          try {
                            await adminApi.deleteWorkspace(ws._id);
                            toast.success("Workspace deleted");
                            await load();
                          } catch (err) {
                            toast.error(err instanceof Error ? err.message : "Failed");
                          } finally {
                            setBusyId(null);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!items.length && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    No workspaces found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <PaginationBar meta={meta} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
