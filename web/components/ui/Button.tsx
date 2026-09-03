'use client';

import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, disabled, children, className, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-body font-semibold transition-all duration-120 ease-rzp focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rzp-blue focus-visible:ring-offset-2 disabled:pointer-events-none select-none';

    const variants = {
      primary: 'bg-rzp-blue text-white shadow-btn-primary hover:bg-rzp-blue-dark hover:shadow-btn-primary-hover active:translate-y-px active:bg-[#1240C9] disabled:bg-[#C7D2FE] disabled:shadow-none',
      secondary: 'bg-surface text-ink-primary border border-line-default shadow-card hover:bg-subtle hover:border-line-strong active:bg-canvas active:translate-y-px',
      ghost: 'bg-transparent text-ink-secondary hover:bg-canvas hover:text-ink-primary',
      danger: 'bg-danger-bg text-danger border border-danger-border hover:bg-[#FEE2E2] hover:border-[#FCA5A5] active:translate-y-px',
    };

    const sizes = {
      sm: 'h-btn-sm px-3 text-xs rounded',
      md: 'h-btn px-4 text-sm rounded',
      lg: 'h-btn-lg px-5 text-md rounded-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 size={14} className="animate-spin" strokeWidth={2} />
        ) : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
