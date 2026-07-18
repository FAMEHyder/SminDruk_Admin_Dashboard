"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Bell, Moon, Search, Sun, UserCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export function AdminHeader() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur sm:px-6">
      <div className="relative max-w-md flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search users, posts, workspaces..." className="pl-9" />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
        <div className="hidden items-center gap-2 rounded-lg border px-3 py-1.5 sm:flex">
          <UserCircle2 className="size-5 text-muted-foreground" />
          <div className="text-left text-sm leading-tight">
            <p className="font-medium">{user ? `${user.firstName} ${user.lastName}` : "Admin"}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role || "admin"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
