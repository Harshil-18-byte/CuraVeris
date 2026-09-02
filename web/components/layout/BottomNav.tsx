"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, FileStack, UploadCloud, Bell, User as UserIcon } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const { data: unreadData } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => api.notifications.getUnreadCount(),
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
  });

  const unreadCount = unreadData?.count ?? 0;

  const tabs = [
    { label: "Home", href: "/dashboard", icon: LayoutDashboard },
    { label: "Bills", href: "/bills", icon: FileStack },
    { label: "Check Bill", href: "/bills/upload", icon: UploadCloud, isPrimary: true },
    { label: "Updates", href: "/notifications", icon: Bell, badge: unreadCount },
    { label: "Profile", href: "/account", icon: UserIcon },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border-subtle h-[64px] flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive =
          pathname === tab.href ||
          (tab.href !== "/dashboard" && pathname.startsWith(tab.href));

        if (tab.isPrimary) {
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center -mt-5 group"
            >
              <div className="w-12 h-12 rounded-full bg-brand-accent text-white flex items-center justify-center shadow-[0_4px_12px_rgba(37,99,235,0.30)] active:scale-95 transition-transform">
                <Icon className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <span className="text-[10px] font-medium text-text-secondary mt-1">
                {tab.label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 relative text-center"
          >
            <div className="relative">
              <Icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-brand-accent" : "text-text-tertiary"
                )}
                strokeWidth={1.5}
              />
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-danger text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </div>
            <span
              className={cn(
                "text-[10px] font-medium mt-1 transition-colors",
                isActive ? "text-brand-accent font-semibold" : "text-text-tertiary"
              )}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};
