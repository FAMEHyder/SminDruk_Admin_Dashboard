"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut } from "lucide-react";
import { ADMIN_NAV } from "@/data/admin-nav";
import { GROWTH_ADMIN_NAV } from "@/data/admin-nav-growth";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({});
  const [growthMode, setGrowthMode] = React.useState(pathname.startsWith("/smm"));
  const navItems = growthMode ? GROWTH_ADMIN_NAV : ADMIN_NAV;

  React.useEffect(() => {
    navItems.forEach((item) => {
      if (item.children?.some((c) => pathname.startsWith(c.href))) {
        setOpenGroups((prev) => ({ ...prev, [item.title]: true }));
      }
    });
  }, [pathname, navItems]);

  React.useEffect(() => {
    const syncMode = () => setGrowthMode(window.localStorage.getItem("smindruk_admin_mode") === "growth");
    syncMode();
    window.addEventListener("smindruk-admin-mode", syncMode);
    return () => window.removeEventListener("smindruk-admin-mode", syncMode);
  }, []);

  return (
    <aside className={cn("flex h-full flex-col border-r bg-sidebar text-sidebar-foreground", className)}>
      <div className="flex h-16 items-center gap-2 border-b px-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Smindruk" className="size-8 rounded-lg object-contain" />
        <div>
          <p className="text-sm font-semibold">Smindruk Admin</p>
          <p className="text-xs text-muted-foreground">SaaS Control Center</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const hasChildren = Boolean(item.children?.length);
          const groupOpen = openGroups[item.title];

          if (hasChildren) {
            return (
              <div key={item.title}>
                <button
                  type="button"
                  onClick={() => setOpenGroups((p) => ({ ...p, [item.title]: !p[item.title] }))}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent",
                    active && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <item.icon className="size-4" />
                    {item.title}
                  </span>
                  <ChevronDown className={cn("size-4 transition-transform", groupOpen && "rotate-180")} />
                </button>
                {groupOpen && (
                  <div className="ml-4 mt-1 space-y-1 border-l pl-3">
                    {item.children!.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          pathname === child.href && "bg-sidebar-accent text-sidebar-accent-foreground"
                        )}
                      >
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent",
                active && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => logout()}>
          <LogOut className="size-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
