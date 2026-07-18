import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminHeader } from "@/components/admin/header";
import { AdminSidebar } from "@/components/admin/sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex h-screen overflow-hidden bg-muted/20">
        <AdminSidebar className="hidden w-64 shrink-0 lg:flex" />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
