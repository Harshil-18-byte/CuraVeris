"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { useAuthStore } from "@/store/authStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { initialize, login } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initialize();

    // Frictionless access: If no session exists in localStorage, automatically provision a valid session
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("cv_access_token");
      if (!token) {
        const demoUser: any = {
          id: "00000000-0000-0000-0000-000000000001",
          email: "demo@curaveris.in",
          full_name: "Rajesh Kumar (Demo)",
          role: "PATIENT",
          is_active: true,
          email_verified: true,
          phone_verified: true,
          dpdp_consent_given: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        login(
          {
            access_token: "cv_session_" + Date.now(),
            refresh_token: "cv_session_" + Date.now(),
          },
          demoUser
        );
      }
    }
  }, [initialize, login]);

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <TopBar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
