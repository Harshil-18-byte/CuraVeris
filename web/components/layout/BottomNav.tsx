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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-black/[0.06] h-[64px] flex items-center justify-around px-3 pb-[env(safe-area-inset-bottom)] select-none shadow-[0_-10px_30px_rgba(0,0,0,0.04)]">
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
              <div className="w-12 h-12 rounded-full bg-[#202128] text-white flex items-center justify-center shadow-lg active:scale-95 hover:scale-105 transition-all">
                <Icon className="w-6 h-6" strokeWidth={2} />
              </div>
              <span className="text-[10px] font-bold text-[#202128] mt-1">
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
                  "w-5 h-5 transition-all duration-200",
                  isActive ? "text-[#202128]" : "text-[#606470] hover:text-[#202128]"
                )}
                strokeWidth={isActive ? 2.2 : 1.75}
              />
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-[#DC2626] text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {tab.badge}
                </span>
              )}
            </div>
            <span
              className={cn(
                "text-[10px] font-medium mt-1 transition-colors",
                isActive ? "text-[#202128] font-bold" : "text-[#606470]"
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
