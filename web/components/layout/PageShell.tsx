import React from "react";
import { cn } from "@/lib/utils";

interface PageShellProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const PageShell: React.FC<PageShellProps> = ({
  title,
  description,
  action,
  children,
  className,
}) => {
  return (
    <div className={cn("space-y-6", className)}>
      {(title || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-300">
          <div>
            {title && (
              <h1 className="font-heading font-bold text-2xl sm:text-3xl text-neutral-900 tracking-tight">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-sm text-neutral-600 mt-1 font-body">{description}</p>
            )}
          </div>
          {action && <div className="flex items-center gap-3">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
