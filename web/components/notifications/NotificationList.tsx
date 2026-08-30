"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, ShieldAlert, CheckCircle2, Bell, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatTimeAgo, cn } from "@/lib/utils";
import { Notification } from "@/types";
import { api } from "@/lib/api";
import { useNotificationStore } from "@/store/notificationStore";

interface NotificationListProps {
  initialNotifications: Notification[];
  total: number;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  initialNotifications,
  total,
}) => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const { fetchUnreadCount } = useNotificationStore();

  const filtered = notifications.filter((n) => (filter === "unread" ? !n.is_read : true));

  const handleMarkAsRead = async (notif: Notification) => {
    if (!notif.is_read) {
      try {
        await api.notifications.markRead(notif.id);
        setNotifications((prev) =>
          prev.map((item) => (item.id === notif.id ? { ...item, is_read: true } : item))
        );
        fetchUnreadCount();
      } catch {
        // Ignored
      }
    }

    if (notif.entity_type === "BILL" && notif.entity_id) {
      router.push(`/bills/${notif.entity_id}`);
    } else if (notif.entity_type === "AUDIT" && notif.entity_id) {
      router.push(`/bills`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
      fetchUnreadCount();
    } catch {
      // Ignored
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "AUDIT_COMPLETED":
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case "STATUTORY_VIOLATION":
        return <ShieldAlert className="w-5 h-5 text-danger" />;
      case "BILL_PROCESSING_FAILED":
        return <AlertTriangle className="w-5 h-5 text-danger" />;
      case "BILL_UPLOADED":
      default:
        return <FileText className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-badge transition-colors",
              filter === "all"
                ? "bg-primary text-white"
                : "bg-white border border-neutral-300 text-neutral-600 hover:bg-neutral-50"
            )}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-badge transition-colors",
              filter === "unread"
                ? "bg-primary text-white"
                : "bg-white border border-neutral-300 text-neutral-600 hover:bg-neutral-50"
            )}
          >
            Unread ({notifications.filter((n) => !n.is_read).length})
          </button>
        </div>

        <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
          Mark All as Read
        </Button>
      </div>

      {/* List Container */}
      <div className="bg-white rounded-card shadow-card border border-neutral-300 divide-y divide-neutral-300">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-neutral-600">
            <Bell className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
            <p className="font-semibold text-neutral-900">No notifications</p>
            <p className="text-xs text-neutral-600 mt-1">You are all caught up!</p>
          </div>
        ) : (
          filtered.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleMarkAsRead(notif)}
              className={cn(
                "p-4 flex items-start gap-3.5 hover:bg-neutral-50 cursor-pointer transition-colors",
                !notif.is_read && "bg-primary-surface/30"
              )}
            >
              <div className="w-10 h-10 rounded-lg bg-white border border-neutral-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                {getEventIcon(notif.event_type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-heading font-semibold text-sm text-neutral-900 truncate">
                    {notif.title}
                  </h4>
                  <span className="text-[11px] text-neutral-600 whitespace-nowrap">
                    {formatTimeAgo(notif.created_at)}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 mt-0.5 font-body line-clamp-2">
                  {notif.body}
                </p>
              </div>
              {!notif.is_read && (
                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
