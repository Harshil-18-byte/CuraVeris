"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "accent" | "brand";
  size?: "sm" | "md";
  hasDot?: boolean;
  isPulsing?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "default",
  size = "sm",
  hasDot = false,
  isPulsing = false,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium tracking-[0.01em] whitespace-nowrap select-none",
        
        // Variants
        variant === "default" && "bg-[#F1F5F9] text-[#475569]",
        variant === "success" && "bg-success-bg text-success",
        variant === "warning" && "bg-warning-bg text-warning",
        variant === "danger" && "bg-danger-bg text-danger",
        variant === "accent" && "bg-brand-accent-light text-brand-accent",
        variant === "brand" && "bg-brand-primary text-white",

        // Sizes
        size === "sm" && "px-2.5 py-0.5 text-xs",
        size === "md" && "px-3.5 py-1 text-sm font-semibold",

        className
      )}
      {...props}
    >
      {(hasDot || isPulsing) && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full bg-currentColor",
            isPulsing && "animate-pulse-glow"
          )}
        />
      )}
      {children}
    </span>
  );
};

export function getStatusBadgeVariant(status?: string): BadgeProps["variant"] {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "PROCESSING":
    case "AUDITING":
    case "EXTRACTING":
    case "ML_ANALYSIS":
    case "FINANCIAL_ANALYSIS":
    case "GENERATING_REPORT":
    case "GENERATING_EVIDENCE":
      return "accent";
    case "FAILED":
      return "danger";
    case "RETRYING":
      return "warning";
    case "QUEUED":
    default:
      return "default";
  }
}
