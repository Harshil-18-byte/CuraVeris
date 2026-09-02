"use client";

import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

interface PageShellProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const PageShell: React.FC<PageShellProps> = ({
  children,
  title,
  description,
  action,
  className = "",
}) => {
  return (
    <div className="min-h-screen bg-bg-secondary flex flex-col">
      <Sidebar />

      {/* Main Content Area */}
      <div className="lg:pl-[240px] flex-1 flex flex-col pb-20 lg:pb-8">
        <TopBar />

        <main id="main-content" className="flex-1 px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto">
          {(title || action || description) && (
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                {title && (
                  <h2 className="font-heading font-bold text-2xl text-text-primary tracking-tight">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-sm text-text-secondary mt-1 font-normal">
                    {description}
                  </p>
                )}
              </div>
              {action && <div className="flex-shrink-0 flex items-center gap-2">{action}</div>}
            </div>
          )}

          <ErrorBoundary>
            <div className={className}>{children}</div>
          </ErrorBoundary>
        </main>
      </div>

      <BottomNav />
    </div>
  );
};
