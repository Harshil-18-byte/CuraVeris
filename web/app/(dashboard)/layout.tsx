"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { SkeletonCard, SkeletonText } from "@/components/ui/Skeleton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // While validating token with the server
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F6FB] flex relative overflow-hidden">
        {/* Sidebar Skeleton */}
        <div className="w-60 bg-white border-r border-black/[0.05] p-6 hidden lg:flex flex-col justify-between">
          <div className="space-y-6">
            <SkeletonText width="sm" className="h-8" />
            <div className="space-y-3 pt-4">
              <SkeletonText lines={5} className="h-6" />
            </div>
          </div>
          <div className="pt-4 border-t border-black/[0.06]">
            <SkeletonText lines={2} />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 flex flex-col">
          <div className="h-16 bg-white border-b border-black/[0.05] px-6 flex items-center justify-between">
            <SkeletonText width="sm" />
            <SkeletonText width="sm" />
          </div>
          <div className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
            <div className="flex justify-between items-center">
              <SkeletonText width="md" className="h-8" />
              <SkeletonText width="sm" className="h-10" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
            <SkeletonCard className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated — redirect is in progress (useEffect above)
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
