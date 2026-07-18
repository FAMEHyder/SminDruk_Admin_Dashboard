"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/admin/page-header";
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
import { formatNumber } from "@/lib/utils";

export default function AnalyticsPage() {
  const [data, setData] = React.useState<Awaited<ReturnType<typeof adminApi.getAnalytics>> | null>(
    null
  );
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    adminApi
      .getAnalytics()
      .then(setData)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  if (!data) {
    return <p className="text-muted-foreground">Unable to load analytics.</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="User growth, posts, revenue, and platform usage" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Growth (30d)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Posts Published Per Day</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.postsPerDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--primary)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue (30d)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="var(--chart-2)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Usage</CardTitle>
            <CardDescription>Connected social accounts by platform</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.platformUsage}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="platform" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--chart-3)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Engagement Totals</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Object.entries(data.engagement).map(([key, value]) => (
              <div key={key} className="rounded-lg border p-3">
                <p className="text-xs capitalize text-muted-foreground">{key}</p>
                <p className="text-xl font-bold">{formatNumber(Number(value) || 0)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Posts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topActiveUsers.map((u, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      {u.firstName} {u.lastName}
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </TableCell>
                    <TableCell>{u.posts}</TableCell>
                  </TableRow>
                ))}
                {!data.topActiveUsers.length && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      No data yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
