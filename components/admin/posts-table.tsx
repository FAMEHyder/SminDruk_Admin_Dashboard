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

const STATUS_MAP: Record<string, string | undefined> = {
  published: "published",
  scheduled: "scheduled",
  drafts: "draft",
  failed: "failed",
};

export function PostsTable({ statusSlug }: { statusSlug?: string }) {
  const status = statusSlug ? STATUS_MAP[statusSlug] : undefined;
  const title =
    statusSlug === "published"
      ? "Published Posts"
      : statusSlug === "scheduled"
        ? "Scheduled Posts"
        : statusSlug === "drafts"
          ? "Draft Posts"
          : statusSlug === "failed"
            ? "Failed Posts"
            : "All Posts";

  const [items, setItems] = React.useState<PostItem[]>([]);
  const [meta, setMeta] = React.useState<PaginationMeta | undefined>();
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPosts({
        page,
        status,
        search: debounced || undefined,
      });
      setItems(res.items);
      setMeta(res.meta);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, [page, status, debounced]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description="Platform-wide post management"
        actions={
          <Input
            placeholder="Search content..."
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
                <TableHead>Content</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Workspace</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Schedule / Publish</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((post) => (
                <TableRow key={`${post.source || "post"}-${post._id}`}>
                  <TableCell className="max-w-xs truncate">{post.content || "(empty)"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        post.status === "published"
                          ? "success"
                          : post.status === "failed"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {post.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {post.source === "bulk" ? "Bulk" : post.source === "page" ? "Page" : "Post"}
                  </TableCell>
                  <TableCell>{post.workspace?.name || "—"}</TableCell>
                  <TableCell>
                    {post.createdBy
                      ? `${post.createdBy.firstName} ${post.createdBy.lastName}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(post.publishedAt || post.scheduledAt || post.createdAt)}
                    {post.failureReason ? (
                      <p className="text-xs text-destructive">{post.failureReason}</p>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        if (!confirm("Delete this post?")) return;
                        try {
                          await adminApi.deletePost(post._id);
                          toast.success("Post deleted");
                          await load();
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Delete failed");
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
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
    </div>
  );
}
