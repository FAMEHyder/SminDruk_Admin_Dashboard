"use client";

import * as React from "react";
import { toast } from "sonner";
import { Brain, CheckCircle2, XCircle } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/services";

export default function AiPage() {
  const [data, setData] = React.useState<Awaited<ReturnType<typeof adminApi.getAi>> | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    adminApi
      .getAi()
      .then(setData)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="AI Management" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="AI Management" description="OpenAI connection and usage overview" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Provider Status</CardDescription>
            <CardTitle className="flex items-center gap-2 text-lg">
              {data.configured ? (
                <Badge variant="success" className="gap-1">
                  <CheckCircle2 className="size-3.5" /> Connected
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <XCircle className="size-3.5" /> Not configured
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground capitalize">
            Provider: {data.provider}
          </CardContent>
        </Card>
        <StatCard title="Total Requests" value={data.totalRequests} icon={Brain} />
        <StatCard title="Tokens Consumed" value={data.tokensConsumed} icon={Brain} />
        <StatCard title="Failed Requests" value={data.failedRequests} icon={Brain} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
          <CardDescription>{data.note}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Set <code className="rounded bg-muted px-1">OPENAI_API_KEY</code> in Backend env to enable
          AI features. Usage metering can be added later via an AiUsage collection.
        </CardContent>
      </Card>
    </div>
  );
}
