"use client";

import React, { forwardRef, useId } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      leftAddon,
      rightAddon,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-secondary mb-1.5 tracking-[0.01em]"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftAddon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-text-secondary text-base font-medium z-10">
              {leftAddon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              "w-full h-[44px] px-3.5 bg-white text-text-primary text-base font-normal rounded-md border border-border-default outline-none transition-all duration-150",
              "placeholder:text-text-tertiary",
              "focus:border-border-focus focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]",
              error && "border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(220,38,38,0.10)]",
              disabled && "bg-bg-secondary text-text-tertiary cursor-not-allowed border-border-subtle",
              leftAddon && "pl-9",
              rightAddon && "pr-10",
              className
            )}
            {...props}
          />

          {rightAddon && (
            <div className="absolute right-3 flex items-center text-text-secondary text-sm z-10">
              {rightAddon}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1.5 text-xs text-danger flex items-center gap-1 font-normal animate-in fade-in-50 duration-150">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
            <span>{error}</span>
          </p>
        )}

        {!error && hint && (
          <p className="mt-1.5 text-xs text-text-tertiary font-normal">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
