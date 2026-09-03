import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default' | 'processing' | 'accent' | 'brand';
  size?: 'sm' | 'md' | 'lg' | string;
  hasDot?: boolean;
  isPulsing?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<string, string> = {
  success: 'bg-success-bg text-success border-0',
  warning: 'bg-warning-bg text-warning border-0',
  danger: 'bg-danger-bg text-danger border-0',
  info: 'bg-info-bg text-info border-0',
  accent: 'bg-info-bg text-info border-0',
  brand: 'bg-rzp-primary text-white border-0',
  default: 'bg-subtle text-ink-secondary border-0',
  processing: 'bg-info-bg text-info border-0',
};

export function Badge({
  variant = 'default',
  size = 'sm',
  hasDot = false,
  isPulsing = false,
  children,
  className,
}: BadgeProps) {
  const isProcessing = variant === 'processing' || isPulsing;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 h-[22px] px-2 rounded-full font-body font-semibold text-2xs tracking-wide whitespace-nowrap select-none',
        size === 'md' && 'h-[26px] px-2.5 text-xs',
        variantStyles[variant] || variantStyles.default,
        className
      )}
    >
      {(isProcessing || hasDot) && (
        <span
          className={cn(
            'w-[5px] h-[5px] rounded-full bg-current flex-shrink-0',
            isProcessing && 'animate-pulse'
          )}
        />
      )}
      {children}
    </span>
  );
}

export const STATUS_BADGE_MAP: Record<string, { variant: BadgeProps['variant']; label: string }> = {
  QUEUED: { variant: 'default', label: 'In queue' },
  PROCESSING: { variant: 'processing', label: 'Processing' },
  EXTRACTING: { variant: 'processing', label: 'Reading bill' },
  AUDITING: { variant: 'processing', label: 'Checking prices' },
  ML_ANALYSIS: { variant: 'processing', label: 'AI analysis' },
  FINANCIAL_ANALYSIS: { variant: 'processing', label: 'Financial check' },
  GENERATING_REPORT: { variant: 'processing', label: 'Preparing report' },
  GENERATING_EVIDENCE: { variant: 'processing', label: 'Creating proof' },
  COMPLETED: { variant: 'success', label: 'Check complete' },
  AUDITED: { variant: 'success', label: 'Check complete' },
  FAILED: { variant: 'danger', label: 'Something went wrong' },
  RETRYING: { variant: 'warning', label: 'Trying again' },
  CANCELLED: { variant: 'default', label: 'Cancelled' },
};

export function getStatusBadgeVariant(status?: string): BadgeProps['variant'] {
  if (!status) return 'default';
  return STATUS_BADGE_MAP[status]?.variant || 'default';
}

export default Badge;
