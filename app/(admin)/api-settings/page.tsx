"use client";

import * as React from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/services";

export default function ApiSettingsPage() {
  const [services, setServices] = React.useState<{ name: string; key: string; connected: boolean }[]>(
    []
  );
  const [note, setNote] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    adminApi
      .getApiSettings()
      .then((res) => {
        setServices(res.services);
        setNote(res.note);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="API Settings"
        description="Connection status for third-party integrations (secrets never exposed)"
      />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((svc) => (
              <Card key={svc.key}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{svc.name}</CardTitle>
                  <CardDescription>{svc.key}</CardDescription>
                </CardHeader>
                <CardContent>
                  {svc.connected ? (
                    <Badge variant="success" className="gap-1">
                      <CheckCircle2 className="size-3.5" /> Connected
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <XCircle className="size-3.5" /> Not configured
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{note}</p>
        </>
      )}
    </div>
  );
}
