"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { FileStack, ShieldCheck, IndianRupee, FileText, UploadCloud, ArrowRight, BarChart3 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SkeletonCard, SkeletonRow, SkeletonText } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { InlineError } from "@/components/ui/InlineError";
import { BillTable } from "@/components/bills/BillTable";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  // Time-of-day greeting calculation
  const greetingTimeOfDay = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 0 && hour <= 11) return "morning";
    if (hour >= 12 && hour <= 16) return "afternoon";
    return "evening";
  }, []);

  // Query 1: Bills summary
  const billsQuery = useQuery({
    queryKey: ["bills", "summary"],
    queryFn: () => api.bills.list({ page: 1, per_page: 5 }),
    staleTime: 30 * 1000,
  });

  // Query 2: Unread notifications
  const notificationsQuery = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => api.notifications.getUnreadCount(),
    staleTime: 30 * 1000,
  });

  // Computed Real Metrics
  const bills = billsQuery.data?.items ?? [];
  const totalBills = billsQuery.data?.total ?? 0;
  const auditsComplete = bills.filter((b) => b.processing_status === "COMPLETED").length;
  const totalOvercharge = bills.reduce(
    (sum, b) => sum + (b.total_overcharge ?? 0),
    0
  );

  // Grouped findings by category for chart (from real completed bills)
  const chartData = useMemo(() => {
    const categoryCounts: Record<string, number> = {};
    bills.forEach((b) => {
      if (b.total_overcharge && b.total_overcharge > 0) {
        const cat = b.hospital_name || "General Facility";
        categoryCounts[cat] = (categoryCounts[cat] || 0) + b.total_overcharge;
      }
    });

    return Object.entries(categoryCounts).map(([name, amount]) => ({
      name,
      amount,
    }));
  }, [bills]);

  return (
    <PageShell
      title={
        user?.full_name ? (
          `Good ${greetingTimeOfDay}, ${user.full_name.split(" ")[0]}`
        ) : (
          <SkeletonText width="md" className="h-8" />
        )
      }
      description="Automated statutory healthcare billing verification and Section 65B legal evidence dashboard."
      action={
        <Link href="/bills/upload">
          <Button size="md">
            <UploadCloud className="w-4 h-4 mr-2" />
            Upload Bill
          </Button>
        </Link>
      }
    >
      {/* 4 Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {billsQuery.isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : billsQuery.isError ? (
          <div className="col-span-full">
            <InlineError
              title="Failed to load dashboard metrics"
              message={(billsQuery.error as any)?.message || "Unable to reach server."}
              onRetry={() => billsQuery.refetch()}
            />
          </div>
        ) : (
          <>
            <Card padding="md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Bills Uploaded
                </span>
                <div className="w-9 h-9 rounded-lg bg-primary-surface text-primary flex items-center justify-center">
                  <FileStack className="w-5 h-5" />
                </div>
              </div>
              <p className="font-heading font-bold text-3xl text-neutral-900 mt-2">
                {totalBills}
              </p>
              <span className="text-xs text-neutral-600 block mt-1">Total submitted invoices</span>
            </Card>

            <Card padding="md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Audits Completed
                </span>
                <div className="w-9 h-9 rounded-lg bg-success-surface text-success flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <p className="font-heading font-bold text-3xl text-neutral-900 mt-2">
                {auditsComplete}
              </p>
              <span className="text-xs text-neutral-600 block mt-1">Statutorily sealed records</span>
            </Card>

            <Card padding="md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Overcharges Flagged
                </span>
                <div className="w-9 h-9 rounded-lg bg-danger-surface text-danger flex items-center justify-center">
                  <IndianRupee className="w-5 h-5" />
                </div>
              </div>
              <p className="font-mono font-bold text-3xl text-danger mt-2">
                {formatCurrency(totalOvercharge)}
              </p>
              <span className="text-xs text-neutral-600 block mt-1">Confirmed excess fees</span>
            </Card>

            <Card padding="md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Dispute Petitions
                </span>
                <div className="w-9 h-9 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-300 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <p className="font-heading font-bold text-3xl text-neutral-900 mt-2">
                {auditsComplete}
              </p>
              <span className="text-xs text-neutral-600 block mt-1">Section 65B legal notices</span>
            </Card>
          </>
        )}
      </div>

      {/* Real Overcharge Distribution Chart Section */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-lg text-neutral-900">
              Overcharge Recoveries by Healthcare Provider
            </h2>
            <p className="text-xs text-neutral-600 mt-0.5">
              Live aggregated statutory overcharge recovery opportunities
            </p>
          </div>
        </div>

        {chartData.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="Not enough data yet to show chart"
            description="Upload hospital bills and run automated audits to generate overcharge visualizations."
            action={{
              label: "Upload Bill",
              href: "/bills/upload",
            }}
          />
        ) : (
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#4A4A6A" }} />
                <YAxis
                  tick={{ fontSize: 12, fill: "#4A4A6A" }}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  formatter={(val: number) => [formatCurrency(val), "Flagged Overcharge"]}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #C8C8D8",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill="#922B21" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Recent Bills Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-xl text-neutral-900">
            Recent Hospital Invoices
          </h2>
          {totalBills > 0 && (
            <Link
              href="/bills"
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              <span>View All Bills ({totalBills})</span>
              <ArrowRight className="w-3.5 h-3.5" />
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
    </PageShell>
  );
}
