"use client";

import * as React from "react";
import { toast } from "sonner";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { PaginationBar } from "@/components/admin/pagination-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminApi } from "@/lib/services";
import type { PaginationMeta } from "@/lib/api";
import type { SmmOrderApprovalItem } from "@/types/admin";

export default function SmmOrderApprovalsPage() {
  const [items, setItems] = React.useState<SmmOrderApprovalItem[]>([]);
  const [meta, setMeta] = React.useState<PaginationMeta | undefined>();
  const [loading, setLoading] = React.useState(true);
  const [reviewingId, setReviewingId] = React.useState<string | null>(null);
  const [preview, setPreview] = React.useState<SmmOrderApprovalItem | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminApi.getSmmOrders({ status: "pending_approval" });
      setItems(result.items);
      setMeta(result.meta);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load payment approvals.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { void load(); }, [load]);

  async function review(id: string, decision: "approve" | "reject") {
    setReviewingId(id);
    try {
      await adminApi.reviewSmmOrderPayment(id, decision);
      toast.success(decision === "approve" ? "Approved. ZIO or Pak has been contacted for delivery." : "Payment request rejected. Provider was not contacted.");
      setPreview((current) => (current?._id === id ? null : current));
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not review payment.");
    } finally {
      setReviewingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Growth Payment Approvals" description="Review the payment screenshot first. Approving is the only step that sends the order to SMMZIO or Pak SMM." />
      {loading ? <Skeleton className="h-72 w-full" /> : (
        <div className="rounded-2xl border border-border bg-card">
          <Table>
            <TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Service</TableHead><TableHead>Amount</TableHead><TableHead>Proof</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
            <TableBody>
              {items.map((order) => (
                <TableRow key={order._id}>
                  <TableCell><p className="font-medium">{order.publicOrderId}</p><p className="max-w-44 truncate text-xs text-muted-foreground">{order.link}</p></TableCell>
                  <TableCell><p>{order.workspace?.name || "—"}</p><p className="text-xs text-muted-foreground">{order.createdBy?.email || ""}</p></TableCell>
                  <TableCell><p>{order.service?.name || "—"}</p><p className="text-xs text-muted-foreground">{order.quantity.toLocaleString()} units</p><Badge variant="secondary" className="mt-1 capitalize">{order.paymentMethod || "manual"}</Badge></TableCell>
                  <TableCell className="font-medium">${order.charge.toFixed(2)} {order.currency}</TableCell>
                  <TableCell>
                    {order.paymentProofUrl ? (
                      <button type="button" onClick={() => setPreview(order)} className="block overflow-hidden rounded-md border">
                        <img src={order.paymentProofUrl} alt={`Payment screenshot for ${order.publicOrderId}`} className="h-14 w-14 object-cover" />
                      </button>
                    ) : "—"}
                  </TableCell>
                  <TableCell><div className="flex gap-2"><Button size="sm" disabled={reviewingId === order._id} onClick={() => void review(order._id, "approve")}><CheckCircle2 /> Approve</Button><Button size="sm" variant="destructive" disabled={reviewingId === order._id} onClick={() => void review(order._id, "reject")}><XCircle /> Reject</Button></div></TableCell>
                </TableRow>
              ))}
              {!items.length && <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground"><Clock3 className="mx-auto mb-2 size-5" />No payment requests awaiting approval.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      )}
      {preview?.paymentProofUrl ? (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">Payment screenshot · {preview.publicOrderId}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{preview.service?.name || "Service"} · {preview.quantity.toLocaleString()} units · ${preview.charge.toFixed(2)} {preview.currency}</p>
              <p className="mt-1 break-all text-xs text-muted-foreground">{preview.link}</p>
              {preview.paymentReference ? <p className="mt-1 text-xs text-muted-foreground">Reference: {preview.paymentReference}</p> : null}
            </div>
            <div className="flex gap-2">
              <Button size="sm" asChild variant="outline"><a href={preview.paymentProofUrl} target="_blank" rel="noreferrer">Open full SS</a></Button>
              <Button size="sm" disabled={reviewingId === preview._id} onClick={() => void review(preview._id, "approve")}><CheckCircle2 /> Approve</Button>
              <Button size="sm" variant="destructive" disabled={reviewingId === preview._id} onClick={() => void review(preview._id, "reject")}><XCircle /> Reject</Button>
            </div>
          </div>
          <img src={preview.paymentProofUrl} alt={`Payment screenshot for ${preview.publicOrderId}`} className="mt-4 max-h-[520px] w-full rounded-xl border object-contain bg-muted" />
        </div>
      ) : null}
      <PaginationBar meta={meta} onPageChange={() => undefined} />
    </div>
  );
}
