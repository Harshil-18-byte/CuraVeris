import React from "react";
import { cn } from "@/lib/utils";
import { ProcessingStatus } from "@/types";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "primary" | "secondary";
  size?: "sm" | "md";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "sm", children, ...props }, ref) => {
    const variantStyles = {
      default: "bg-neutral-50 text-neutral-600 border border-neutral-300",
      success: "bg-success-surface text-success border border-success/20",
      warning: "bg-warning-surface text-warning border border-warning/20",
      danger: "bg-danger-surface text-danger border border-danger/20",
      primary: "bg-primary-surface text-primary border border-primary/20",
      secondary: "bg-neutral-50 text-neutral-900 border border-neutral-300",
    };

    const sizeStyles = {
      sm: "text-xs px-2 py-0.5",
      md: "text-xs px-2.5 py-1",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "rounded-badge font-semibold inline-flex items-center tracking-wide",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export function getStatusBadgeVariant(status: ProcessingStatus | string): BadgeProps["variant"] {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "FAILED":
      return "danger";
    case "RETRYING":
      return "warning";
    case "EXTRACTING":
    case "AUDITING":
    case "ML_ANALYSIS":
    case "FINANCIAL_ANALYSIS":
    case "GENERATING_REPORT":
    case "GENERATING_EVIDENCE":
      return "primary";
    case "QUEUED":
    default:
      return "default";
  }
}
