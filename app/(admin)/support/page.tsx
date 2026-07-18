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
import type { SupportTicket } from "@/types/admin";
import type { PaginationMeta } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function SupportPage() {
  const [items, setItems] = React.useState<SupportTicket[]>([]);
  const [meta, setMeta] = React.useState<PaginationMeta | undefined>();
  const [status, setStatus] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSupport({ page, status: status || undefined });
      setItems(res.items);
      setMeta(res.meta);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support"
        description="Contact messages and support tickets"
        actions={
          <div className="flex gap-2">
            {["", "new", "in_progress", "resolved"].map((s) => (
              <Button
                key={s || "all"}
                size="sm"
                variant={status === s ? "default" : "outline"}
                onClick={() => {
                  setStatus(s);
                  setPage(1);
                }}
              >
                {s || "All"}
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
                <TableHead>From</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Subject / Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((ticket) => (
                <TableRow key={ticket._id}>
                  <TableCell>
                    <p className="font-medium">{ticket.name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{ticket.email}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{ticket.type}</Badge>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="font-medium">{ticket.subject || "—"}</p>
                    <p className="truncate text-sm text-muted-foreground">{ticket.message}</p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        ticket.status === "resolved"
                          ? "success"
                          : ticket.status === "new"
                            ? "warning"
                            : "secondary"
                      }
                    >
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(ticket.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {ticket.status !== "in_progress" && ticket.status !== "resolved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            await adminApi.updateSupport(ticket._id, "in_progress");
                            toast.success("Marked in progress");
                            load();
                          }}
                        >
                          In Progress
                        </Button>
                      )}
                      {ticket.status !== "resolved" && (
                        <Button
                          size="sm"
                          onClick={async () => {
                            await adminApi.updateSupport(ticket._id, "resolved");
                            toast.success("Resolved");
                            load();
                          }}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!items.length && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No tickets found.
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
