import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

/** Amounts from the API are stored in major currency units (e.g. USD dollars). */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount || 0);
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
