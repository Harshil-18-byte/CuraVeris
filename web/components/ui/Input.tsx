import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, hint, leftAddon, rightAddon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col">
        {label && (
          <label htmlFor={inputId} className="font-medium text-sm text-neutral-900 mb-1">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftAddon && (
            <div className="absolute left-3 z-10 flex items-center pointer-events-none text-neutral-600">
              {leftAddon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              "w-full h-12 px-4 border rounded-button text-sm text-neutral-900 bg-white transition-colors placeholder:text-neutral-600/50",
              "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary",
              error ? "border-danger focus:border-danger focus:ring-danger" : "border-neutral-300",
              leftAddon && "pl-10",
              rightAddon && "pr-10",
              className
            )}
            {...props}
          />
          {rightAddon && (
            <div className="absolute right-3 z-10 flex items-center text-neutral-600">
              {rightAddon}
            </div>
          )}
        </div>
        {error && <span className="text-danger text-xs mt-1">{error}</span>}
        {!error && hint && <span className="text-neutral-600 text-xs mt-1">{hint}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
