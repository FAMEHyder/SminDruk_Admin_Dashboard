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
import type { AdminUser } from "@/types/admin";
import type { PaginationMeta } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function UsersPage() {
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [meta, setMeta] = React.useState<PaginationMeta | undefined>();
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({ page, search: debounced || undefined });
      setUsers(res.items);
      setMeta(res.meta);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, debounced]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function withBusy(id: string, fn: () => Promise<void>) {
    setBusyId(id);
    try {
      await fn();
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Users"
        description="Search, suspend, verify, and manage platform users"
        actions={
          <Input
            placeholder="Search name or email..."
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
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.email}
                      {user.isEmailVerified ? (
                        <Badge variant="success">Verified</Badge>
                      ) : (
                        <Badge variant="warning">Unverified</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "success" : "destructive"}>
                      {user.isActive ? "Active" : "Suspended"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === user._id}
                        onClick={() =>
                          withBusy(user._id, async () => {
                            await adminApi.updateUserStatus(user._id, !user.isActive);
                            toast.success(user.isActive ? "User suspended" : "User activated");
                          })
                        }
                      >
                        {user.isActive ? "Suspend" : "Activate"}
                      </Button>
                      {!user.isEmailVerified && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busyId === user._id}
                          onClick={() =>
                            withBusy(user._id, async () => {
                              await adminApi.verifyUserEmail(user._id);
                              toast.success("Email verified");
                            })
                          }
                        >
                          Verify
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === user._id}
                        onClick={() =>
                          withBusy(user._id, async () => {
                            const res = await adminApi.resetUserPassword(user._id);
                            toast.success(`Temp password: ${res.temporaryPassword}`);
                          })
                        }
                      >
                        Reset PW
                      </Button>
                      {user.role !== "superadmin" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={busyId === user._id}
                          onClick={() => {
                            if (!confirm(`Delete ${user.email}?`)) return;
                            withBusy(user._id, async () => {
                              await adminApi.deleteUser(user._id);
                              toast.success("User deleted");
                            });
                          }}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!users.length && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No users found.
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
