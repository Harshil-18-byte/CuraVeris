"use client";

import React, { useEffect, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { NotificationList } from "@/components/notifications/NotificationList";
import { api } from "@/lib/api";
import { Notification } from "@/types";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await api.notifications.list({ page: 1, per_page: 50 });
        setNotifications(res.items);
        setTotal(res.total);
      } catch {
        // Ignored
      } finally {
        setIsLoading(false);
      }
    }
    loadNotifications();
  }, []);

  return (
    <PageShell
      title="Notifications"
      description="Stay informed on audit completions, statutory overcharges, and processing status updates."
    >
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-neutral-600">Loading notifications…</p>
        </div>
      ) : (
        <NotificationList initialNotifications={notifications} total={total} />
      )}
    </PageShell>
  );
}
