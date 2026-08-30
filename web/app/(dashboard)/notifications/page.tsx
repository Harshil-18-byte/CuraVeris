"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CheckCircle2,
  ShieldAlert,
  AlertTriangle,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { InlineError } from "@/components/ui/InlineError";
import { api } from "@/lib/api";
import { formatTimeAgo, cn } from "@/lib/utils";
import { Notification } from "@/types";

export default function NotificationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["notifications", { filter, page }],
    queryFn: () =>
      api.notifications.list({
        page,
        per_page: 20,
        filter: filter === "unread" ? "unread" : undefined,
      }),
    staleTime: 30 * 1000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.notifications.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.notifications.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });

  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 20) || 1;

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.is_read) {
      markReadMutation.mutate(notif.id);
    }

    const type = (notif.entity_type || "").toLowerCase();
    const id = notif.entity_id;

    if (type === "bill" && id) {
      router.push(`/bills/${id}`);
    } else if (type === "audit" && id) {
      router.push(`/bills/${id}/audit`);
    } else if (type === "payment") {
      router.push(`/payments`);
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
    <PageShell
      title="Notifications"
      description="Stay informed on audit completions, statutory overcharges, and processing status updates."
    >
      <div className="space-y-4">
        {/* Controls Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setFilter("all");
                setPage(1);
              }}
              className={cn(
                "px-3.5 py-1.5 text-xs font-semibold rounded-badge transition-colors",
                filter === "all"
                  ? "bg-primary text-white"
                  : "bg-white border border-neutral-300 text-neutral-600 hover:bg-neutral-50"
              )}
            >
              All
            </button>
            <button
              onClick={() => {
                setFilter("unread");
                setPage(1);
              }}
              className={cn(
                "px-3.5 py-1.5 text-xs font-semibold rounded-badge transition-colors",
                filter === "unread"
                  ? "bg-primary text-white"
                  : "bg-white border border-neutral-300 text-neutral-600 hover:bg-neutral-50"
              )}
            >
              Unread
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending || items.length === 0}
          >
            Mark All as Read
          </Button>
        </div>

        {/* Notification List Container */}
        <div className="bg-white rounded-card shadow-card border border-neutral-300 divide-y divide-neutral-300">
          {isLoading ? (
            <div className="p-8 space-y-4">
              <div className="flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 bg-neutral-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-neutral-200 rounded w-1/3" />
                  <div className="h-3 bg-neutral-200 rounded w-2/3" />
                </div>
              </div>
              <div className="flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 bg-neutral-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-neutral-200 rounded w-1/4" />
                  <div className="h-3 bg-neutral-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ) : isError ? (
            <div className="p-6">
              <InlineError
                title="Failed to load notifications"
                message={(error as any)?.message || "Could not retrieve notification updates."}
                onRetry={() => refetch()}
              />
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No notifications yet"
              description="You'll be notified here when your audits complete."
            />
          ) : (
            items.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
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

        {/* Pagination Controls */}
        {total > 20 && (
          <div className="flex items-center justify-between pt-4 border-t border-neutral-300">
            <span className="text-xs text-neutral-600">
              Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total} notifications
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
