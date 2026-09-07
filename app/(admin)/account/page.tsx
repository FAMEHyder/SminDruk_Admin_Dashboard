"use client";

import { PageHeader } from "@/components/admin/page-header";
import { ChangePasswordForm } from "@/components/admin/change-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminAccountPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Account" description="Set a new password for the account you are signed in with." />
      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>Super admin can set a new password directly. Other admins must enter the current password first.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
