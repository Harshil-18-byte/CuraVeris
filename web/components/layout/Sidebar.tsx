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
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const { data: unreadNotifications } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      try {
        const res = await api.notifications.getUnreadCount();
        return res.count || 0;
      } catch {
        return 0;
      }
    },
    refetchInterval: 30000,
  });

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Medical Bills", href: "/bills", icon: FileStack },
    {
      label: "Notifications",
      href: "/notifications",
      icon: Bell,
      badge: unreadNotifications && unreadNotifications > 0 ? unreadNotifications : undefined,
    },
    { label: "Profile", href: "/profile", icon: UserIcon },
    { label: "Financial Risk", href: "/frm", icon: ShieldAlert },
    { label: "ABHA Health", href: "/abha", icon: Layers },
  ];

  const adminItems = [
    { label: "Admin Overview", href: "/admin", icon: ShieldAlert },
    { label: "User Directory", href: "/admin/users", icon: Users },
    { label: "Worker Jobs", href: "/admin/jobs", icon: Layers },
  ];

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-[240px] bg-brand-primary flex flex-col justify-between hidden lg:flex select-none">
      <div>
        {/* Brand Header */}
        <div className="h-[64px] flex items-center px-4 border-b border-white/10">
          <Logo href="/dashboard" showTagline={true} theme="light" size="sm" />
        </div>

        {/* Navigation Section */}
        <nav className="p-2 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "h-[40px] px-3 rounded-md flex items-center justify-between text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-white/15 text-white shadow-xs font-semibold"
                    : "text-white/65 hover:text-white hover:bg-white/8"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-[18px] h-[18px] text-current" strokeWidth={1.5} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={cn(
                      "px-1.5 py-0.5 text-[11px] font-semibold rounded-full",
                      isActive ? "bg-white text-brand-primary" : "bg-brand-accent text-white"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Admin Navigation */}
          {user?.role === "admin" && (
            <div className="pt-4 mt-3 border-t border-white/10">
              <span className="px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/35 block mb-1">
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
                        "h-[38px] px-3 rounded-md flex items-center gap-2.5 text-sm font-medium transition-all duration-150",
                        isActive
                          ? "bg-white/15 text-white shadow-xs"
                          : "text-white/65 hover:text-white hover:bg-white/8"
                      )}
                    >
                      <Icon className="w-[18px] h-[18px] text-current" strokeWidth={1.5} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Bottom User Section */}
      <div className="p-3 border-t border-white/10 bg-black/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 font-heading">
              {user?.full_name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white truncate">
                {user?.full_name || "Patient Account"}
              </span>
              <span className="text-[11px] text-white/50 truncate">{user?.email}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            aria-label="Sign Out"
            className="w-7 h-7 rounded-md text-white/65 hover:text-danger hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </aside>
  );
};
