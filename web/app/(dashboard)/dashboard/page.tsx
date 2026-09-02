"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  FileStack,
  ShieldCheck,
  IndianRupee,
  FileText,
  UploadCloud,
  ArrowRight,
  Bell,
  Clock,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SkeletonStat, SkeletonCard } from "@/components/ui/Skeleton";
import { BillTable } from "@/components/bills/BillTable";
import { CountUp } from "@/components/ui/CountUp";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency, formatTimeAgo } from "@/lib/utils";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  const greetingTimeOfDay = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 0 && hour <= 11) return "morning";
    if (hour >= 12 && hour <= 16) return "afternoon";
    return "evening";
  }, []);

  // Fetch Bills summary
  const billsQuery = useQuery({
    queryKey: ["bills", "summary"],
    queryFn: () => api.bills.list({ page: 1, per_page: 5 }),
    staleTime: 30 * 1000,
  });

  // Fetch Notifications preview
  const notificationsQuery = useQuery({
    queryKey: ["notifications", "preview"],
    queryFn: () => api.notifications.list({ page: 1, per_page: 5 }),
    staleTime: 30 * 1000,
  });

  const bills = billsQuery.data?.items ?? [];
  const totalBills = billsQuery.data?.total ?? 0;
  const auditsComplete = bills.filter((b) => b.processing_status === "COMPLETED").length;
  const totalOvercharge = bills.reduce(
    (sum, b) => sum + (b.total_overcharge ?? 0),
    0
  );
  const notifications = notificationsQuery.data?.items ?? [];

  const currentDateFormatted = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <PageShell>
      {/* Top Greeting Section */}
      <div className="bg-white rounded-lg border border-border-subtle p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
        <div>
          <h1 className="font-heading font-bold text-2xl text-text-primary tracking-tight">
            Good {greetingTimeOfDay}, {user?.full_name ? user.full_name.split(" ")[0] : "there"}
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">{currentDateFormatted}</p>
        </div>

        <Link href="/bills/upload">
          <Button variant="primary" size="md">
            <UploadCloud className="w-4 h-4 mr-2" strokeWidth={1.5} />
            Check a Bill
          </Button>
        </Link>
      </div>

      {/* Stat Cards Row (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {billsQuery.isLoading ? (
          <>
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
          </>
        ) : (
          <>
            {/* Stat 1 */}
            <Card variant="stat" padding="sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                  Bills Checked
                </span>
                <FileStack className="w-4 h-4 text-text-tertiary" strokeWidth={1.5} />
              </div>
              <p className="font-heading font-bold text-3xl text-text-primary mt-3">
                <CountUp end={totalBills} />
              </p>
              <span className="text-xs text-text-secondary mt-1 block">Total submitted</span>
            </Card>

            {/* Stat 2 */}
            <Card variant="stat" padding="sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                  Checks Finished
                </span>
                <ShieldCheck className="w-4 h-4 text-text-tertiary" strokeWidth={1.5} />
              </div>
              <p className="font-heading font-bold text-3xl text-text-primary mt-3">
                <CountUp end={auditsComplete} />
              </p>
              <span className="text-xs text-text-secondary mt-1 block">Bills completed</span>
            </Card>

            {/* Stat 3 */}
            <Card variant="stat" padding="sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                  Possible Extra Charges
                </span>
                <IndianRupee className="w-4 h-4 text-danger" strokeWidth={1.5} />
              </div>
              <p className="font-mono font-bold text-3xl text-danger mt-3">
                {formatCurrency(totalOvercharge)}
              </p>
              <span className="text-xs text-text-secondary mt-1 block">Identified above government rates</span>
            </Card>

            {/* Stat 4 */}
            <Card variant="stat" padding="sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                  Complaint Letters
                </span>
                <FileText className="w-4 h-4 text-text-tertiary" strokeWidth={1.5} />
              </div>
              <p className="font-heading font-bold text-3xl text-text-primary mt-3">
                <CountUp end={auditsComplete} />
              </p>
              <span className="text-xs text-text-secondary mt-1 block">Ready to send</span>
            </Card>
          </>
        )}
      </div>

      {/* Main Grid: Left Column 65% / Right Column 35% */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Recent Bills) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-semibold text-base text-text-primary">
              Your Recent Bills
            </h2>
            {totalBills > 0 && (
              <Link href="/bills">
                <Button variant="ghost" size="sm">
                  See all
                  <ArrowRight className="w-3.5 h-3.5 ml-1" strokeWidth={1.5} />
                </Button>
              </Link>
            )}
          </div>

          <BillTable
            bills={bills}
            isLoading={billsQuery.isLoading}
            isError={billsQuery.isError}
            errorMessage={(billsQuery.error as any)?.message}
            onRetry={() => billsQuery.refetch()}
          />
        </div>

        {/* Right Column (Recent Activity) */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="font-heading font-semibold text-base text-text-primary">
            Recent Activity
          </h2>

          <Card padding="md" className="space-y-3">
            {notificationsQuery.isLoading ? (
              <div className="space-y-3">
                <SkeletonCard className="p-3" />
                <SkeletonCard className="p-3" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-text-tertiary space-y-2">
                <Bell className="w-7 h-7 mx-auto opacity-40" strokeWidth={1.5} />
                <p className="text-xs font-medium text-text-secondary">No recent updates</p>
                <p className="text-[11px]">We&apos;ll notify you when bill checks complete.</p>
              </div>
            ) : (
              <div className="divide-y divide-border-subtle">
                {notifications.slice(0, 5).map((notif) => (
                  <div key={notif.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-bg-secondary text-text-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text-primary truncate">
                        {notif.title}
                      </p>
                      <p className="text-[11px] text-text-secondary line-clamp-2 mt-0.5">
                        {notif.body}
                      </p>
                      <span className="text-[10px] text-text-tertiary block mt-1">
                        {formatTimeAgo(notif.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-border-subtle text-center">
              <Link
                href="/notifications"
                className="text-xs font-medium text-brand-accent hover:underline inline-flex items-center gap-1"
              >
                <span>View all notifications</span>
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
