"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileStack,
  Bell,
  User as UserIcon,
  ShieldAlert,
  LogOut,
  Layers,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { unreadCount, fetchUnreadCount } = useNotificationStore();

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

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
    router.push("/login");
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 w-60 bg-white border-r border-neutral-300 flex flex-col justify-between hidden lg:flex">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center px-6 border-b border-neutral-300">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-heading font-bold text-lg">
              C
            </div>
            <span className="font-heading font-bold text-xl text-neutral-900 tracking-tight">
              CuraVeris
            </span>
          </Link>
        </div>

        {/* Navigation List */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-button text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-white"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
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
                      isActive ? "bg-white text-primary" : "bg-primary text-white"
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
            <div className="pt-5 mt-4 border-t border-neutral-300">
              <span className="px-3 text-xs font-semibold uppercase tracking-wider text-neutral-600">
                Administration
              </span>
              <div className="mt-2 space-y-1">
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-button text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-white"
                          : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
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
      <div className="p-4 border-t border-neutral-300 bg-neutral-50/50">
        <div className="flex items-center justify-between">
          <div className="flex flex-col min-w-0 pr-2">
            <span className="text-sm font-medium text-neutral-900 truncate">
              {user?.full_name || "Account"}
            </span>
            <span className="text-xs text-neutral-600 truncate">{user?.email}</span>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-2 text-neutral-600 hover:text-danger hover:bg-danger-surface rounded-button transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
