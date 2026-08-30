"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { SkeletonCard, SkeletonRow, SkeletonText } from "@/components/ui/Skeleton";
import { useAuthStore } from "@/store/authStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex">
        {/* Sidebar Skeleton */}
        <div className="w-60 bg-white border-r border-neutral-300 p-6 hidden lg:flex flex-col justify-between">
          <div className="space-y-6">
            <SkeletonText width="sm" className="h-8" />
            <div className="space-y-3 pt-4">
              <SkeletonText lines={4} className="h-6" />
            </div>
          </div>
          <div className="pt-4 border-t border-neutral-300">
            <SkeletonText lines={2} />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 flex flex-col">
          <div className="h-16 bg-white border-b border-neutral-300 px-6 flex items-center justify-between">
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
            <div className="bg-white rounded-card border border-neutral-300 p-6">
              <table className="w-full">
                <tbody>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Sidebar />
      <TopBar />
      <main className="lg:ml-60 pt-16 p-6 sm:p-8 flex-1">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
