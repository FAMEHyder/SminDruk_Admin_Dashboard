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
import type { MediaItem } from "@/types/admin";
import type { PaginationMeta } from "@/lib/api";
import { formatDate, formatNumber } from "@/lib/utils";

export default function MediaPage() {
  const [items, setItems] = React.useState<MediaItem[]>([]);
  const [byType, setByType] = React.useState<Record<string, number>>({});
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
      const res = await adminApi.getMedia({ page, search: debounced || undefined });
      setItems(res.items);
      setByType(res.byType || {});
      setMeta(res.meta);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, [page, debounced]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media Library"
        description={`Images: ${formatNumber(byType.image || 0)} · Videos: ${formatNumber(byType.video || 0)}`}
        actions={
          <Input
            placeholder="Search filename..."
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
                <TableHead>Preview</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Workspace</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((media) => (
                <TableRow key={media._id}>
                  <TableCell>
                    {media.fileType === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={media.url} alt="" className="size-10 rounded object-cover" />
                    ) : (
                      <Badge variant="secondary">Video</Badge>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs truncate font-medium">{media.fileName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{media.fileType}</Badge>
                  </TableCell>
                  <TableCell>{media.workspace?.name || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(media.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <a
                        href={media.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-8 items-center rounded-lg border border-border px-2.5 text-xs hover:bg-muted"
                      >
                        Open
                      </a>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={async () => {
                          if (!confirm("Delete this media?")) return;
                          try {
                            await adminApi.deleteMedia(media._id);
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
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No media found.
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
