"use client";

import * as React from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/page-header";
import { PaginationBar } from "@/components/admin/pagination-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { NotificationItem } from "@/types/admin";
import type { PaginationMeta } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function NotificationsPage() {
  const [items, setItems] = React.useState<NotificationItem[]>([]);
  const [meta, setMeta] = React.useState<PaginationMeta | undefined>();
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [title, setTitle] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [sending, setSending] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getNotifications({ page });
      setItems(res.items);
      setMeta(res.meta);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, [page]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function broadcast(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const res = await adminApi.broadcastNotification({ title, message });
      toast.success(`Broadcast sent to ${res.sent} users`);
      setTitle("");
      setMessage("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Broadcast failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description="Broadcast and notification history" />

      <Card>
        <CardHeader>
          <CardTitle>Broadcast Notification</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={broadcast} className="grid gap-3">
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              className="min-h-24 rounded-lg border border-input bg-transparent px-3 py-2 text-sm dark:bg-input/30"
              placeholder="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
            <Button type="submit" disabled={sending} className="w-fit">
              {sending ? "Sending..." : "Send to All Active Users"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Read</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((n) => (
                <TableRow key={n._id}>
                  <TableCell>
                    <p className="font-medium">{n.title}</p>
                    <p className="max-w-md truncate text-xs text-muted-foreground">{n.message}</p>
                  </TableCell>
                  <TableCell>
                    {n.user ? `${n.user.firstName} ${n.user.lastName}` : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{n.type}</Badge>
                  </TableCell>
                  <TableCell>{n.channel}</TableCell>
                  <TableCell>
                    <Badge variant={n.isRead ? "secondary" : "warning"}>
                      {n.isRead ? "Read" : "Unread"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(n.createdAt)}</TableCell>
                </TableRow>
              ))}
              {!items.length && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No notifications yet.
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
