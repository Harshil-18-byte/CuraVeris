"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive" | "elevated" | "accent-left" | "stat";
  accentColor?: "primary" | "success" | "warning" | "danger" | "info";
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "default",
      accentColor,
      padding = "md",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-bg-elevated rounded-lg border border-border-subtle shadow-sm overflow-hidden text-left",
          
          // Variants
          variant === "interactive" && [
            "cursor-pointer transition-all duration-150 ease-out",
            "hover:shadow-md hover:-translate-y-0.5 hover:border-border-default",
            "active:shadow-xs active:translate-y-0",
          ],

          variant === "elevated" && [
            "bg-brand-primary text-white border-0 shadow-lg",
          ],

          variant === "accent-left" && [
            "border-l-[3px] rounded-l-none",
            accentColor === "primary" && "border-l-brand-accent",
            accentColor === "success" && "border-l-success",
            accentColor === "warning" && "border-l-warning",
            accentColor === "danger" && "border-l-danger",
            accentColor === "info" && "border-l-info",
            !accentColor && "border-l-brand-accent",
          ],

          variant === "stat" && [
            "min-h-[100px] flex flex-col justify-between",
          ],

          // Padding options
          padding === "none" && "p-0",
          padding === "sm" && "p-5",
          padding === "md" && "p-6",
          padding === "lg" && "p-8",

          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
