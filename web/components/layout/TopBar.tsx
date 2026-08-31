"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  ShieldCheck,
  Menu,
  X,
  LayoutDashboard,
  FileStack,
  UploadCloud,
  User as UserIcon,
  LogOut,
  ShieldAlert,
  Layers,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export const TopBar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Bills", href: "/bills", icon: FileStack },
    { label: "Upload Bill", href: "/bills/upload", icon: UploadCloud },
    { label: "Notifications", href: "/notifications", icon: Bell, badge: unreadCount },
    { label: "Account", href: "/account", icon: UserIcon },
  ];

  const adminItems = [
    { label: "Admin Overview", href: "/admin", icon: ShieldAlert },
    { label: "Worker Jobs", href: "/admin/jobs", icon: Layers },
    { label: "User Directory", href: "/admin/users", icon: Users },
  ];

  return (
    <>
      <header className="fixed top-0 right-0 left-0 lg:left-60 h-16 bg-white border-b border-neutral-300 z-20 flex items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile Toggle & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-button transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-600 hidden sm:inline">
              CuraVeris
            </span>
            <span className="text-neutral-300 hidden sm:inline">/</span>
            <span className="text-sm font-semibold text-neutral-900 truncate">
              {getBreadcrumbs()}
            </span>
          </div>
        </div>

        {/* Right Action Icons & Badges */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Compliance indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-success-surface border border-success/20 rounded-badge text-xs font-semibold text-success">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>DPDP Act 2023</span>
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
          <Link href="/account" className="flex items-center gap-2" title="My Account">
            <div className="w-8 h-8 rounded-full bg-primary-surface border border-primary/20 flex items-center justify-center text-primary font-heading font-bold text-xs">
              {user?.full_name?.charAt(0).toUpperCase() || "U"}
            </div>
          </Link>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Menu */}
          <div className="fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-neutral-300 p-4 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
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

              {user?.role === "admin" && (
                <div className="pt-4 mt-3 border-t border-neutral-300">
                  <span className="px-3 text-xs font-semibold uppercase tracking-wider text-neutral-600 block mb-2">
                    Administration
                  </span>
                  {adminItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
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
              )}
            </nav>

            <div className="pt-4 border-t border-neutral-300">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-danger hover:bg-danger-surface rounded-button transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
