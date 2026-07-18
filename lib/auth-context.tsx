"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "@/lib/api";
import { authApi } from "@/lib/services";
import type { AdminUser } from "@/types/admin";

interface AuthContextValue {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

const ADMIN_ROLES = new Set(["admin", "superadmin"]);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AdminUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  const loadSession = React.useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const me = await authApi.me();
      if (!ADMIN_ROLES.has(me.role)) {
        clearTokens();
        setUser(null);
        return;
      }
      setUser(me);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadSession();
  }, [loadSession]);

  const login = React.useCallback(async (email: string, password: string) => {
    const result = await authApi.login({ email, password });
    if (!ADMIN_ROLES.has(result.user.role)) {
      throw new Error("This account does not have admin access.");
    }
    setTokens(result.accessToken, result.refreshToken);
    setUser(result.user);
  }, []);

  const logout = React.useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      await authApi.logout(refreshToken || undefined);
    } catch {
      // ignore logout API errors
    }
    clearTokens();
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
