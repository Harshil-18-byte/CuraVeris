import React from 'react';
import { cn } from '@/lib/utils';

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('w-full overflow-hidden', className)}>
      <table className="w-full border-collapse">
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-subtle border-b border-line-subtle">
      {children}
    </thead>
  );
}

export function TableHead({
  children,
  className,
  align = 'left',
}: {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
}) {
  return (
    <th
      className={cn(
        'h-table-header px-6 font-body font-semibold text-xs text-ink-secondary uppercase tracking-wider whitespace-nowrap',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className
      )}
    >
      {children}
    </th>
  );
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <tr
      className={cn(
        'border-b border-line-subtle last:border-0 transition-colors duration-80',
        onClick ? 'cursor-pointer hover:bg-subtle' : 'hover:bg-[#FAFBFC]',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function TableCell({
  children,
  className,
  align = 'left',
}: {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
}) {
  return (
    <td
      className={cn(
        'h-table-row px-6 font-body text-sm text-ink-primary',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className
      )}
    >
      {children}
    </td>
  );
}

export function TableAmount({
  amount,
  type = 'neutral',
}: {
  amount: number | null | undefined;
  type?: 'credit' | 'debit' | 'neutral';
}) {
  const formatted =
    amount != null
      ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount)
      : '—';

  return (
    <span
      className={cn(
        'font-mono font-medium text-sm tabular-nums',
        type === 'credit' && 'text-success',
        type === 'debit' && 'text-danger',
        type === 'neutral' && 'text-ink-primary'
      )}
    >
      {formatted}
    </span>
  );
}

export default Table;
