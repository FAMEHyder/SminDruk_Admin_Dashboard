import { z } from "zod";
import { emailSchema, optionalUrlSchema, positiveIntSchema } from "./common";

export const blogCreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
  excerpt: z.string().trim().max(500, "Excerpt is too long").optional().or(z.literal("")),
  content: z.string().trim().min(1, "Content is required").min(20, "Content must be at least 20 characters"),
});

export const broadcastSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120, "Title is too long"),
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .min(5, "Message must be at least 5 characters")
    .max(2000, "Message is too long"),
});

export const platformSettingsSchema = z.object({
  websiteName: z.string().trim().min(1, "Website name is required").max(100),
  defaultTimezone: z.string().trim().min(1, "Timezone is required"),
  contactEmail: emailSchema,
  supportEmail: emailSchema,
  logo: optionalUrlSchema,
  favicon: optionalUrlSchema,
  announcementBanner: z.string().trim().max(300, "Banner text is too long").optional().or(z.literal("")),
  maintenanceMode: z.boolean(),
  maxWorkspacesPerUser: positiveIntSchema("Max workspaces"),
  maxScheduledPosts: positiveIntSchema("Max scheduled posts"),
  storageLimitGB: positiveIntSchema("Storage limit"),
});

export type BlogCreateValues = z.infer<typeof blogCreateSchema>;
export type BroadcastValues = z.infer<typeof broadcastSchema>;
export type PlatformSettingsValues = z.infer<typeof platformSettingsSchema>;
