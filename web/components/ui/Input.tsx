'use client';

import React, { forwardRef, InputHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: string;
  suffix?: React.ReactNode;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, prefix, suffix, leftAddon, rightAddon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    const effectivePrefix = prefix || (typeof leftAddon === 'string' ? leftAddon : null);
    const effectiveSuffix = suffix || rightAddon;

    return (
      <div className="flex flex-col gap-1.5 w-full text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="font-body font-medium text-xs text-ink-secondary"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {effectivePrefix ? (
            <span className="absolute left-3 font-body font-medium text-sm text-ink-secondary pointer-events-none select-none">
              {effectivePrefix}
            </span>
          ) : leftAddon ? (
            <div className="absolute left-3 flex items-center pointer-events-none text-ink-secondary text-sm z-10">
              {leftAddon}
            </div>
          ) : null}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-input bg-surface border border-line-default rounded font-body text-sm text-ink-primary placeholder:text-ink-tertiary outline-none transition-all duration-120 ease-rzp',
              effectivePrefix ? 'pl-7 pr-3' : leftAddon ? 'pl-9 pr-3' : 'px-3',
              effectiveSuffix ? 'pr-8' : '',
              'hover:border-line-strong',
              'focus:border-line-focus focus:ring-[3px] focus:ring-rzp-blue/10',
              error && 'border-danger focus:border-danger focus:ring-danger/8',
              props.disabled && 'bg-subtle text-ink-tertiary cursor-not-allowed border-line-subtle',
              className
            )}
            {...props}
          />

          {effectiveSuffix && (
            <span className="absolute right-3 text-ink-tertiary">
              {effectiveSuffix}
            </span>
          )}
        </div>
        {error && (
          <p className="flex items-center gap-1 font-body text-xs text-danger mt-0.5">
            <AlertCircle size={12} strokeWidth={2} />
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="font-body text-xs text-ink-tertiary mt-0.5">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
