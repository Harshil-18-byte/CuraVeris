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
import { InlineError } from "@/components/ui/InlineError";
import { api } from "@/lib/api";
import { formatTimeAgo } from "@/lib/utils";
import { Notification } from "@/types";

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");

  const { data: notificationsData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: () => api.notifications.list({ page: 1, per_page: 50 }),
    staleTime: 15 * 1000,
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.notifications.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });

  const markOneReadMutation = useMutation({
    mutationFn: (id: string) => api.notifications.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });

  const items = notificationsData?.items || [];
  const unreadCount = items.filter((n) => !n.is_read).length;

  const filteredItems = items.filter((n) => {
    if (filter === "UNREAD") return !n.is_read;
    return true;
  });

  const getEntityLink = (n: Notification) => {
    if (n.link) return n.link;
    const type = n.entity_type?.toLowerCase();
    if (type === "bill" && n.entity_id) return `/bills/${n.entity_id}`;
    if (type === "audit" && n.entity_id) return `/bills/${n.entity_id}/audit`;
    if (type === "payment" && n.entity_id) return `/payments`;
    return null;
  };

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
            className="rounded-full"
            onClick={() => markAllReadMutation.mutate()}
            isLoading={markAllReadMutation.isPending}
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" strokeWidth={1.5} />
            Mark all as read
          </Button>
        )
      }
    >
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
            filter === "ALL"
              ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]"
              : "bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10"
          }`}
        >
          All ({items.length})
        </button>

        <button
          onClick={() => setFilter("UNREAD")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
            filter === "UNREAD"
              ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]"
              : "bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : isError ? (
          <InlineError
            title="Failed to load notifications"
            message={(error as any)?.message ?? "An error occurred fetching notifications."}
            onRetry={() => refetch()}
          />
        ) : filteredItems.length === 0 ? (
          <Card padding="lg" className="text-center py-12 space-y-3">
            <Bell className="w-10 h-10 text-neutral-500 mx-auto" strokeWidth={1.5} />
            <h3 className="font-heading font-semibold text-base text-white">
              No notifications right now
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto font-normal">
              {filter === "UNREAD"
                ? "You have caught up on all your notifications."
                : "When we finish checking your bills or find new updates, you'll see them here."}
            </p>
          </Card>
        ) : (
          filteredItems.map((n) => {
            const isUnread = !n.is_read;
            const targetLink = getEntityLink(n);

            return (
              <Card
                key={n.id}
                padding="sm"
                className={`transition-all duration-150 hover:bg-white/[0.04] cursor-pointer ${
                  isUnread ? "border-cyan-500/30 bg-cyan-950/10 shadow-lg" : "opacity-80"
                }`}
                onClick={() => {
                  if (isUnread) markOneReadMutation.mutate(n.id);
                }}
              >
                <div className="flex items-start gap-4">
                  {getEventIcon(n.event_type)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={`text-sm text-white ${
                          isUnread ? "font-semibold" : "font-medium"
                        }`}
                      >
                        {n.title}
                      </h4>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] flex-shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                      {n.body}
                    </p>

                    <div className="flex items-center gap-4 mt-2 text-[11px] text-neutral-500 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" strokeWidth={1.5} />
                        {formatTimeAgo(n.created_at)}
                      </span>

                      {targetLink && (
                        <Link
                          href={targetLink}
                          className="text-cyan-400 font-semibold hover:underline inline-flex items-center gap-1"
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
