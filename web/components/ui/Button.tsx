import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "ghost" | "outline";
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
      "inline-flex items-center justify-center font-medium rounded-button transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

    const variantStyles = {
      primary: "bg-primary text-white hover:bg-primary-light focus:ring-2 focus:ring-primary/20",
      secondary: "bg-white border border-primary text-primary hover:bg-primary-surface",
      destructive: "bg-danger text-white hover:bg-danger/90 focus:ring-2 focus:ring-danger/20",
      ghost: "text-primary hover:bg-primary-surface bg-transparent",
      outline: "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50",
    };

    const sizeStyles = {
      sm: "h-9 px-3 text-sm",
      md: "h-12 px-5 text-sm",
      lg: "h-14 px-6 text-base",
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
