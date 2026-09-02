"use client";

import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "icon";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isIconOnly = variant === "icon";

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-body select-none transition-all duration-150 ease-out focus:outline-none",
          // Tactile micro-interaction on press
          "active:scale-[0.98] disabled:pointer-events-none disabled:active:scale-100",
          
          // Primary Variant
          variant === "primary" && [
            "bg-brand-accent text-white font-semibold shadow-xs border-0",
            "hover:bg-[#1D4ED8] hover:shadow-[0_4px_12px_rgba(37,99,235,0.30)]",
            "active:bg-[#1E40AF]",
            "disabled:bg-[#93C5FD] disabled:shadow-none disabled:text-white/80",
          ],

          // Secondary Variant
          variant === "secondary" && [
            "bg-white text-text-primary font-medium border border-border-default shadow-xs",
            "hover:bg-bg-secondary hover:border-border-strong",
            "active:bg-bg-tertiary",
            "disabled:bg-bg-secondary disabled:text-text-tertiary disabled:border-border-subtle",
          ],

          // Ghost Variant
          variant === "ghost" && [
            "bg-transparent text-text-secondary font-medium border-0",
            "hover:bg-bg-secondary hover:text-text-primary",
            "active:bg-bg-tertiary",
            "disabled:text-text-tertiary",
          ],

          // Danger Variant
          variant === "danger" && [
            "bg-danger text-white font-semibold border-0 shadow-xs",
            "hover:bg-[#B91C1C] hover:shadow-[0_4px_12px_rgba(220,38,38,0.25)]",
            "active:bg-[#991B1B]",
            "disabled:bg-danger/40 disabled:shadow-none",
          ],

          // Icon Variant
          variant === "icon" && [
            "bg-bg-secondary text-text-secondary border-0 p-0",
            "hover:bg-border-default hover:text-text-primary",
            "active:bg-border-strong",
            "disabled:text-text-tertiary",
          ],

          // Sizing (unless icon-only)
          !isIconOnly && size === "sm" && "h-[36px] px-3 text-sm rounded-md",
          !isIconOnly && size === "md" && "h-[44px] px-5 text-base rounded-md tracking-[-0.01em]",
          !isIconOnly && size === "lg" && "h-[52px] px-8 text-base font-semibold rounded-md",

          // Sizing (icon-only)
          isIconOnly && size === "sm" && "w-8 h-8 rounded-md",
          isIconOnly && size === "md" && "w-9 h-9 rounded-md",
          isIconOnly && size === "lg" && "w-11 h-11 rounded-md",

          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" strokeWidth={1.5} />
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
