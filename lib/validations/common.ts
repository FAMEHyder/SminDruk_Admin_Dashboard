import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address");

export const optionalUrlSchema = z
  .string()
  .trim()
  .refine((v) => !v || /^https?:\/\/.+/i.test(v), "Enter a valid URL (https://...)");

export const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long");

export const positiveIntSchema = (label: string) =>
  z.coerce
    .number({ error: `${label} must be a number` })
    .int(`${label} must be a whole number`)
    .positive(`${label} must be greater than 0`);
