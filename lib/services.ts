import { api } from "./api";
import type {
  AdminUser,
  AuditLogItem,
  BlogItem,
  DashboardOverview,
  MediaItem,
  NotificationItem,
  PaymentItem,
  PlanItem,
  PlatformSettings,
  PostItem,
  SocialAccountsOverview,
  SmmServiceItem,
  SubscriptionItem,
  SupportTicket,
  WorkspaceItem,
} from "@/types/admin";
import type { PaginationMeta } from "./api";

function qs(params?: Record<string, string | number | undefined>) {
  if (!params) return "";
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") search.set(k, String(v));
  });
  const q = search.toString();
  return q ? `?${q}` : "";
}

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post<{ accessToken: string; refreshToken: string; user: AdminUser }>("/auth/login", data, {
      auth: false,
    }),
  me: () => api.get<AdminUser>("/users/me"),
  logout: (refreshToken?: string) =>
    api.post("/auth/logout", refreshToken ? { refreshToken } : undefined),
};

export const adminApi = {
  getDashboardOverview: () => api.get<DashboardOverview>("/admin/dashboard/overview"),

  getUsers: async (params?: { page?: number; search?: string; role?: string; isActive?: string }) => {
    const res = await api.getFull<AdminUser[]>(`/admin/users${qs(params)}`);
    return { items: res.data, meta: res.meta as PaginationMeta | undefined };
  },
  updateUserStatus: (id: string, isActive: boolean) =>
    api.patch<AdminUser>(`/admin/users/${id}/status`, { isActive }),
  updateUser: (id: string, data: Partial<AdminUser>) => api.patch<AdminUser>(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  verifyUserEmail: (id: string) => api.post<AdminUser>(`/admin/users/${id}/verify-email`),
  resetUserPassword: (id: string, password?: string) =>
    api.post<{ user: AdminUser; temporaryPassword: string }>(`/admin/users/${id}/reset-password`, {
      password,
    }),
  getUserActivity: async (params?: { page?: number; userId?: string }) => {
    const res = await api.getFull<AuditLogItem[]>(`/admin/users/activity${qs(params)}`);
    return { items: res.data, meta: res.meta };
  },

  getWorkspaces: async (params?: { page?: number; search?: string; isActive?: string }) => {
    const res = await api.getFull<WorkspaceItem[]>(`/admin/workspaces${qs(params)}`);
    return { items: res.data, meta: res.meta };
  },
  createWorkspace: (data: { name: string; ownerId: string; description?: string; plan?: string }) =>
    api.post<WorkspaceItem>("/admin/workspaces", data),
  updateWorkspace: (id: string, data: Partial<WorkspaceItem>) =>
    api.patch<WorkspaceItem>(`/admin/workspaces/${id}`, data),
  deleteWorkspace: (id: string) => api.delete(`/admin/workspaces/${id}`),

  getPosts: async (params?: { page?: number; status?: string; search?: string }) => {
    const res = await api.getFull<PostItem[]>(`/admin/posts${qs(params)}`);
    return { items: res.data, meta: res.meta };
  },
  deletePost: (id: string) => api.delete(`/admin/posts/${id}`),

  getSocialAccounts: (params?: { search?: string; status?: string }) =>
    api.get<SocialAccountsOverview>(`/admin/social-accounts${qs(params)}`),
  refreshToken: (source: "manage" | "dataset", id: string) =>
    api.post<{ pagesUpdated: number; totalPages: number }>(
      `/admin/social-accounts/${source}/${id}/refresh-token`
    ),

  getScheduler: () =>
    api.get<{
      jobs: {
        name: string;
        schedule: string;
        timezone?: string;
        dueCount: number;
        scheduledCount: number;
        failedCount: number;
      }[];
      recentLogs: AuditLogItem[];
    }>("/admin/scheduler"),
  runScheduler: (job: "posts" | "bulk" | "token-refresh" | "all") =>
    api.post("/admin/scheduler/run", { job }),

  getAnalytics: () =>
    api.get<{
      userGrowth: { date: string; count: number }[];
      postsPerDay: { date: string; count: number }[];
      revenueByDay: { date: string; total: number }[];
      platformUsage: { platform: string; count: number }[];
      topActiveUsers: { posts: number; email?: string; firstName?: string; lastName?: string }[];
      engagement: Record<string, number>;
    }>("/admin/analytics"),

  getPlans: () => api.get<PlanItem[]>("/admin/plans"),
  getSubscriptions: async (params?: { page?: number; status?: string; plan?: string }) => {
    const res = await api.getFull<SubscriptionItem[]>(`/admin/subscriptions${qs(params)}`);
    return { items: res.data, meta: res.meta };
  },
  updateSubscription: (id: string, data: { plan?: string; status?: string; billingCycle?: string }) =>
    api.patch<SubscriptionItem>(`/admin/subscriptions/${id}`, data),

  getPayments: async (params?: { page?: number; status?: string }) => {
    const res = await api.getFull<{
      items: PaymentItem[];
      summary: Record<string, { count: number; amount: number }>;
    }>(`/admin/payments${qs(params)}`);
    return { ...res.data, meta: res.meta };
  },

  syncSmmZioServices: () => api.post<{ imported: number }>("/admin/smm/providers/smmzio/sync-services"),
  syncPakServices: () => api.post<{ imported: number }>("/admin/smm/providers/paksmmcheap/sync-services"),
  getSmmOverview: () =>
    api.get<{
      stats: {
        categories: number;
        activeServices: number;
        totalOrders: number;
        pendingOrders: number;
        completedOrders: number;
        totalSales: number;
        walletLiability: number;
      };
    }>("/admin/smm/overview"),
  getSmmProviderBalances: () =>
    api.get<{ id: string; name: string; available: number; currency: string; connected: boolean }[]>(
      "/admin/smm/providers/balances"
    ),
  getSmmServices: async (params?: { page?: number; limit?: number; status?: string; search?: string; provider?: string }) => {
    const res = await api.getFull<SmmServiceItem[]>(`/admin/smm/services${qs(params)}`);
    return { items: res.data, meta: res.meta };
  },
  updateSmmService: (id: string, data: Partial<SmmServiceItem>) =>
    api.patch<SmmServiceItem>(`/admin/smm/services/${id}`, data),

  getAi: () =>
    api.get<{
      configured: boolean;
      provider: string;
      totalRequests: number;
      tokensConsumed: number;
      failedRequests: number;
      note: string;
    }>("/admin/ai"),

  getMedia: async (params?: { page?: number; search?: string; type?: string }) => {
    const res = await api.getFull<{ items: MediaItem[]; byType: Record<string, number> }>(
      `/admin/media${qs(params)}`
    );
    return { ...res.data, meta: res.meta };
  },
  deleteMedia: (id: string) => api.delete(`/admin/media/${id}`),

  getNotifications: async (params?: { page?: number }) => {
    const res = await api.getFull<NotificationItem[]>(`/admin/notifications${qs(params)}`);
    return { items: res.data, meta: res.meta };
  },
  broadcastNotification: (data: { title: string; message: string; channel?: string }) =>
    api.post<{ sent: number }>("/admin/notifications/broadcast", data),

  getSupport: async (params?: { page?: number; status?: string; type?: string }) => {
    const res = await api.getFull<SupportTicket[]>(`/admin/support${qs(params)}`);
    return { items: res.data, meta: res.meta };
  },
  updateSupport: (id: string, status: string) =>
    api.patch<SupportTicket>(`/admin/support/${id}`, { status }),

  getBlogs: async (params?: { page?: number; status?: string; search?: string }) => {
    const res = await api.getFull<BlogItem[]>(`/admin/blogs${qs(params)}`);
    return { items: res.data, meta: res.meta };
  },
  createBlog: (data: Record<string, unknown>) => api.post<BlogItem>("/blogs", data),
  updateBlog: (id: string, data: Record<string, unknown>) => api.patch<BlogItem>(`/blogs/${id}`, data),
  publishBlog: (id: string) => api.patch<BlogItem>(`/blogs/${id}/publish`),
  deleteBlog: (id: string) => api.delete(`/blogs/${id}`),

  getReports: () => api.get<Record<string, unknown>>("/admin/reports/overview"),
  getLogs: async (params?: { page?: number; event?: string }) => {
    const res = await api.getFull<AuditLogItem[]>(`/admin/logs${qs(params)}`);
    return { items: res.data, meta: res.meta };
  },

  getApiSettings: () =>
    api.get<{ services: { name: string; key: string; connected: boolean }[]; note: string }>(
      "/admin/api-settings"
    ),
  getSettings: () => api.get<PlatformSettings>("/admin/settings"),
  updateSettings: (data: Partial<PlatformSettings>) =>
    api.patch<PlatformSettings>("/admin/settings", data),
  getSecurity: () =>
    api.get<{
      jwtConfigured: boolean;
      encryptionConfigured: boolean;
      activeSessions: number;
      failedLoginAttempts7d: number;
      recentFailedLogins: AuditLogItem[];
    }>("/admin/security"),
  getSystem: () =>
    api.get<{
      server: { status: string; uptimeSeconds: number; nodeVersion: string; env: string };
      memory: { rssMB: number; heapUsedMB: number; heapTotalMB: number };
      database: { status: string };
    }>("/admin/system"),
};
