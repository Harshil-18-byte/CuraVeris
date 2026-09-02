"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotificationStore } from "@/store/notificationStore";

export const NotificationBell: React.FC = () => {
  const { unreadCount, fetchUnreadCount } = useNotificationStore();

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  return (
    <Link
      href="/notifications"
      className="relative p-2 text-neutral-600 hover:text-brand-accent transition-colors inline-block"
      title="Notifications"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-accent text-[10px] font-bold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
};
