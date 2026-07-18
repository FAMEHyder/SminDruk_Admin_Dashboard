"use client";

import * as React from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/page-header";
import { PaginationBar } from "@/components/admin/pagination-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const EVENTS = [
  "",
  "user_login",
  "user_login_failed",
  "admin_action",
  "cron_job_run",
  "payment_processed",
  "subscription_changed",
  "error",
];

export default function AuditLogsPage() {
  const [items, setItems] = React.useState<AuditLogItem[]>([]);
  const [meta, setMeta] = React.useState<PaginationMeta | undefined>();
  const [event, setEvent] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    adminApi
      .getLogs({ page, event: event || undefined })
      .then((res) => {
        setItems(res.items);
        setMeta(res.meta);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [page, event]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Admin actions, logins, payments, and scheduler events"
        actions={
          <div className="flex flex-wrap gap-1">
            {EVENTS.map((e) => (
              <Button
                key={e || "all"}
                size="sm"
                variant={event === e ? "default" : "outline"}
                onClick={() => {
                  setEvent(e);
                  setPage(1);
                }}
              >
                {e || "All"}
              </Button>
            ))}
          </div>
        }
      />

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
                  </TableCell>
                  <TableCell className="max-w-md truncate">{log.description || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{log.ipAddress || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(log.createdAt)}</TableCell>
                </TableRow>
              ))}
              {!items.length && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    No logs found.
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
