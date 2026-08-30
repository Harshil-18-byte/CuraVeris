import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  accentColor?: "none" | "primary" | "success" | "warning" | "danger";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding = "md", accentColor = "none", children, ...props }, ref) => {
    const paddingStyles = {
      none: "p-0",
      sm: "p-4",
      md: "p-5",
      lg: "p-6",
    };

    const accentStyles = {
      none: "",
      primary: "border-l-4 border-l-primary",
      success: "border-l-4 border-l-success",
      warning: "border-l-4 border-l-warning",
      danger: "border-l-4 border-l-danger",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "bg-white rounded-card shadow-card border border-neutral-300",
          paddingStyles[padding],
          accentStyles[accentColor],
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
