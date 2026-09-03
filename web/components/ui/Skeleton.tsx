import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export function Skeleton({ className, width, height }: SkeletonProps) {
  return (
    <div
      className={cn('animate-shimmer bg-gradient-to-r from-canvas via-line-subtle to-canvas bg-[length:200%_100%] rounded', className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({
  width = 'w-32',
  className,
  lines = 1,
}: {
  width?: string;
  className?: string;
  lines?: number;
}) {
  if (lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn('h-3.5 rounded', i === lines - 1 ? 'w-3/4' : 'w-full')}
          />
        ))}
      </div>
    );
  }
  return <Skeleton className={cn('h-3.5 rounded', width, className)} />;
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('bg-surface border border-line-subtle rounded-lg shadow-card p-5 space-y-3', className)}>
      <SkeletonText width="w-24" />
      <Skeleton className="h-8 w-36" />
      <SkeletonText width="w-20" />
    </div>
  );
}

export function SkeletonStat({ className }: { className?: string }) {
  return (
    <div className={cn('bg-surface border border-line-subtle rounded-lg shadow-card p-5 space-y-3 min-h-[100px] flex flex-col justify-between', className)}>
      <SkeletonText width="w-24" />
      <Skeleton className="h-7 w-32" />
      <SkeletonText width="w-16" />
    </div>
  );
}

export function SkeletonRow({ cols = 5, className }: { cols?: number; className?: string }) {
  const widths = ['w-32', 'w-24', 'w-20', 'w-16', 'w-14'];
  return (
    <div className={cn('flex items-center gap-4 px-6 h-table-row border-b border-line-subtle', className)}>
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonText key={i} width={widths[i % widths.length]} />
      ))}
    </div>
  );
}

export function SkeletonButton({ className }: { className?: string }) {
  return <Skeleton className={cn('h-btn w-24 rounded', className)} />;
}

export function SkeletonTableRow({ cols = 5, className }: { cols?: number; className?: string }) {
  const widths = ['w-32', 'w-24', 'w-20', 'w-16', 'w-14'];
  return (
    <div className={cn('flex items-center gap-4 px-6 h-table-row border-b border-line-subtle', className)}>
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonText key={i} width={widths[i % widths.length]} />
      ))}
    </div>
  );
}

export default Skeleton;
