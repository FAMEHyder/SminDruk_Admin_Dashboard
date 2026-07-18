"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Bell, Moon, Search, Sun, UserCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { adminApi } from "@/lib/services";

type SearchHit = { label: string; href: string; type: string };

export function AdminHeader() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [results, setResults] = React.useState<SearchHit[]>([]);
  const [searching, setSearching] = React.useState(false);

  React.useEffect(() => {
    const q = query.trim();
    if (q.length < 1) {
      setResults([]);
      return;
    }

    const t = window.setTimeout(async () => {
      setSearching(true);
      try {
        const [users, posts, workspaces] = await Promise.all([
          adminApi.getUsers({ page: 1, search: q }).catch(() => ({ items: [] })),
          adminApi.getPosts({ page: 1, search: q }).catch(() => ({ items: [] })),
          adminApi.getWorkspaces({ page: 1, search: q }).catch(() => ({ items: [] })),
        ]);

        const hits: SearchHit[] = [
          ...users.items.slice(0, 5).map((u) => ({
            label: `${u.firstName} ${u.lastName} · ${u.email}`,
            href: "/users",
            type: "User",
          })),
          ...workspaces.items.slice(0, 5).map((w) => ({
            label: w.name,
            href: "/workspaces",
            type: "Workspace",
          })),
          ...posts.items.slice(0, 5).map((p) => ({
            label: (p.content || "(empty)").slice(0, 60),
            href:
              p.status === "published"
                ? "/posts/published"
                : p.status === "scheduled"
                  ? "/posts/scheduled"
                  : p.status === "failed"
                    ? "/posts/failed"
                    : p.status === "draft"
                      ? "/posts/drafts"
                      : "/posts",
            type: `Post · ${p.status}`,
          })),
        ];
        setResults(hits);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => window.clearTimeout(t);
  }, [query]);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur sm:px-6">
      <div className="relative max-w-md flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users, posts, workspaces..."
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        />
        {open && query.trim() && (
          <div className="absolute top-full z-50 mt-1 max-h-80 w-full overflow-y-auto rounded-xl border bg-popover shadow-lg">
            {searching && results.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">Searching...</p>
            ) : results.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">No results found.</p>
            ) : (
              results.map((item, idx) => (
                <button
                  key={`${item.type}-${item.href}-${idx}`}
                  type="button"
                  className="flex w-full flex-col gap-0.5 px-3 py-2.5 text-left hover:bg-muted/60"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setQuery("");
                    setOpen(false);
                    router.push(item.href);
                  }}
                >
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-[11px] text-muted-foreground">{item.type}</span>
                </button>
              ))
            )}
          </div>
        )}
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
