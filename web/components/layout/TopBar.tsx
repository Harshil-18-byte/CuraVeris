"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Bell, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";

export const TopBar: React.FC = () => {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  const { data: unreadData } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => api.notifications.getUnreadCount(),
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
  });

  const unreadCount = unreadData?.count ?? 0;

  const getBreadcrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0) return "Home";
    return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" / ");
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-60 h-16 bg-white border-b border-neutral-300 z-20 flex items-center justify-between px-6">
      {/* Breadcrumb Left */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-neutral-600">
          CuraVeris
        </span>
        <span className="text-neutral-300">/</span>
        <span className="text-sm font-semibold text-neutral-900">
          {getBreadcrumbs()}
        </span>
      </div>

      {/* Right Action Icons & Badges */}
      <div className="flex items-center gap-4">
        {/* Compliance indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-success-surface border border-success/20 rounded-badge text-xs font-semibold text-success">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>DPDP Act 2023 Compliant</span>
        </div>

        {/* Notifications Icon with Unread Badge */}
        <Link
          href="/notifications"
          className="relative p-2 text-neutral-600 hover:text-primary hover:bg-primary-surface rounded-button transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 px-1.5 py-0.5 min-w-[18px] text-[10px] font-bold text-white bg-primary rounded-full flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>

        {/* User initials avatar */}
        <Link href="/account" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-surface border border-primary/20 flex items-center justify-center text-primary font-heading font-bold text-xs">
            {user?.full_name?.charAt(0).toUpperCase() || "U"}
          </div>
        </Link>
      </div>
    </header>
  );
};
