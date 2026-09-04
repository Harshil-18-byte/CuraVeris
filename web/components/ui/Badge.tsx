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
  success: 'bg-[#86C159]/15 text-[#2E7D32] border border-[#86C159]/30',
  warning: 'bg-[#F59E0B]/15 text-[#B45309] border border-[#F59E0B]/30',
  danger: 'bg-[#EF4444]/15 text-[#DC2626] border border-[#EF4444]/30',
  info: 'bg-[#43A8B2]/15 text-[#0E7490] border border-[#43A8B2]/30',
  accent: 'bg-[#DBF1F4] text-[#202128] font-bold border border-[#79C5CD]/40',
  brand: 'bg-[#202128] text-white font-bold',
  default: 'bg-[#EDF0FB] text-[#202128]/80 font-medium',
  processing: 'bg-[#DBF1F4] text-[#202128] font-semibold border border-[#79C5CD]/40',
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
        'inline-flex items-center gap-1.5 h-6 px-3 rounded-full font-body font-semibold text-xs tracking-wide whitespace-nowrap select-none backdrop-blur-md',
        size === 'md' && 'h-7 px-3.5 text-xs',
        variantStyles[variant] || variantStyles.default,
        className
      )}
    >
      {(isProcessing || hasDot) && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full bg-current flex-shrink-0',
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
