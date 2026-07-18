"use client";

import * as React from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/page-header";
import { PaginationBar } from "@/components/admin/pagination-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { PlanItem, SubscriptionItem } from "@/types/admin";
import type { PaginationMeta } from "@/lib/api";
import { formatDate, formatNumber } from "@/lib/utils";

export default function SubscriptionsPage() {
  const [plans, setPlans] = React.useState<PlanItem[]>([]);
  const [items, setItems] = React.useState<SubscriptionItem[]>([]);
  const [meta, setMeta] = React.useState<PaginationMeta | undefined>();
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [planRes, subRes] = await Promise.all([
        adminApi.getPlans(),
        adminApi.getSubscriptions({ page }),
      ]);
      setPlans(planRes);
      setItems(subRes.items);
      setMeta(subRes.meta);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [page]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <PageHeader title="Subscriptions" description="Plans and active workspace subscriptions" />

      {loading && !plans.length ? (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader className="pb-2">
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  {formatNumber(plan.activeSubscriptions)} active
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 text-xs text-muted-foreground">
                <p>Accounts: {plan.limits.socialAccounts}</p>
                <p>Posts/mo: {plan.limits.postsPerMonth}</p>
                <p>Team: {plan.limits.teamMembers}</p>
                <p>Storage: {plan.limits.storageGB} GB</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workspace</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Billing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((sub) => (
                <TableRow key={sub._id}>
                  <TableCell>{sub.workspace?.name || "—"}</TableCell>
                  <TableCell className="capitalize">{sub.plan}</TableCell>
                  <TableCell className="capitalize">{sub.billingCycle}</TableCell>
                  <TableCell>
                    <Badge variant={sub.status === "active" ? "success" : "secondary"}>
                      {sub.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(sub.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {["free", "starter", "professional", "agency", "enterprise"].map((plan) => (
                        <Button
                          key={plan}
                          size="sm"
                          variant="outline"
                          disabled={sub.plan === plan}
                          onClick={async () => {
                            try {
                              await adminApi.updateSubscription(sub._id, { plan });
                              toast.success(`Plan set to ${plan}`);
                              await load();
                            } catch (err) {
                              toast.error(err instanceof Error ? err.message : "Failed");
                            }
                          }}
                        >
                          {plan}
                        </Button>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!items.length && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No subscriptions found.
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
