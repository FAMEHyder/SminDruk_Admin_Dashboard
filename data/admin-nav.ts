import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  CreditCard,
  FileText,
  FolderKanban,
  Image,
  LayoutDashboard,
  Link2,
  MessageSquare,
  ScrollText,
  Settings,
  Shield,
  Timer,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";

export interface AdminNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  children?: { title: string; href: string }[];
}

export const ADMIN_NAV: AdminNavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    title: "Users",
    href: "/users",
    icon: Users,
    children: [
      { title: "All Users", href: "/users" },
      { title: "User Activity", href: "/users/activity" },
    ],
  },
  { title: "Workspaces", href: "/workspaces", icon: FolderKanban },
  {
    title: "Posts",
    href: "/posts",
    icon: FileText,
    children: [
      { title: "All Posts", href: "/posts" },
      { title: "Published", href: "/posts/published" },
      { title: "Scheduled", href: "/posts/scheduled" },
      { title: "Drafts", href: "/posts/drafts" },
      { title: "Failed", href: "/posts/failed" },
    ],
  },
  { title: "Social Accounts", href: "/social-accounts", icon: Link2 },
  { title: "Scheduler", href: "/scheduler", icon: Timer },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Subscriptions", href: "/subscriptions", icon: Wallet },
  { title: "Payments", href: "/payments", icon: CreditCard },
  { title: "AI Management", href: "/ai", icon: Brain },
  { title: "Media Library", href: "/media", icon: Image },
  { title: "Notifications", href: "/notifications", icon: Bell },
  { title: "Support", href: "/support", icon: MessageSquare },
  { title: "Blogs", href: "/blogs", icon: BookOpen },
  { title: "Reports", href: "/reports", icon: ScrollText },
  { title: "Audit Logs", href: "/audit-logs", icon: Shield },
  { title: "API Settings", href: "/api-settings", icon: Wrench },
  { title: "System Settings", href: "/settings", icon: Settings },
];
