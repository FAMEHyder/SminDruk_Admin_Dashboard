"use client";

import * as React from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/page-header";
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
import type { AuditLogItem } from "@/types/admin";
import { formatDate } from "@/lib/utils";

export default function SchedulerPage() {
  const [jobs, setJobs] = React.useState<
    {
      name: string;
      schedule: string;
      timezone?: string;
      dueCount: number;
      scheduledCount: number;
      failedCount: number;
    }[]
  >([]);
  const [logs, setLogs] = React.useState<AuditLogItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [running, setRunning] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getScheduler();
      setJobs(res.jobs);
      setLogs(res.recentLogs || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function run(job: "posts" | "bulk" | "token-refresh" | "all") {
    setRunning(job);
    try {
      await adminApi.runScheduler(job);
      toast.success(`Job "${job}" executed`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Run failed");
    } finally {
      setRunning(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scheduler"
        description="Cron jobs, due posts, and manual runs"
        actions={
          <Button onClick={() => run("all")} disabled={!!running}>
            Run All Jobs
          </Button>
        }
      />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {jobs.map((job) => (
            <Card key={job.name}>
              <CardHeader>
                <CardTitle className="text-base">{job.name}</CardTitle>
                <CardDescription>
                  {job.schedule}
                  {job.timezone ? ` · ${job.timezone}` : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Due / Scheduled</span>
                  <span>
                    {job.dueCount} / {job.scheduledCount}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Failed</span>
                  <Badge variant={job.failedCount ? "destructive" : "success"}>
                    {job.failedCount}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  disabled={!!running}
                  onClick={() => {
                    if (job.name.includes("Token")) run("token-refresh");
                    else if (job.name.includes("Bulk")) run("bulk");
                    else run("posts");
                  }}
                >
                  Manual Run
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Scheduler Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell>
                    <Badge variant="outline">{log.event}</Badge>
                  </TableCell>
                  <TableCell>{log.description || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(log.createdAt)}</TableCell>
                </TableRow>
              ))}
              {!logs.length && (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                    No scheduler logs yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
