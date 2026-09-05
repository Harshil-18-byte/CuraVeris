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
    <header className="sticky top-0 z-30 h-[68px] bg-white/85 backdrop-blur-2xl border-b border-black/[0.05] flex items-center justify-between px-4 sm:px-8 select-none shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      {/* Left: Mobile Menu Trigger + Current Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={openMobileNav}
          className="lg:hidden p-2 -ml-2 text-neutral-600 hover:text-black hover:bg-black/[0.04] rounded-full transition-colors focus:outline-none"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" strokeWidth={2} />
        </button>
        <h1 className="font-heading font-extrabold text-lg sm:text-xl text-[#202128] tracking-tight">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* DPDP Trust Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-[#86C159]/15 border border-[#86C159]/30 rounded-full text-xs font-bold text-[#2E7D32]">
          <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
          <span>DPDP 2023 Protected</span>
        </div>

        {/* Quick Check a Bill Pill Button */}
        <Link
          href="/bills/upload"
          className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-[#202128] text-white hover:bg-[#121317] rounded-full text-xs font-bold transition-all duration-150 shadow-[0_4px_14px_rgba(32,33,40,0.15)] hover:scale-[1.02] active:scale-[0.98]"
        >
          <PlusCircle className="w-3.5 h-3.5" strokeWidth={2.2} />
          <span>Check a Bill</span>
        </Link>

        {/* Notification Bell */}
        <Link
          href="/notifications"
          aria-label="Notifications"
          className="relative w-10 h-10 rounded-full bg-white border border-black/[0.08] text-[#202128]/70 hover:text-[#202128] hover:border-black/[0.15] flex items-center justify-center transition-all duration-150 shadow-xs"
        >
          <Bell className="w-4 h-4" strokeWidth={1.75} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
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
              className="w-9 h-9 rounded-full bg-[#202128] text-white text-xs font-heading font-bold flex items-center justify-center hover:opacity-90 transition-all focus:outline-none cursor-pointer shadow-sm"
            >
              {user?.full_name?.charAt(0).toUpperCase() || "U"}
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="w-56 bg-white rounded-2xl p-2 shadow-2xl border border-black/[0.06] z-50 text-left animate-in fade-in-80 zoom-in-95 duration-100"
            >
              <div className="px-3 py-2.5 border-b border-black/[0.05] mb-1">
                <p className="text-sm font-bold text-[#202128] truncate">
                  {user?.full_name || "—"}
                </p>
                <p className="text-xs text-[#202128]/50 truncate">{user?.email || "—"}</p>
              </div>

              <DropdownMenu.Item asChild>
                <Link
                  href="/account"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#202128]/80 rounded-xl hover:bg-[#EDF0FB] hover:text-[#202128] cursor-pointer transition-colors focus:outline-none"
                >
                  <UserIcon className="w-4 h-4 text-[#202128]/50" strokeWidth={1.75} />
                  <span>Profile & Security</span>
                </Link>
              </DropdownMenu.Item>

              <DropdownMenu.Item asChild>
                <Link
                  href="/bills"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#202128]/80 rounded-xl hover:bg-[#EDF0FB] hover:text-[#202128] cursor-pointer transition-colors focus:outline-none"
                >
                  <Receipt className="w-4 h-4 text-[#202128]/50" strokeWidth={1.75} />
                  <span>My Bills</span>
                </Link>
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="h-px bg-black/[0.05] my-1" />

              <DropdownMenu.Item
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 rounded-xl hover:bg-red-50 cursor-pointer transition-colors focus:outline-none"
              >
                <LogOut className="w-4 h-4 text-red-600" strokeWidth={1.75} />
                <span>Sign Out</span>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
};
