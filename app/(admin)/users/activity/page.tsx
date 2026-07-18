"use client";

import * as React from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/page-header";
import { PaginationBar } from "@/components/admin/pagination-bar";
import { Badge } from "@/components/ui/badge";
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
import type { AuditLogItem } from "@/types/admin";
import type { PaginationMeta } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function UserActivityPage() {
  const [items, setItems] = React.useState<AuditLogItem[]>([]);
  const [meta, setMeta] = React.useState<PaginationMeta | undefined>();
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    adminApi
      .getUserActivity({ page })
      .then((res) => {
        setItems(res.items);
        setMeta(res.meta);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="space-y-6">
      <PageHeader title="User Activity" description="Login events and admin user actions" />
      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((log) => (
                <TableRow key={log._id}>
                  <TableCell>
                    <Badge variant="outline">{log.event}</Badge>
                  </TableCell>
                  <TableCell>
                    {log.user ? `${log.user.firstName} ${log.user.lastName}` : "—"}
                    {log.user?.email ? (
                      <p className="text-xs text-muted-foreground">{log.user.email}</p>
                    ) : null}
                  </TableCell>
                  <TableCell className="max-w-md truncate">{log.description || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{log.ipAddress || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(log.createdAt)}</TableCell>
                </TableRow>
              ))}
              {!items.length && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    No activity yet.
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
