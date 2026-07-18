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
import type { BlogItem } from "@/types/admin";
import type { PaginationMeta } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function BlogsPage() {
  const [items, setItems] = React.useState<BlogItem[]>([]);
  const [meta, setMeta] = React.useState<PaginationMeta | undefined>();
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [title, setTitle] = React.useState("");
  const [excerpt, setExcerpt] = React.useState("");
  const [content, setContent] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getBlogs({ page });
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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await adminApi.createBlog({ title, excerpt, content, category: "General" });
      toast.success("Blog draft created");
      setTitle("");
      setExcerpt("");
      setContent("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Create failed");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Blogs" description="Create, publish, and delete blog posts" />

      <Card>
        <CardHeader>
          <CardTitle>Create Blog</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid gap-3 md:grid-cols-2">
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Input
              placeholder="Excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
            <textarea
              className="min-h-24 rounded-lg border border-input bg-transparent px-3 py-2 text-sm md:col-span-2 dark:bg-input/30"
              placeholder="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            <Button type="submit" disabled={creating} className="md:col-span-2 w-fit">
              {creating ? "Creating..." : "Create Draft"}
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
                <TableHead>Status</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((blog) => (
                <TableRow key={blog._id}>
                  <TableCell>
                    <p className="font-medium">{blog.title}</p>
                    <p className="text-xs text-muted-foreground">{blog.slug}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={blog.status === "published" ? "success" : "secondary"}>
                      {blog.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {blog.author
                      ? `${blog.author.firstName} ${blog.author.lastName}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(blog.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {blog.status !== "published" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              await adminApi.publishBlog(blog._id);
                              toast.success("Published");
                              await load();
                            } catch (err) {
                              toast.error(err instanceof Error ? err.message : "Failed");
                            }
                          }}
                        >
                          Publish
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={async () => {
                          if (!confirm("Delete blog?")) return;
                          try {
                            await adminApi.deleteBlog(blog._id);
                            toast.success("Deleted");
                            await load();
                          } catch (err) {
                            toast.error(err instanceof Error ? err.message : "Failed");
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
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    No blogs yet.
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
