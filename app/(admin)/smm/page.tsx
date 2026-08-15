"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CircleDollarSign, ListOrdered, PackageCheck, Store } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/services";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

type Overview = Awaited<ReturnType<typeof adminApi.getSmmOverview>>;
type ProviderBalance = Awaited<ReturnType<typeof adminApi.getSmmProviderBalances>>[number];

export default function GrowthAdminOverviewPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [providerBalances, setProviderBalances] = useState<ProviderBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [overview, balances] = await Promise.all([adminApi.getSmmOverview(), adminApi.getSmmProviderBalances()]);
      setData(overview);
      setProviderBalances(balances);
    }
    catch (error) { toast.error(error instanceof Error ? error.message : "Could not load Growth Services."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  if (loading || !data) return <div className="space-y-6"><Skeleton className="h-9 w-64" /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{[1,2,3,4,5,6].map((item) => <Skeleton key={item} className="h-28" />)}</div></div>;
  const { stats } = data;
  return <div className="space-y-6">
    <PageHeader title="Growth Services" description="Marketplace health, service availability, customer orders, and wallet liability." actions={<Button asChild><Link href="/smm/services">Manage services</Link></Button>} />
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Active Services" value={stats.activeServices} icon={Store} hint={`${stats.categories} categories`} />
      <StatCard title="Total Orders" value={stats.totalOrders} icon={ListOrdered} />
      <StatCard title="Pending Orders" value={stats.pendingOrders} icon={PackageCheck} />
      <StatCard title="Completed Orders" value={stats.completedOrders} icon={PackageCheck} />
      <StatCard title="Sales" value={formatCurrency(stats.totalSales)} icon={CircleDollarSign} />
      <StatCard title="Wallet Liability" value={formatCurrency(stats.walletLiability)} icon={CircleDollarSign} hint="Customer wallet balances" />
    </div>
    <section className="rounded-xl border bg-card p-5">
      <div><h2 className="font-semibold">Provider wallets</h2><p className="text-sm text-muted-foreground">Your available balances at each provider. Customer wallet funds are shown separately above.</p></div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">{providerBalances.map((provider) => <div key={provider.id} className="rounded-lg border p-4"><div className="flex items-center justify-between"><p className="font-medium">{provider.name}</p><span className={`text-xs ${provider.connected ? "text-emerald-600" : "text-destructive"}`}>{provider.connected ? "Connected" : "Unavailable"}</span></div><p className="mt-3 text-2xl font-bold">{provider.connected ? new Intl.NumberFormat(undefined, { style: "currency", currency: provider.currency }).format(provider.available) : "—"}</p></div>)}</div>
    </section>
    <div className="rounded-xl border bg-card p-5"><h2 className="font-semibold">Catalog workflow</h2><p className="mt-2 text-sm text-muted-foreground">Sync SMMZIO services, review packages, then enable only approved services. Customer orders are tracked from the Growth Services dashboard.</p><Button asChild variant="outline" className="mt-4"><Link href="/smm/services">Open service catalog</Link></Button></div>
  </div>;
}
