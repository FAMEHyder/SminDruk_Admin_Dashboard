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
import type { BlogItem } from "@/types/admin";
import type { PaginationMeta } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { blogCreateSchema, type BlogCreateValues } from "@/lib/validations/admin";

export default function BlogsPage() {
  const [items, setItems] = React.useState<BlogItem[]>([]);
  const [meta, setMeta] = React.useState<PaginationMeta | undefined>();
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BlogCreateValues>({
    resolver: zodResolver(blogCreateSchema),
    defaultValues: { title: "", excerpt: "", content: "" },
    mode: "onBlur",
  });

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

  async function onCreate(values: BlogCreateValues) {
    try {
      await adminApi.createBlog({
        title: values.title,
        excerpt: values.excerpt || "",
        content: values.content,
        category: "General",
      });
      toast.success("Blog draft created");
      reset();
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Create failed");
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
          <form onSubmit={handleSubmit(onCreate)} className="grid gap-3 md:grid-cols-2" noValidate>
            <Field>
              <Input placeholder="Title" aria-invalid={!!errors.title} {...register("title")} />
              <FieldError message={errors.title?.message} />
            </Field>
            <Field>
              <Input placeholder="Excerpt" aria-invalid={!!errors.excerpt} {...register("excerpt")} />
              <FieldError message={errors.excerpt?.message} />
            </Field>
            <Field className="md:col-span-2">
              <textarea
                className="min-h-24 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm dark:bg-input/30 aria-invalid:border-destructive"
                placeholder="Content"
                aria-invalid={!!errors.content}
                {...register("content")}
              />
              <FieldError message={errors.content?.message} />
            </Field>
            <Button type="submit" disabled={isSubmitting} className="md:col-span-2 w-fit">
              {isSubmitting ? "Creating..." : "Create Draft"}
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
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{blog.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {blog.author
                      ? `${blog.author.firstName} ${blog.author.lastName}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(blog.createdAt)}
                  </TableCell>
                  <TableCell className="space-x-2">
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
                        if (!confirm("Delete this blog?")) return;
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
