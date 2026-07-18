"use client";

import * as React from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/page-header";
import { PaginationBar } from "@/components/admin/pagination-bar";
import { StatCard } from "@/components/admin/stat-card";
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
import type { PaymentItem } from "@/types/admin";
import type { PaginationMeta } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckCircle2, Clock, DollarSign, XCircle } from "lucide-react";

export default function PaymentsPage() {
  const [items, setItems] = React.useState<PaymentItem[]>([]);
  const [summary, setSummary] = React.useState<Record<string, { count: number; amount: number }>>({});
  const [meta, setMeta] = React.useState<PaginationMeta | undefined>();
  const [status, setStatus] = React.useState<string>("");
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    adminApi
      .getPayments({ page, status: status || undefined })
      .then((res) => {
        setItems(res.items);
        setSummary(res.summary || {});
        setMeta(res.meta);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [page, status]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Payment history, failed payments, and revenue"
        actions={
          <div className="flex gap-2">
            {["", "succeeded", "failed", "pending", "refunded"].map((s) => (
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Succeeded"
          value={formatCurrency(summary.succeeded?.amount || 0)}
          icon={DollarSign}
          hint={`${summary.succeeded?.count || 0} payments`}
        />
        <StatCard title="Failed" value={summary.failed?.count || 0} icon={XCircle} />
        <StatCard title="Pending" value={summary.pending?.count || 0} icon={Clock} />
        <StatCard title="Refunded" value={summary.refunded?.count || 0} icon={CheckCircle2} />
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workspace</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Gateway</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((p) => (
                <TableRow key={p._id}>
                  <TableCell>{p.workspace?.name || "—"}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(p.amount)} {p.currency}
                  </TableCell>
                  <TableCell className="capitalize">{p.gateway}</TableCell>
                  <TableCell className="capitalize">{p.plan || "—"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        p.status === "succeeded"
                          ? "success"
                          : p.status === "failed"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(p.createdAt)}</TableCell>
                </TableRow>
              ))}
              {!items.length && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No payments found.
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
