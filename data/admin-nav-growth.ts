import type { AdminNavItem } from "./admin-nav";
import { LayoutDashboard, Store } from "lucide-react";

export const GROWTH_ADMIN_NAV: AdminNavItem[] = [
  { title: "Growth Overview", href: "/smm", icon: LayoutDashboard },
  { title: "ZIO Services", href: "/smm/services?provider=smmzio", icon: Store },
  { title: "Pak Services", href: "/smm/services?provider=paksmmcheap", icon: Store },
];
