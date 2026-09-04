"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SkeletonCard, SkeletonText } from "@/components/ui/Skeleton";
import { useAuthStore } from "@/store/authStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, isLoading, initialize, login } = useAuthStore();

  useEffect(() => {
    setMounted(true);
    initialize().then(() => {
      // If still not authenticated, auto-provision demo patient session
      const token = typeof window !== "undefined" ? localStorage.getItem("cv_access_token") : null;
      if (!token) {
        login(
          {
            access_token: "demo_token_patient_" + Date.now(),
            refresh_token: "demo_refresh_" + Date.now(),
          },
          {
            id: "usr-demo-patient-001",
            email: "patient.rahul@curaveris.ai",
            full_name: "Rahul Sharma",
            phone_verified: true,
            email_verified: true,
            dpdp_consent_given: true,
            role: "patient",
            is_active: true,
            created_at: new Date().toISOString(),
          }
        );
      }
    });
  }, [initialize, login]);


  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F6FB] flex relative overflow-hidden">
        {/* Liquid Mesh */}
        <div className="liquid-mesh">
          <div className="liquid-orb-1" />
          <div className="liquid-orb-2" />
        </div>

        {/* Sidebar Skeleton */}
        <div className="w-60 glass-sidebar p-6 hidden lg:flex flex-col justify-between z-10">
          <div className="space-y-6">
            <SkeletonText width="sm" className="h-8" />
            <div className="space-y-3 pt-4">
              <SkeletonText lines={4} className="h-6" />
            </div>
          </div>
          <div className="pt-4 border-t border-white/60">
            <SkeletonText lines={2} />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 flex flex-col z-10">
          <div className="h-16 glass-nav px-6 flex items-center justify-between">
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
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
