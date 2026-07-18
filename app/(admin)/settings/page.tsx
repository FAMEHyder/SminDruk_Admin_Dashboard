"use client";

import * as React from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldError } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/services";
import type { PlatformSettings } from "@/types/admin";
import { platformSettingsSchema } from "@/lib/validations/admin";

export default function SettingsPage() {
  const [settings, setSettings] = React.useState<PlatformSettings | null>(null);
  const [security, setSecurity] = React.useState<Awaited<ReturnType<typeof adminApi.getSecurity>> | null>(
    null
  );
  const [system, setSystem] = React.useState<Awaited<ReturnType<typeof adminApi.getSystem>> | null>(
    null
  );
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    Promise.all([adminApi.getSettings(), adminApi.getSecurity(), adminApi.getSystem()])
      .then(([s, sec, sys]) => {
        setSettings(s);
        setSecurity(sec);
        setSystem(sys);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;

    const parsed = platformSettingsSchema.safeParse({
      websiteName: settings.websiteName,
      defaultTimezone: settings.defaultTimezone,
      contactEmail: settings.contactEmail,
      supportEmail: settings.supportEmail,
      logo: settings.logo ?? "",
      favicon: settings.favicon ?? "",
      announcementBanner: settings.announcementBanner ?? "",
      maintenanceMode: settings.maintenanceMode,
      maxWorkspacesPerUser: settings.globalLimits?.maxWorkspacesPerUser ?? 5,
      maxScheduledPosts: settings.globalLimits?.maxScheduledPosts ?? 500,
      storageLimitGB: settings.globalLimits?.storageLimitGB ?? 100,
    });

    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "websiteName");
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      toast.error(parsed.error.issues[0]?.message || "Please fix the form errors");
      return;
    }
    setErrors({});

    setSaving(true);
    try {
      const updated = await adminApi.updateSettings({
        websiteName: parsed.data.websiteName,
        defaultTimezone: parsed.data.defaultTimezone,
        contactEmail: parsed.data.contactEmail,
        supportEmail: parsed.data.supportEmail,
        logo: parsed.data.logo,
        favicon: parsed.data.favicon,
        announcementBanner: parsed.data.announcementBanner,
        maintenanceMode: parsed.data.maintenanceMode,
        globalLimits: {
          maxWorkspacesPerUser: parsed.data.maxWorkspacesPerUser,
          maxScheduledPosts: parsed.data.maxScheduledPosts,
          storageLimitGB: parsed.data.storageLimitGB,
        },
      });
      setSettings(updated);
      toast.success("Settings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !settings) {
    return (
      <div className="space-y-6">
        <PageHeader title="System Settings" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="System Settings" description="Website branding, emails, and maintenance" />

      <form onSubmit={save} className="space-y-6" noValidate>
        <Card>
          <CardHeader>
            <CardTitle>Platform</CardTitle>
            <CardDescription>Public website identity and contact details</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <Field>
              <label className="text-sm font-medium">Website Name</label>
              <Input
                value={settings.websiteName}
                onChange={(e) => setSettings({ ...settings, websiteName: e.target.value })}
                aria-invalid={!!errors.websiteName}
              />
              <FieldError message={errors.websiteName} />
            </Field>
            <Field>
              <label className="text-sm font-medium">Default Timezone</label>
              <Input
                value={settings.defaultTimezone}
                onChange={(e) => setSettings({ ...settings, defaultTimezone: e.target.value })}
                aria-invalid={!!errors.defaultTimezone}
              />
              <FieldError message={errors.defaultTimezone} />
            </Field>
            <Field>
              <label className="text-sm font-medium">Contact Email</label>
              <Input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                aria-invalid={!!errors.contactEmail}
              />
              <FieldError message={errors.contactEmail} />
            </Field>
            <Field>
              <label className="text-sm font-medium">Support Email</label>
              <Input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                aria-invalid={!!errors.supportEmail}
              />
              <FieldError message={errors.supportEmail} />
            </Field>
            <Field>
              <label className="text-sm font-medium">Logo URL</label>
              <Input
                value={settings.logo}
                onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                aria-invalid={!!errors.logo}
              />
              <FieldError message={errors.logo} />
            </Field>
            <Field>
              <label className="text-sm font-medium">Favicon URL</label>
              <Input
                value={settings.favicon}
                onChange={(e) => setSettings({ ...settings, favicon: e.target.value })}
                aria-invalid={!!errors.favicon}
              />
              <FieldError message={errors.favicon} />
            </Field>
            <Field className="md:col-span-2">
              <label className="text-sm font-medium">Announcement Banner</label>
              <Input
                value={settings.announcementBanner}
                onChange={(e) => setSettings({ ...settings, announcementBanner: e.target.value })}
                aria-invalid={!!errors.announcementBanner}
              />
              <FieldError message={errors.announcementBanner} />
            </Field>
            <label className="flex items-center gap-2 text-sm md:col-span-2">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              />
              Maintenance Mode
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Global Limits</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <Field>
              <label className="text-sm font-medium">Max Workspaces / User</label>
              <Input
                type="number"
                value={settings.globalLimits?.maxWorkspacesPerUser ?? 5}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    globalLimits: {
                      ...settings.globalLimits,
                      maxWorkspacesPerUser: Number(e.target.value),
                    },
                  })
                }
                aria-invalid={!!errors.maxWorkspacesPerUser}
              />
              <FieldError message={errors.maxWorkspacesPerUser} />
            </Field>
            <Field>
              <label className="text-sm font-medium">Max Scheduled Posts</label>
              <Input
                type="number"
                value={settings.globalLimits?.maxScheduledPosts ?? 500}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    globalLimits: {
                      ...settings.globalLimits,
                      maxScheduledPosts: Number(e.target.value),
                    },
                  })
                }
                aria-invalid={!!errors.maxScheduledPosts}
              />
              <FieldError message={errors.maxScheduledPosts} />
            </Field>
            <Field>
              <label className="text-sm font-medium">Storage Limit (GB)</label>
              <Input
                type="number"
                value={settings.globalLimits?.storageLimitGB ?? 100}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    globalLimits: {
                      ...settings.globalLimits,
                      storageLimitGB: Number(e.target.value),
                    },
                  })
                }
                aria-invalid={!!errors.storageLimitGB}
              />
              <FieldError message={errors.storageLimitGB} />
            </Field>
          </CardContent>
        </Card>

        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </form>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>JWT: {security?.jwtConfigured ? "Configured" : "Missing"}</p>
            <p>Encryption: {security?.encryptionConfigured ? "Configured" : "Missing"}</p>
            <p>Active Sessions: {security?.activeSessions ?? 0}</p>
            <p>Failed Logins (7d): {security?.failedLoginAttempts7d ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>System Monitoring</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Server: {system?.server.status}</p>
            <p>Uptime: {Math.floor((system?.server.uptimeSeconds || 0) / 60)} min</p>
            <p>Node: {system?.server.nodeVersion}</p>
            <p>
              Memory: {system?.memory.heapUsedMB} / {system?.memory.heapTotalMB} MB
            </p>
            <p>Database: {system?.database.status}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
