"use client";

import * as React from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/services";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default function ReportsPage() {
  const [report, setReport] = React.useState<Record<string, any> | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    adminApi
      .getReports()
      .then(setReport)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  function exportCsv() {
    if (!report) return;
    const rows = [
      ["Section", "Metric", "Value"],
      ["Users", "Total", report.users?.total],
      ["Users", "Active", report.users?.active],
      ["Posts", "Total", report.posts?.total],
      ["Posts", "Published", report.posts?.published],
      ["Posts", "Failed", report.posts?.failed],
      ["Payments", "Revenue", report.payments?.revenue],
      ["Payments", "Failed", report.payments?.failed],
      ["Subscriptions", "Active", report.subscriptions?.active],
      ["Social", "Manage", report.social?.manage],
      ["Social", "Dataset", report.social?.dataset],
      ["Support", "Open", report.support?.open],
      ["Blogs", "Published", report.blogs?.published],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zarshan-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Reports" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!report) return null;

  const cards = [
    { title: "Total Users", value: formatNumber(report.users?.total || 0) },
    { title: "Active Users", value: formatNumber(report.users?.active || 0) },
    { title: "Total Posts", value: formatNumber(report.posts?.total || 0) },
    { title: "Published Posts", value: formatNumber(report.posts?.published || 0) },
    { title: "Revenue", value: formatCurrency(report.payments?.revenue || 0) },
    { title: "Active Subscriptions", value: formatNumber(report.subscriptions?.active || 0) },
    { title: "Manage Accounts", value: formatNumber(report.social?.manage || 0) },
    { title: "Dataset Accounts", value: formatNumber(report.social?.dataset || 0) },
    { title: "Open Support", value: formatNumber(report.support?.open || 0) },
    { title: "Published Blogs", value: formatNumber(report.blogs?.published || 0) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description={`Generated ${report.generatedAt ? new Date(report.generatedAt).toLocaleString() : "now"}`}
        actions={
          <Button onClick={exportCsv}>
            <Download className="mr-1 size-4" />
            Export CSV
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
