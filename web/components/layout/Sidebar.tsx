"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  FileStack,
  Bell,
  User as UserIcon,
  ShieldAlert,
  LogOut,
  Layers,
  Users,
  Sparkles,
} from "lucide-react";
import { SkeletonText } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const { data: unreadData } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => api.notifications.getUnreadCount(),
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
  });

  const unreadCount = unreadData?.count ?? 0;

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Bills", href: "/bills", icon: FileStack },
    { label: "Notifications", href: "/notifications", icon: Bell, badge: unreadCount },
    { label: "Account", href: "/account", icon: UserIcon },
  ];

  const adminItems = [
    { label: "Admin Overview", href: "/admin", icon: ShieldAlert },
    { label: "Worker Jobs", href: "/admin/jobs", icon: Layers },
    { label: "User Management", href: "/admin/users", icon: Users },
  ];

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 w-60 glass-sidebar flex flex-col justify-between hidden lg:flex">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center px-6 border-b border-white/60">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-primary-light flex items-center justify-center text-white font-heading font-bold text-base shadow-[0_4px_12px_rgba(27,79,114,0.3)] group-hover:scale-105 transition-transform duration-200">
              C
            </div>
            <span className="font-heading font-bold text-xl text-neutral-900 tracking-tight">
              CuraVeris
            </span>
          </Link>
        </div>

        {/* Navigation List */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-button text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-primary to-primary-light text-white shadow-[0_4px_16px_rgba(27,79,114,0.22)] border border-white/20"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-white/60 hover:shadow-xs"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-neutral-600")} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={cn(
                      "px-2 py-0.5 text-xs font-semibold rounded-badge",
                      isActive ? "bg-white text-primary font-bold" : "bg-primary text-white"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Admin Section */}
          {user?.role === "admin" && (
            <div className="pt-5 mt-4 border-t border-white/60">
              <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-600/80 block mb-1.5">
                Administration
              </span>
              <div className="space-y-1">
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3.5 py-2 rounded-button text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-primary to-primary-light text-white shadow-[0_4px_16px_rgba(27,79,114,0.22)] border border-white/20"
                          : "text-neutral-600 hover:text-neutral-900 hover:bg-white/60 hover:shadow-xs"
                      )}
                    >
                      <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-neutral-600")} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* User Profile & Logout */}
      <div className="p-3.5 m-3 glass-panel rounded-card">
        <div className="flex items-center justify-between">
          <div className="flex flex-col min-w-0 pr-2">
            {user ? (
              <>
                <span className="text-xs font-bold text-neutral-900 truncate">
                  {user.full_name || "Patient Account"}
                </span>
                <span className="text-[11px] text-neutral-600 truncate">{user.email}</span>
              </>
            ) : (
              <div className="space-y-1">
                <SkeletonText width="sm" className="h-3.5" />
                <SkeletonText width="sm" className="h-3" />
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 text-neutral-600 hover:text-danger hover:bg-danger-surface/80 rounded-button transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
