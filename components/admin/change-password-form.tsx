"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError } from "@/components/ui/field";
import { useAuth } from "@/lib/auth-context";
import { authApi } from "@/lib/services";
import { ApiRequestError } from "@/lib/api";
import { changePasswordSchema } from "@/lib/validations/auth";

const isSuperAdmin = (role?: string) => role === "superadmin" || role === "super admin";

export function ChangePasswordForm() {
  const { user } = useAuth();
  const skipCurrent = isSuperAdmin(user?.role);
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = changePasswordSchema.safeParse({
      currentPassword: skipCurrent ? undefined : currentPassword,
      newPassword,
      confirmPassword,
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "newPassword");
        if (!next[key]) next[key] = issue.message;
      }
      if (!skipCurrent && !currentPassword.trim()) {
        next.currentPassword = "Current password is required";
      }
      setErrors(next);
      return;
    }
    if (!skipCurrent && !parsed.data.currentPassword) {
      setErrors({ currentPassword: "Current password is required" });
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await authApi.changePassword({
        ...(skipCurrent ? {} : { currentPassword: parsed.data.currentPassword }),
        newPassword: parsed.data.newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed. Use the new password next time you log in.");
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Could not change password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid max-w-md gap-3" noValidate>
      {!skipCurrent && (
        <Field>
          <label htmlFor="currentPassword" className="text-sm font-medium">Current password</label>
          <Input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            aria-invalid={!!errors.currentPassword}
          />
          <FieldError message={errors.currentPassword} />
        </Field>
      )}
      <Field>
        <label htmlFor="newPassword" className="text-sm font-medium">New password</label>
        <Input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          aria-invalid={!!errors.newPassword}
        />
        <FieldError message={errors.newPassword} />
      </Field>
      <Field>
        <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm new password</label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          aria-invalid={!!errors.confirmPassword}
        />
        <FieldError message={errors.confirmPassword} />
      </Field>
      <Button type="submit" disabled={saving}>
        {saving && <Loader2 className="size-4 animate-spin" />}
        {saving ? "Saving..." : "Set new password"}
      </Button>
    </form>
  );
}
