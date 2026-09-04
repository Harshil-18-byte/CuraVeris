"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  PlusCircle,
  Receipt,
  Menu,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { api } from "@/lib/api";

export const TopBar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { openMobileNav } = useUIStore();

  const { data: unreadData } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => api.notifications.getUnreadCount(),
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
  });

  const unreadCount = unreadData?.count ?? 0;

  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname === "/bills") return "My Bills";
    if (pathname === "/bills/upload") return "Check a Bill";
    if (pathname.includes("/risk")) return "Financial Risk";
    if (pathname.includes("/audit")) return "Audit Results";
    if (pathname.startsWith("/bills/")) return "Bill Details";
    if (pathname === "/notifications") return "Notifications";
    if (pathname === "/account") return "Profile & Security";
    if (pathname.startsWith("/admin")) return "Administration";
    return "CuraVeris";
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-30 h-[60px] bg-white border-b border-border-subtle flex items-center justify-between px-4 sm:px-6 select-none">
      {/* Left: Mobile Menu Trigger + Current Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={openMobileNav}
          className="lg:hidden p-1.5 -ml-1.5 text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-md transition-colors focus:outline-none"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" strokeWidth={2} />
        </button>
        <h1 className="font-heading font-semibold text-base sm:text-lg text-text-primary tracking-tight">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* DPDP Trust Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-success-bg border border-success/20 rounded-full text-xs font-medium text-success">
          <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>DPDP 2023 Protected</span>
        </div>

        {/* Quick Check a Bill Button */}
        <Link
          href="/bills/upload"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-accent-light text-brand-accent hover:bg-brand-accent/20 rounded-md text-xs font-semibold transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Check a Bill</span>
        </Link>

        {/* Notification Bell */}
        <Link
          href="/notifications"
          aria-label="Notifications"
          className="relative w-9 h-9 rounded-md bg-bg-secondary text-text-secondary hover:bg-border-default hover:text-text-primary flex items-center justify-center transition-colors"
        >
          <Bell className="w-4 h-4" strokeWidth={1.5} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* User Avatar Menu */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              aria-label="User profile menu"
              className="w-8 h-8 rounded-full bg-brand-primary text-white text-xs font-heading font-semibold flex items-center justify-center hover:opacity-90 transition-opacity focus:outline-none cursor-pointer"
            >
              {user?.full_name?.charAt(0).toUpperCase() || "U"}
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="w-56 bg-white rounded-lg p-1.5 shadow-lg border border-border-subtle z-50 text-left animate-in fade-in-80 zoom-in-95 duration-100"
            >
              <div className="px-3 py-2 border-b border-border-subtle mb-1">
                <p className="text-sm font-semibold text-text-primary truncate">
                  {user?.full_name || "Patient Account"}
                </p>
                <p className="text-xs text-text-secondary truncate">{user?.email}</p>
              </div>

              <DropdownMenu.Item asChild>
                <Link
                  href="/account"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-text-primary rounded-md hover:bg-bg-secondary cursor-pointer transition-colors focus:outline-none"
                >
                  <UserIcon className="w-4 h-4 text-text-secondary" strokeWidth={1.5} />
                  <span>Profile & Security</span>
                </Link>
              </DropdownMenu.Item>

              <DropdownMenu.Item asChild>
                <Link
                  href="/bills"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-text-primary rounded-md hover:bg-bg-secondary cursor-pointer transition-colors focus:outline-none"
                >
                  <Receipt className="w-4 h-4 text-text-secondary" strokeWidth={1.5} />
                  <span>My Bills</span>
                </Link>
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="h-px bg-border-subtle my-1" />

              <DropdownMenu.Item
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-danger rounded-md hover:bg-danger-bg cursor-pointer transition-colors focus:outline-none"
              >
                <LogOut className="w-4 h-4 text-danger" strokeWidth={1.5} />
                <span>Sign Out</span>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
};


