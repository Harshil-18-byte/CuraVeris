import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | string;
  variant?: 'default' | 'interactive' | 'elevated' | 'accent-left' | 'stat' | 'bento' | string;
  interactive?: boolean;
  accentColor?: 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'none' | string;
  onClick?: () => void;
}

const paddingStyles: Record<string, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6 md:p-7',
  lg: 'p-7 md:p-9',
};

const accentStyles: Record<string, string> = {
  none: '',
  primary: 'border-l-4 border-l-[#43A8B2]',
  success: 'border-l-4 border-l-[#86C159]',
  warning: 'border-l-4 border-l-[#F59E0B]',
  danger: 'border-l-4 border-l-[#EF4444]',
  info: 'border-l-4 border-l-[#5E84E2]',
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
        'bg-white/90 border border-black/[0.05] rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] text-left backdrop-blur-xl relative overflow-hidden transition-all duration-200',
        isElevated && 'shadow-[0_12px_32px_rgba(0,0,0,0.07)] border-black/[0.08]',
        paddingStyles[padding] ?? 'p-6 md:p-7',
        accentStyles[effectiveAccent],
        isInteractive &&
          'cursor-pointer hover:border-black/[0.12] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]',
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
  return <h3 className={cn('font-heading font-bold text-lg md:text-xl text-[#202128] tracking-tight', className)}>{children}</h3>;
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('font-body text-sm text-[#202128]/70', className)}>{children}</p>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('pt-0', className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex items-center pt-4 border-t border-black/[0.05]', className)}>{children}</div>;
}

export default Card;
