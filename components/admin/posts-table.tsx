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
import type { PostItem } from "@/types/admin";
import type { PaginationMeta } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { CheckCircle2, Clock, Eye, Loader2, Trash2, X, XCircle } from "lucide-react";

const STATUS_MAP: Record<string, string | undefined> = {
  "pending-approval": "pending_approval",
  published: "published",
  scheduled: "scheduled",
  drafts: "draft",
  failed: "failed",
  rejected: "rejected",
};

export function PostsTable({ statusSlug }: { statusSlug?: string }) {
  const [selectedStatus, setSelectedStatus] = React.useState<string | undefined>(
    statusSlug ? STATUS_MAP[statusSlug] : undefined
  );

  React.useEffect(() => {
    if (statusSlug) {
      setSelectedStatus(STATUS_MAP[statusSlug]);
    }
  }, [statusSlug]);

  const title =
    selectedStatus === "pending_approval"
      ? "Pending Approval Posts"
      : selectedStatus === "rejected"
        ? "Rejected Posts"
        : selectedStatus === "published"
          ? "Published Posts"
          : selectedStatus === "scheduled"
            ? "Scheduled Posts"
            : selectedStatus === "draft"
              ? "Draft Posts"
              : selectedStatus === "failed"
                ? "Failed Posts"
                : "All Posts";

  const [items, setItems] = React.useState<PostItem[]>([]);
  const [meta, setMeta] = React.useState<PaginationMeta | undefined>();
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  // Modal states
  const [viewPost, setViewPost] = React.useState<PostItem | null>(null);
  const [rejectingPost, setRejectingPost] = React.useState<PostItem | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState("");
  const [processingId, setProcessingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPosts({
        page,
        status: selectedStatus,
        search: debounced || undefined,
      });
      setItems(res.items);
      setMeta(res.meta);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, [page, selectedStatus, debounced]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleApprove(post: PostItem) {
    if (!confirm("Are you sure you want to approve this bulk post? It will be published or scheduled.")) return;
    setProcessingId(post._id);
    try {
      await adminApi.reviewPost(post._id, { decision: "approve" });
      toast.success("Post approved successfully!");
      if (viewPost?._id === post._id) setViewPost(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Approval failed");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleConfirmReject() {
    if (!rejectingPost) return;
    const reason = rejectionReason.trim();
    if (!reason) {
      toast.error("Please enter a rejection reason (Wajah).");
      return;
    }
    setProcessingId(rejectingPost._id);
    try {
      await adminApi.reviewPost(rejectingPost._id, { decision: "reject", rejectionReason: reason });
      toast.success("Post rejected and user notified with reason!");
      setRejectingPost(null);
      setRejectionReason("");
      if (viewPost?._id === rejectingPost._id) setViewPost(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Rejection failed");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description="Platform-wide post management and admin review center"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search content..."
              className="w-56"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b pb-3">
        {[
          { label: "All", value: undefined },
          { label: "Pending Approval", value: "pending_approval" },
          { label: "Published", value: "published" },
          { label: "Scheduled", value: "scheduled" },
          { label: "Drafts", value: "draft" },
          { label: "Failed", value: "failed" },
          { label: "Rejected", value: "rejected" },
        ].map((tab) => (
          <Button
            key={tab.label}
            size="sm"
            variant={selectedStatus === tab.value ? "default" : "outline"}
            className="h-8 text-xs"
            onClick={() => {
              setSelectedStatus(tab.value);
              setPage(1);
            }}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Content</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source / Details</TableHead>
                <TableHead>Workspace</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Schedule / Publish</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((post) => {
                const isPending = post.status === "pending_approval";
                const isRejected = post.status === "rejected";
                const isProcessing = processingId === post._id;

                return (
                  <TableRow key={`${post.source || "post"}-${post._id}`}>
                    <TableCell className="max-w-xs">
                      <p className="line-clamp-2 text-sm font-medium">{post.content || "(empty)"}</p>
                      {post.secretKey && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Key: <code className="bg-muted px-1 py-0.5 rounded font-mono">{post.secretKey}</code>
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          post.status === "published"
                            ? "success"
                            : post.status === "pending_approval"
                              ? "warning"
                              : post.status === "failed" || post.status === "rejected"
                                ? "destructive"
                                : "secondary"
                        }
                      >
                        {post.status === "pending_approval"
                          ? "Pending Approval"
                          : post.status === "rejected"
                            ? "Rejected"
                            : post.status}
                      </Badge>
                      {isRejected && post.rejectionReason && (
                        <p className="mt-1 text-xs text-destructive max-w-xs line-clamp-2">
                          Wajah: {post.rejectionReason}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-foreground">
                          {post.source === "bulk" ? "Bulk Post" : post.source === "page" ? "Page" : "Single Post"}
                        </span>
                        {post.fromPage && post.toPage && (
                          <p>Pages #{post.fromPage} – #{post.toPage}</p>
                        )}
                        {post.category && (
                          <p>Cat: {post.category}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{post.workspace?.name || "—"}</TableCell>
                    <TableCell>
                      {post.createdBy ? (
                        <div>
                          <p className="text-xs font-medium text-foreground">
                            {post.createdBy.firstName} {post.createdBy.lastName}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{post.createdBy.email}</p>
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(post.publishedAt || post.scheduledAt || post.createdAt)}
                      {post.failureReason ? (
                        <p className="text-xs text-destructive">{post.failureReason}</p>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-xs"
                          onClick={() => setViewPost(post)}
                        >
                          <Eye className="size-3.5 mr-1" /> View
                        </Button>

                        {isPending && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                              disabled={isProcessing}
                              onClick={() => handleApprove(post)}
                            >
                              {isProcessing ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="size-3.5 mr-1" />
                              )}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8 px-2.5 text-xs"
                              disabled={isProcessing}
                              onClick={() => setRejectingPost(post)}
                            >
                              <XCircle className="size-3.5 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
                          onClick={async () => {
                            if (!confirm("Delete this post record?")) return;
                            try {
                              await adminApi.deletePost(post._id);
                              toast.success("Post deleted");
                              await load();
                            } catch (err) {
                              toast.error(err instanceof Error ? err.message : "Delete failed");
                            }
                          }}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!items.length && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    No posts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <PaginationBar meta={meta} onPageChange={setPage} />
        </>
      )}

      {/* View Post Details Modal */}
      {viewPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">Post Details</h3>
                <p className="text-xs text-muted-foreground">ID: {viewPost._id}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setViewPost(null)} className="size-8">
                <X className="size-4" />
              </Button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <span className="text-xs font-semibold text-muted-foreground">Status</span>
                <div className="mt-1">
                  <Badge
                    variant={
                      viewPost.status === "published"
                        ? "success"
                        : viewPost.status === "pending_approval"
                          ? "warning"
                          : viewPost.status === "failed" || viewPost.status === "rejected"
                            ? "destructive"
                            : "secondary"
                    }
                  >
                    {viewPost.status === "pending_approval" ? "Pending Approval" : viewPost.status}
                  </Badge>
                </div>
              </div>

              {viewPost.status === "rejected" && viewPost.rejectionReason && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 space-y-1">
                  <p className="text-xs font-bold text-destructive">Rejection Reason (Wajah):</p>
                  <p className="text-sm text-foreground">{viewPost.rejectionReason}</p>
                </div>
              )}

              <div>
                <span className="text-xs font-semibold text-muted-foreground">Content / Caption</span>
                <p className="mt-1 text-sm whitespace-pre-wrap rounded-xl border border-border bg-muted/40 p-3">
                  {viewPost.content || "(No text content)"}
                </p>
              </div>

              {viewPost.media && viewPost.media.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-muted-foreground">Attached Media</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {viewPost.media.map((m, idx) => (
                      <div key={idx} className="relative rounded-lg border overflow-hidden size-24 bg-muted">
                        {m.fileType === "video" ? (
                          <video src={m.url} className="size-full object-cover" controls />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.url} alt="" className="size-full object-cover" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                {viewPost.secretKey && (
                  <div className="rounded-lg border p-2 bg-muted/20">
                    <span className="text-muted-foreground block">Secret Key</span>
                    <span className="font-mono font-medium">{viewPost.secretKey}</span>
                  </div>
                )}
                {viewPost.fromPage && viewPost.toPage && (
                  <div className="rounded-lg border p-2 bg-muted/20">
                    <span className="text-muted-foreground block">Page Range</span>
                    <span className="font-medium">Pages #{viewPost.fromPage} – #{viewPost.toPage}</span>
                  </div>
                )}
                {viewPost.category && (
                  <div className="rounded-lg border p-2 bg-muted/20">
                    <span className="text-muted-foreground block">Category</span>
                    <span className="font-medium">{viewPost.category}</span>
                  </div>
                )}
                <div className="rounded-lg border p-2 bg-muted/20">
                  <span className="text-muted-foreground block">Workspace</span>
                  <span className="font-medium">{viewPost.workspace?.name || "—"}</span>
                </div>
                <div className="rounded-lg border p-2 bg-muted/20 col-span-2">
                  <span className="text-muted-foreground block">Author</span>
                  <span className="font-medium">
                    {viewPost.createdBy
                      ? `${viewPost.createdBy.firstName} ${viewPost.createdBy.lastName} (${viewPost.createdBy.email})`
                      : "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t pt-3">
              {viewPost.status === "pending_approval" && (
                <>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={processingId === viewPost._id}
                    onClick={() => handleApprove(viewPost)}
                  >
                    <CheckCircle2 className="size-4 mr-1.5" /> Approve Post
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={processingId === viewPost._id}
                    onClick={() => {
                      setRejectingPost(viewPost);
                    }}
                  >
                    <XCircle className="size-4 mr-1.5" /> Reject Post
                  </Button>
                </>
              )}
              <Button size="sm" variant="outline" onClick={() => setViewPost(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal with Reason (Wajah) */}
      {rejectingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-destructive/30 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-destructive">
                <XCircle className="size-5" />
                <h3 className="text-lg font-bold">Reject Post</h3>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  setRejectingPost(null);
                  setRejectionReason("");
                }}
                className="size-8"
              >
                <X className="size-4" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Please enter the reason for rejecting this post. This reason will be saved and sent directly to the user as a notification.
            </p>

            <div className="space-y-1.5">
              <label htmlFor="rejection-reason" className="text-xs font-semibold text-foreground">
                Rejection Reason (Wajah) <span className="text-destructive">*</span>
              </label>
              <textarea
                id="rejection-reason"
                className="w-full min-h-[100px] rounded-xl border border-input bg-background p-3 text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="e.g. Inappropriate content, violating terms of service, or incomplete details..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRejectingPost(null);
                  setRejectionReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={!rejectionReason.trim() || processingId === rejectingPost._id}
                onClick={handleConfirmReject}
              >
                {processingId === rejectingPost._id ? (
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                ) : (
                  <XCircle className="size-3.5 mr-1.5" />
                )}
                Confirm Rejection & Notify User
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
