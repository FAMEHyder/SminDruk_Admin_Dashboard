import type { AdminNavItem } from "./admin-nav";
import { LayoutDashboard, Store } from "lucide-react";

export const GROWTH_ADMIN_NAV: AdminNavItem[] = [
  { title: "Growth Overview", href: "/smm", icon: LayoutDashboard },
  { title: "Services", href: "/smm/services", icon: Store },
];
