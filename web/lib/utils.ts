import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return "₹0";
  }
  const numeric = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numeric);
}

export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return "—";
  try {
    const d = typeof dateString === "string" ? parseISO(dateString) : dateString;
    return format(d, "dd MMM yyyy");
  } catch {
    return String(dateString);
  }
}

export function formatTimeAgo(dateString: string | Date | null | undefined): string {
  if (!dateString) return "—";
  try {
    const d = typeof dateString === "string" ? parseISO(dateString) : dateString;
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return "recently";
  }
}
