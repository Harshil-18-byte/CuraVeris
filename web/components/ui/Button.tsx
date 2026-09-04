'use client';

import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, disabled, children, className, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-body font-bold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#202128] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none rounded-full';

    const variants = {
      primary: 'bg-[#202128] text-white hover:bg-[#121317] hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_14px_rgba(32,33,40,0.15)]',
      glow: 'bg-[#DBF1F4] text-[#202128] font-bold hover:bg-[#c9ebef] hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_14px_rgba(67,168,178,0.2)]',
      secondary: 'bg-white text-[#202128] border border-black/[0.08] hover:bg-[#F8FAFC] hover:scale-[1.02] active:scale-[0.98] shadow-[0_2px_10px_rgba(0,0,0,0.04)]',
      ghost: 'bg-transparent text-[#202128]/70 hover:text-[#202128] hover:bg-black/[0.04]',
      danger: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 active:scale-[0.98]',
    };

    const sizes = {
      sm: 'h-8 px-4 text-xs',
      md: 'h-10 px-6 text-sm',
      lg: 'h-12 px-8 text-base font-bold',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 size={15} className="animate-spin mr-2" strokeWidth={2.2} />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
