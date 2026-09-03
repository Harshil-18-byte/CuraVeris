"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Lock,
  ArrowRight,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { formatTimeAgo } from "@/lib/utils";
import { Notification } from "@/types";

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: () => api.notifications.list({ page: 1, per_page: 50 }),
    staleTime: 15 * 1000,
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.notifications.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markOneReadMutation = useMutation({
    mutationFn: (id: string) => api.notifications.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const items = notificationsData?.items || [];
  const unreadCount = items.filter((n) => !n.is_read).length;

  const filteredItems = items.filter((n) => {
    if (filter === "UNREAD") return !n.is_read;
    return true;
  });

  const getEventIcon = (type?: string) => {
    switch (type) {
      case "AUDIT_COMPLETED":
        return (
          <div className="w-9 h-9 rounded-full bg-success-bg text-success flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
          </div>
        );
      case "HIGH_RISK_DETECTED":
        return (
          <div className="w-9 h-9 rounded-full bg-danger-bg text-danger flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4" strokeWidth={1.5} />
          </div>
        );
      case "SECURITY_ALERT":
        return (
          <div className="w-9 h-9 rounded-full bg-warning-bg text-warning flex items-center justify-center flex-shrink-0">
            <Lock className="w-4 h-4" strokeWidth={1.5} />
          </div>
        );
      case "EVIDENCE_SEALED":
        return (
          <div className="w-9 h-9 rounded-full bg-brand-accent-light text-brand-accent flex items-center justify-center flex-shrink-0">
            <FileCheck2 className="w-4 h-4" strokeWidth={1.5} />
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-full bg-bg-secondary text-text-secondary flex items-center justify-center flex-shrink-0">
            <Bell className="w-4 h-4" strokeWidth={1.5} />
          </div>
        );
    }
  };

  return (
    <PageShell
      title="Notifications & Updates"
      description="Updates about your bills, completed checks, and ready complaint letters."
      action={
        unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            isLoading={markAllReadMutation.isPending}
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-success" strokeWidth={1.5} />
            Mark all as read
          </Button>
        )
      }
    >
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
            filter === "ALL"
              ? "bg-brand-primary text-white font-semibold"
              : "bg-white text-text-secondary hover:bg-bg-secondary border border-border-subtle"
          }`}
        >
          All ({items.length})
        </button>

        <button
          onClick={() => setFilter("UNREAD")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
            filter === "UNREAD"
              ? "bg-brand-primary text-white font-semibold"
              : "bg-white text-text-secondary hover:bg-bg-secondary border border-border-subtle"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : filteredItems.length === 0 ? (
          <Card padding="lg" className="text-center py-12 space-y-3">
            <Bell className="w-10 h-10 text-border-default mx-auto" strokeWidth={1.5} />
            <h3 className="font-heading font-semibold text-base text-text-primary">
              No notifications right now
            </h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto font-normal">
              {filter === "UNREAD"
                ? "You have caught up on all your notifications."
                : "When we finish checking your bills or find new updates, you'll see them here."}
            </p>
          </Card>
        ) : (
          filteredItems.map((n) => {
            const isUnread = !n.is_read;

            return (
              <Card
                key={n.id}
                padding="sm"
                className={`transition-all duration-150 hover:bg-bg-secondary cursor-pointer ${
                  isUnread ? "bg-white border-brand-accent/30 shadow-xs" : "bg-white/80 opacity-90"
                }`}
                onClick={() => {
                  if (isUnread) markOneReadMutation.mutate(n.id);
                }}
              >
                <div className="flex items-start gap-3.5">
                  {getEventIcon(n.event_type)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={`text-sm text-text-primary ${
                          isUnread ? "font-semibold" : "font-medium"
                        }`}
                      >
                        {n.title}
                      </h4>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-brand-accent flex-shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                      {n.body}
                    </p>

                    <div className="flex items-center gap-4 mt-2 text-[11px] text-text-tertiary">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" strokeWidth={1.5} />
                        {formatTimeAgo(n.created_at)}
                      </span>

                      {n.link && (
                        <Link
                          href={n.link}
                          className="text-brand-accent font-medium hover:underline inline-flex items-center gap-1"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </PageShell>
  );
}
