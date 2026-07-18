"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex h-screen flex-col gap-4 p-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
