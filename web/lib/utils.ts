import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO } from "date-fns";

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));

export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "—";
  try {
    const d = typeof dateString === "string" ? parseISO(dateString) : new Date(dateString);
    return format(d, "dd MMM yyyy");
  } catch {
    return String(dateString);
  }
};

export const formatTimeAgo = (dateString: string | null | undefined): string => {
  if (!dateString) return "—";
  try {
    const d = typeof dateString === "string" ? parseISO(dateString) : new Date(dateString);
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return "recently";
  }
};

export const formatPercent = (decimal: number | null | undefined): string => {
  if (decimal === null || decimal === undefined || isNaN(Number(decimal))) return "—";
  return Math.round(Number(decimal) * 100) + "%";
};

