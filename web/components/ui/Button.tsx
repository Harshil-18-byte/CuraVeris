import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "ghost" | "outline" | "glass";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
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
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-button glass-button transition-all duration-250 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

    const variantStyles = {
      primary: "bg-gradient-to-r from-primary to-primary-light text-white shadow-[0_4px_14px_rgba(27,79,114,0.28)] hover:shadow-[0_6px_20px_rgba(27,79,114,0.38)] hover:brightness-105",
      secondary: "bg-white/80 backdrop-blur-md border border-primary/30 text-primary hover:bg-primary-surface hover:border-primary shadow-xs",
      destructive: "bg-gradient-to-r from-danger to-danger/90 text-white shadow-[0_4px_14px_rgba(146,43,33,0.25)] hover:shadow-[0_6px_20px_rgba(146,43,33,0.35)] hover:brightness-105",
      ghost: "text-primary hover:bg-primary-surface/60 bg-transparent",
      outline: "border border-neutral-300/80 bg-white/70 backdrop-blur-md text-neutral-900 hover:bg-white hover:border-neutral-400 shadow-xs",
      glass: "bg-white/60 backdrop-blur-lg border border-white/80 text-neutral-900 hover:bg-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.04)]",
    };

    const sizeStyles = {
      sm: "h-9 px-3.5 text-xs font-semibold",
      md: "h-11 px-5 text-sm font-semibold",
      lg: "h-13 px-6 text-base font-semibold",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            <span>Processing…</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
