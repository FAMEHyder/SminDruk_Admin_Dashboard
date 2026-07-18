"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/page-header";
import { PaginationBar } from "@/components/admin/pagination-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldError } from "@/components/ui/field";
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
import { broadcastSchema, type BroadcastValues } from "@/lib/validations/admin";

export default function NotificationsPage() {
  const [items, setItems] = React.useState<NotificationItem[]>([]);
  const [meta, setMeta] = React.useState<PaginationMeta | undefined>();
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BroadcastValues>({
    resolver: zodResolver(broadcastSchema),
    defaultValues: { title: "", message: "" },
    mode: "onBlur",
  });

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

  async function onBroadcast(values: BroadcastValues) {
    try {
      const res = await adminApi.broadcastNotification(values);
      toast.success(`Broadcast sent to ${res.sent} users`);
      reset();
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Broadcast failed");
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
          <form onSubmit={handleSubmit(onBroadcast)} className="grid gap-3" noValidate>
            <Field>
              <Input placeholder="Title" aria-invalid={!!errors.title} {...register("title")} />
              <FieldError message={errors.title?.message} />
            </Field>
            <Field>
              <textarea
                className="min-h-24 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm dark:bg-input/30 aria-invalid:border-destructive"
                placeholder="Message"
                aria-invalid={!!errors.message}
                {...register("message")}
              />
              <FieldError message={errors.message?.message} />
            </Field>
            <Button type="submit" disabled={isSubmitting} className="w-fit">
              {isSubmitting ? "Sending..." : "Send to All Active Users"}
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
                <TableHead>Message</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((n) => (
                <TableRow key={n._id}>
                  <TableCell>
                    <p className="font-medium">{n.title}</p>
                  </TableCell>
                  <TableCell>
                    <p className="max-w-md truncate text-xs text-muted-foreground">{n.message}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{n.type}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(n.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {meta && <PaginationBar meta={meta} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}
