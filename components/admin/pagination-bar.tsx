"use client";

import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/lib/api";

export function PaginationBar({
  meta,
  onPageChange,
}: {
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
}) {
  if (!meta || meta.total <= meta.limit) return null;
  const totalPages = meta.totalPages || Math.ceil(meta.total / meta.limit);

  return (
    <div className="flex items-center justify-between gap-3 pt-2">
      <p className="text-sm text-muted-foreground">
        Page {meta.page} of {totalPages} · {meta.total} total
      </p>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
        >
          Previous
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={meta.page >= totalPages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
