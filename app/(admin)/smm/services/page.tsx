"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminApi } from "@/lib/services";
import type { SmmServiceItem } from "@/types/admin";

const money = (value: number, currency: string) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value);

export default function SmmServicesAdminPage() {
  const searchParams = useSearchParams();
  const provider = searchParams.get("provider") === "paksmmcheap" ? "paksmmcheap" : "smmzio";
  const providerLabel = provider === "smmzio" ? "ZIO" : "Pak";
  const [services, setServices] = useState<SmmServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getSmmServices({ limit: 100, provider });
      setServices(data.items);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load SMM services.");
    } finally {
      setLoading(false);
    }
  }, [provider]);

  useEffect(() => { void load(); }, [load]);

  async function syncProvider(provider: "smmzio" | "pak") {
    setSyncing(true);
    try {
      const result = provider === "smmzio" ? await adminApi.syncSmmZioServices() : await adminApi.syncPakServices();
      toast.success(`${result.imported} ${provider === "smmzio" ? "SMMZIO" : "Pak"} services imported as drafts.`);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "SMMZIO sync failed.");
    } finally {
      setSyncing(false);
    }
  }

  async function toggleService(service: SmmServiceItem) {
    try {
      const next = await adminApi.updateSmmService(service._id, { isActive: !service.isActive });
      setServices((items) => items.map((item) => item._id === next._id ? { ...item, ...next } : item));
      toast.success(next.isActive ? "Service is now visible to customers." : "Service hidden from customers.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update service.");
    }
  }

  return <div className="space-y-6">
    <PageHeader title={`${providerLabel} Services`} description={`Review ${providerLabel} packages and enable only the services customers should see.`} actions={<Button onClick={() => void syncProvider(provider === "smmzio" ? "smmzio" : "pak")} disabled={syncing}><RefreshCw className={`mr-2 size-4 ${syncing ? "animate-spin" : ""}`} />{syncing ? "Syncing…" : `Sync ${providerLabel} Services`}</Button>} />
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">Imported services are hidden by default. Verify each package’s price, limits, and platform before enabling it for customers.</div>
    {loading ? <div className="space-y-3">{[1, 2, 3, 4].map((key) => <Skeleton key={key} className="h-14 w-full" />)}</div> : <div className="overflow-x-auto rounded-xl border"><Table><TableHeader><TableRow><TableHead>Service</TableHead><TableHead>Platform</TableHead><TableHead>Price / 1k</TableHead><TableHead>Limits</TableHead><TableHead>Provider</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Visible</TableHead></TableRow></TableHeader><TableBody>{services.map((service) => <TableRow key={service._id}><TableCell><p className="font-medium">{service.name}</p><p className="text-xs text-muted-foreground">{service.category?.name || "Other"}</p></TableCell><TableCell className="capitalize">{service.platform}</TableCell><TableCell>{money(service.ratePerThousand, service.currency)}</TableCell><TableCell>{service.minQuantity.toLocaleString()}–{service.maxQuantity.toLocaleString()}</TableCell><TableCell>{service.providerName || "Manual"}</TableCell><TableCell><Badge variant={service.isActive ? "default" : "secondary"}>{service.isActive ? "Active" : "Draft"}</Badge></TableCell><TableCell className="text-right"><Button size="sm" variant={service.isActive ? "outline" : "default"} onClick={() => void toggleService(service)}>{service.isActive ? "Hide" : "Enable"}</Button></TableCell></TableRow>)}{!services.length ? <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No {providerLabel} services imported yet. Use the sync button above.</TableCell></TableRow> : null}</TableBody></Table></div>}
  </div>;
}
