"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BookOpen,
  Brain,
  FileText,
  FolderKanban,
  Link2,
  MessageSquare,
  Users,
} from "lucide-react";
import {
  Activity,
  CalendarClock,
  CheckCircle2,
  DollarSign,
  Layers,
  TrendingUp,
  UserPlus,
  XCircle,
} from "lucide-react";
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
import { toast } from "sonner";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/services";
import type { DashboardOverview } from "@/types/admin";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default function DashboardPage() {
  const [data, setData] = React.useState<DashboardOverview | null>(null);
  const [charts, setCharts] = React.useState<Awaited<ReturnType<typeof adminApi.getAnalytics>> | null>(
    null
  );
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const overview = await adminApi.getDashboardOverview();
        if (!cancelled) setData(overview);
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Failed to load dashboard");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }

      try {
        const analytics = await adminApi.getAnalytics();
        if (!cancelled) setCharts(analytics);
      } catch {
        // Charts are optional — don't block the stats cards.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
        Unable to load dashboard data.
      </div>
    );
  }

  const { stats, tokenRefreshPolicy } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Platform health at a glance</p>
        </div>
        {stats.tokenRefreshRequired > 0 && (
          <Link href="/social-accounts">
            <Badge variant="warning" className="gap-1 px-3 py-1.5 text-sm">
              <AlertTriangle className="size-3.5" />
              {stats.tokenRefreshRequired} accounts need token refresh
            </Badge>
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} />
        <StatCard title="Active Users" value={stats.activeUsers} icon={Activity} />
        <StatCard title="New Users Today" value={stats.newUsersToday} icon={UserPlus} />
        <StatCard title="Total Workspaces" value={stats.totalWorkspaces} icon={FolderKanban} />
        <StatCard
          title="Manage Accounts"
          value={stats.manageAccounts}
          icon={Link2}
          hint="Just want to manage my account"
        />
        <StatCard
          title="Dataset Accounts"
          value={stats.datasetAccounts}
          icon={Layers}
          hint="Trending dataset pages"
        />
        <StatCard title="Total Posts" value={stats.totalPosts} icon={FileText} />
        <StatCard title="Scheduled Posts" value={stats.scheduledPosts} icon={CalendarClock} />
        <StatCard title="Published Posts" value={stats.publishedPosts} icon={CheckCircle2} />
        <StatCard title="Failed Posts" value={stats.failedPosts} icon={XCircle} />
        <StatCard title="Total AI Requests" value={stats.totalAiRequests} icon={Brain} />
        <StatCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon={DollarSign} />
        <StatCard title="Active Subscriptions" value={stats.activeSubscriptions} icon={TrendingUp} />
        <StatCard title="Support Tickets" value={stats.supportTickets} icon={MessageSquare} />
        <StatCard title="Blog Posts" value={stats.blogPosts} icon={BookOpen} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Social Accounts Breakdown</CardTitle>
            <CardDescription>
              Manage vs Dataset connected Facebook pages
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Manage Account</p>
              <p className="text-3xl font-bold">{formatNumber(stats.manageAccounts)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Workspace posting channels</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Dataset Account</p>
              <p className="text-3xl font-bold">{formatNumber(stats.datasetAccounts)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Trending bulk-post pages</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Token Refresh Policy</CardTitle>
            <CardDescription>
              Cron auto-refresh from day {tokenRefreshPolicy.refreshAfterDays} to day{" "}
              {tokenRefreshPolicy.cronMaxDays}. Manual refresh available after day{" "}
              {tokenRefreshPolicy.refreshAfterDays}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm">Accounts needing attention</span>
              <Badge variant={stats.tokenRefreshRequired ? "warning" : "success"}>
                {stats.tokenRefreshRequired}
              </Badge>
            </div>
            <Link
              href="/social-accounts"
              className="inline-flex h-9 w-full items-center justify-center rounded-lg border border-border text-sm hover:bg-muted"
            >
              View Social Accounts
            </Link>
          </CardContent>
        </Card>
      </div>

      {charts && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Posts Published</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.postsPerDay}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--primary)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
