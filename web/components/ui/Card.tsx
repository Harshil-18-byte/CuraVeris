import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | string;
  variant?: 'default' | 'interactive' | 'elevated' | 'accent-left' | 'stat' | string;
  interactive?: boolean;
  accentColor?: 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'none' | string;
  onClick?: () => void;
}

const paddingStyles: Record<string, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5 md:p-6',
  lg: 'p-6 md:p-8',
};

const accentStyles: Record<string, string> = {
  none: '',
  primary: 'border-l-[3px] border-l-rzp-blue rounded-l-none',
  success: 'border-l-[3px] border-l-success rounded-l-none',
  warning: 'border-l-[3px] border-l-warning rounded-l-none',
  danger: 'border-l-[3px] border-l-danger rounded-l-none',
  info: 'border-l-[3px] border-l-info rounded-l-none',
};

export function Card({
  children,
  className,
  padding = 'md',
  variant = 'default',
  interactive = false,
  accentColor = 'none',
  onClick,
  ...props
}: CardProps) {
  const isInteractive = interactive || variant === 'interactive' || !!onClick;
  const isElevated = variant === 'elevated';
  const effectiveAccent = accentColor !== 'none' ? accentColor : variant === 'accent-left' ? 'primary' : 'none';

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-surface border border-line-subtle rounded-lg shadow-card text-left',
        isElevated && 'shadow-elevated',
        paddingStyles[padding] ?? 'p-5 md:p-6',
        accentStyles[effectiveAccent],
        isInteractive &&
          'cursor-pointer transition-all duration-120 ease-rzp hover:shadow-elevated hover:-translate-y-px active:translate-y-0 active:shadow-card',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex flex-col space-y-1.5 pb-4', className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn('font-heading font-semibold text-lg text-ink-primary tracking-tight', className)}>{children}</h3>;
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('font-body text-xs text-ink-secondary', className)}>{children}</p>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('pt-0', className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex items-center pt-4 border-t border-line-subtle', className)}>{children}</div>;
}

export default Card;
