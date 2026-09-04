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
            className="font-body font-semibold text-xs text-[#202128]/80 ml-1"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {effectivePrefix ? (
            <span className="absolute left-4 font-body font-medium text-sm text-[#202128]/50 pointer-events-none select-none">
              {effectivePrefix}
            </span>
          ) : leftAddon ? (
            <div className="absolute left-4 flex items-center pointer-events-none text-[#202128]/50 text-sm z-10">
              {leftAddon}
            </div>
          ) : null}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-11 bg-white border border-black/[0.08] rounded-2xl font-body text-sm text-[#202128] placeholder:text-[#202128]/40 outline-none transition-all duration-150 shadow-xs',
              effectivePrefix ? 'pl-8 pr-4' : leftAddon ? 'pl-11 pr-4' : 'px-4',
              effectiveSuffix ? 'pr-10' : '',
              'hover:border-black/[0.15]',
              'focus:border-[#202128] focus:ring-4 focus:ring-[#DBF1F4]/60',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-100',
              props.disabled && 'bg-neutral-100 text-neutral-400 cursor-not-allowed border-black/[0.04]',
              className
            )}
            {...props}
          />

          {effectiveSuffix && (
            <span className="absolute right-4 text-[#202128]/50">
              {effectiveSuffix}
            </span>
          )}
        </div>
        {error && (
          <p className="flex items-center gap-1 font-body text-xs text-red-600 mt-0.5 ml-1">
            <AlertCircle size={12} strokeWidth={2} />
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="font-body text-xs text-[#202128]/50 mt-0.5 ml-1">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
