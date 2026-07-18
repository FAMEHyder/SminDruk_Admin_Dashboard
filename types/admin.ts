export interface AdminUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "user" | "admin" | "superadmin";
  isActive: boolean;
  isEmailVerified: boolean;
  avatar?: string;
  createdAt: string;
}

export interface TokenRefreshMeta {
  tokenIssuedAt: string | null;
  tokenExpiresAt: string | null;
  daysSinceIssued: number;
  refreshStatus: "healthy" | "refresh_due" | "cron_expired";
  cronEligible: boolean;
  manualRefreshAvailable: boolean;
  lastTokenRefreshAttemptAt: string | null;
  lastTokenRefreshError: string | null;
}

export interface SocialAccountItem extends TokenRefreshMeta {
  _id: string;
  type: "manage" | "dataset";
  platform: string;
  accountId: string;
  pageNumber?: number;
  name: string;
  category: string;
  avatar: string;
  status: string;
  workspace?: { _id: string; name: string };
  connectedBy?: { _id: string; firstName: string; lastName: string; email: string };
  lastSyncedAt: string | null;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalWorkspaces: number;
  manageAccounts: number;
  datasetAccounts: number;
  totalSocialAccounts: number;
  totalPosts: number;
  scheduledPosts: number;
  publishedPosts: number;
  failedPosts: number;
  draftPosts: number;
  totalAiRequests: number;
  totalRevenue: number;
  activeSubscriptions: number;
  supportTickets: number;
  blogPosts: number;
  totalMedia: number;
  tokenRefreshRequired: number;
}

export interface DashboardOverview {
  stats: DashboardStats;
  tokenRefreshPolicy: { refreshAfterDays: number; cronMaxDays: number };
}

export interface SocialAccountsOverview {
  summary: {
    totalManageAccounts: number;
    totalDatasetAccounts: number;
    totalConnected: number;
    tokenRefreshRequired: number;
    healthy: number;
  };
  manageAccounts: SocialAccountItem[];
  datasetAccounts: SocialAccountItem[];
  tokenRefreshRequired: SocialAccountItem[];
  tokenRefreshPolicy: { refreshAfterDays: number; cronMaxDays: number };
}

export interface WorkspaceItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  plan: string;
  isActive: boolean;
  owner?: { _id: string; firstName: string; lastName: string; email: string };
  stats?: { posts: number; accounts: number; pages: number };
  createdAt: string;
}

export interface PostItem {
  _id: string;
  content: string;
  type: string;
  status: string;
  platforms?: string[];
  scheduledAt?: string;
  publishedAt?: string;
  failureReason?: string;
  workspace?: { _id: string; name: string };
  createdBy?: { _id: string; firstName: string; lastName: string; email: string };
  createdAt: string;
  source?: "post" | "bulk" | "page";
}

export interface PaymentItem {
  _id: string;
  amount: number;
  currency: string;
  status: string;
  gateway: string;
  plan?: string;
  receiptUrl?: string;
  workspace?: { _id: string; name: string };
  createdAt: string;
}

export interface SubscriptionItem {
  _id: string;
  plan: string;
  billingCycle: string;
  status: string;
  workspace?: { _id: string; name: string };
  limits?: Record<string, number>;
  usage?: Record<string, number>;
  createdAt: string;
}

export interface PlanItem {
  id: string;
  name: string;
  limits: Record<string, number>;
  activeSubscriptions: number;
}

export interface BlogItem {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  status: string;
  category?: string;
  author?: { firstName: string; lastName: string; email: string };
  publishedAt?: string;
  createdAt: string;
}

export interface SupportTicket {
  _id: string;
  type: string;
  name?: string;
  email: string;
  subject?: string;
  message?: string;
  status: string;
  createdAt: string;
}

export interface AuditLogItem {
  _id: string;
  event: string;
  description?: string;
  ipAddress?: string;
  user?: { firstName: string; lastName: string; email: string };
  workspace?: { name: string };
  createdAt: string;
}

export interface MediaItem {
  _id: string;
  fileName: string;
  fileType: string;
  url: string;
  mimeType: string;
  workspace?: { name: string };
  uploadedBy?: { firstName: string; lastName: string; email: string };
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  type: string;
  channel: string;
  title: string;
  message: string;
  isRead: boolean;
  user?: { firstName: string; lastName: string; email: string };
  createdAt: string;
}

export interface PlatformSettings {
  _id?: string;
  websiteName: string;
  logo: string;
  favicon: string;
  contactEmail: string;
  supportEmail: string;
  defaultTimezone: string;
  defaultLanguage: string;
  maintenanceMode: boolean;
  announcementBanner: string;
  featureFlags: Record<string, boolean>;
  globalLimits: {
    maxWorkspacesPerUser: number;
    maxScheduledPosts: number;
    storageLimitGB: number;
  };
}
