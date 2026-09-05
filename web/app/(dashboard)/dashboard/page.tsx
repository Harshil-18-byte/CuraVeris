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
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SkeletonStat, SkeletonCard, SkeletonText } from "@/components/ui/Skeleton";
import { BillTable } from "@/components/bills/BillTable";
import { CountUp } from "@/components/ui/CountUp";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency, formatTimeAgo } from "@/lib/utils";
import OnboardingChecklist from "@/components/onboarding/OnboardingChecklist";
import OverchargeChart from "@/components/dashboard/OverchargeChart";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  const greetingTimeOfDay = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 0 && hour <= 11) return "morning";
    if (hour >= 12 && hour <= 16) return "afternoon";
    return "evening";
  }, []);

  const billsQuery = useQuery({
    queryKey: ["bills", "summary"],
    queryFn: () => api.bills.list({ page: 1, per_page: 5 }),
    staleTime: 30 * 1000,
  });

  const statsQuery = useQuery({
    queryKey: ["user-stats"],
    queryFn: () => api.users.getStats(),
    staleTime: 60 * 1000,
  });

  const meQuery = useQuery({
    queryKey: ["user-me-full"],
    queryFn: () => api.users.getMe(),
    staleTime: 60 * 1000,
  });

  const notificationsQuery = useQuery({
    queryKey: ["notifications", "preview"],
    queryFn: () => api.notifications.list({ page: 1, per_page: 5 }),
    staleTime: 30 * 1000,
  });

  const bills = billsQuery.data?.items ?? [];
  const stats = statsQuery.data;
  const totalBills = stats?.bills_total ?? billsQuery.data?.total ?? 0;
  const auditsComplete = stats?.audits_complete ?? bills.filter((b) => b.processing_status === "COMPLETED").length;
  const totalOvercharge = stats?.total_overcharge_found ?? bills.reduce(
    (sum, b) => sum + (b.total_overcharge ?? 0),
    0
  );
  const docsGenerated = stats?.documents_generated ?? auditsComplete;
  const notifications = notificationsQuery.data?.items ?? [];

  const currentDateFormatted = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <PageShell>
      {/* Top Greeting Section (Pastel Hero Banner) */}
      <div className="curaveris-hero-card p-6 sm:p-8 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.04)] relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 bg-white/80 rounded-full text-[11px] font-bold text-[#202128] border border-black/[0.06] flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#43A8B2]" />
              Patient Forensic Portal
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#202128] tracking-tight">
            Good {greetingTimeOfDay},{" "}
            {user?.full_name ? (
              user.full_name.split(" ")[0]
            ) : (
              <SkeletonText width="w-24" className="inline-block h-6 align-middle" />
            )}
          </h1>
          <p className="text-xs sm:text-sm text-[#606470] mt-1 font-medium">{currentDateFormatted}</p>
        </div>

        <Link href="/bills/upload">
          <button
            type="button"
            className="h-11 px-6 bg-[#202128] hover:bg-black text-white font-bold text-xs rounded-full shadow-md flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <UploadCloud className="w-4 h-4" strokeWidth={2.2} />
            <span>Check a Hospital Bill</span>
          </button>
        </Link>
      </div>

      {/* DEMO ACCOUNT FEATURES SECTION */}
      <div className="mb-8 p-6 rounded-[28px] bg-gradient-to-br from-[#DBF1F4]/40 via-white to-[#EDF0FB]/40 border border-[#43A8B2]/30 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#43A8B2] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-lg text-[#202128]">
                Interactive Demo Account Features
              </h2>
              <p className="text-xs text-[#606470]">
                Explore all forensic audit, legal dispute, and financial risk tools with our pre-loaded real-world hospital dataset.
              </p>
            </div>
          </div>
          <span className="self-start sm:self-auto px-3.5 py-1 bg-[#DBF1F4] text-[#202128] rounded-full text-xs font-bold border border-[#43A8B2]/30 shadow-2xs">
            Live Demo Mode
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
          {/* Feature 1: Forensic Audit */}
          <Link
            href="/bills/11111111-1111-1111-1111-111111111111/audit"
            className="p-4 bg-white rounded-2xl border border-black/[0.06] hover:border-[#43A8B2] hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-[#43A8B2] uppercase tracking-wider">
                  Audit Report
                </span>
                <ShieldCheck className="w-4 h-4 text-[#43A8B2] group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-heading font-bold text-sm text-[#202128] group-hover:text-[#43A8B2] transition-colors">
                ₹18,576 Overcharges Found
              </h3>
              <p className="text-[11px] text-[#606470] mt-1 leading-relaxed">
                See 5 violations: NPPA stent cap violation, CGHS echocardiogram rate, and IRDAI non-payables.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#202128] mt-3 group-hover:underline">
              <span>View Audit Findings</span>
              <ArrowRight className="w-3 h-3 text-[#43A8B2]" />
            </span>
          </Link>

          {/* Feature 2: Legal Letters */}
          <Link
            href="/bills/11111111-1111-1111-1111-111111111111/documents"
            className="p-4 bg-white rounded-2xl border border-black/[0.06] hover:border-[#43A8B2] hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-[#43A8B2] uppercase tracking-wider">
                  Legal Notices
                </span>
                <FileText className="w-4 h-4 text-[#43A8B2] group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-heading font-bold text-sm text-[#202128] group-hover:text-[#43A8B2] transition-colors">
                6 Printable Complaint Letters
              </h3>
              <p className="text-[11px] text-[#606470] mt-1 leading-relaxed">
                Generate ready-to-file notices for Hospital Management, Anti-Detention, Ombudsman, and Consumer Court.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#202128] mt-3 group-hover:underline">
              <span>Generate Notices</span>
              <ArrowRight className="w-3 h-3 text-[#43A8B2]" />
            </span>
          </Link>

          {/* Feature 3: Financial Risk & FRM */}
          <Link
            href="/bills/11111111-1111-1111-1111-111111111111/risk"
            className="p-4 bg-white rounded-2xl border border-black/[0.06] hover:border-[#43A8B2] hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-[#43A8B2] uppercase tracking-wider">
                  Financial Modeling
                </span>
                <TrendingUp className="w-4 h-4 text-[#43A8B2] group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-heading font-bold text-sm text-[#202128] group-hover:text-[#43A8B2] transition-colors">
                Monte Carlo VaR & Stress Tests
              </h3>
              <p className="text-[11px] text-[#606470] mt-1 leading-relaxed">
                Simulate 10,000 scenarios, insolvency horizon, Expected Loss (PD × LGD × EAD), and liquidity gaps.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#202128] mt-3 group-hover:underline">
              <span>Open FRM Analytics</span>
              <ArrowRight className="w-3 h-3 text-[#43A8B2]" />
            </span>
          </Link>

          {/* Feature 4: Evidence Certificate */}
          <Link
            href="/bills/11111111-1111-1111-1111-111111111111/evidence"
            className="p-4 bg-white rounded-2xl border border-black/[0.06] hover:border-[#43A8B2] hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-[#43A8B2] uppercase tracking-wider">
                  Legal Evidence
                </span>
                <ShieldCheck className="w-4 h-4 text-[#43A8B2] group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-heading font-bold text-sm text-[#202128] group-hover:text-[#43A8B2] transition-colors">
                Section 65B Certificate
              </h3>
              <p className="text-[11px] text-[#606470] mt-1 leading-relaxed">
                Verify cryptographic SHA-256 Merkle root and court-admissible audit seal.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#202128] mt-3 group-hover:underline">
              <span>Verify Evidence</span>
              <ArrowRight className="w-3 h-3 text-[#43A8B2]" />
            </span>
          </Link>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {billsQuery.isLoading ? (
          <>
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
          </>
        ) : billsQuery.isError ? (
          <div className="col-span-full">
            <Card padding="md">
              <p className="text-sm font-bold text-danger">Failed to load dashboard metrics</p>
              <Button size="sm" variant="secondary" onClick={() => billsQuery.refetch()} className="mt-2 rounded-full">
                Retry
              </Button>
            </Card>
          </div>
        ) : (
          <>
            {/* Stat 1 */}
            <Card variant="bento" padding="sm" className="p-5 bg-white border border-black/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-3xl">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#606470] uppercase tracking-wider">
                  Bills Checked
                </span>
                <div className="w-10 h-10 rounded-2xl bg-[#EDF0FB] flex items-center justify-center p-2 text-[#43A8B2]">
                  <FileStack className="w-5 h-5" strokeWidth={2} />
                </div>
              </div>
              <p className="font-heading font-extrabold text-3xl text-[#202128] mt-3">
                <CountUp end={totalBills} />
              </p>
              <span className="text-[11px] text-[#606470] mt-1 block font-medium">Total submitted</span>
            </Card>

            {/* Stat 2 */}
            <Card variant="bento" padding="sm" className="p-5 bg-white border border-black/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-3xl">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#606470] uppercase tracking-wider">
                  Audits Complete
                </span>
                <div className="w-10 h-10 rounded-2xl bg-[#DBF1F4] flex items-center justify-center p-2 text-[#43A8B2]">
                  <ShieldCheck className="w-5 h-5" strokeWidth={2} />
                </div>
              </div>
              <p className="font-heading font-extrabold text-3xl text-[#202128] mt-3">
                <CountUp end={auditsComplete} />
              </p>
              <span className="text-[11px] text-[#606470] mt-1 block font-medium">800+ price caps verified</span>
            </Card>

            {/* Stat 3 */}
            <Card variant="bento" padding="sm" className="p-5 bg-white border border-black/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-3xl">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#606470] uppercase tracking-wider">
                  Detected Overcharges
                </span>
                <div className="w-10 h-10 rounded-2xl bg-[#FEE2E2] flex items-center justify-center p-2 text-[#DC2626]">
                  <IndianRupee className="w-5 h-5" strokeWidth={2} />
                </div>
              </div>
              <p className="font-mono font-extrabold text-3xl text-[#DC2626] mt-3">
                {formatCurrency(totalOvercharge)}
              </p>
              <span className="text-[11px] text-[#606470] mt-1 block font-medium">Above statutory limits</span>
            </Card>

            {/* Stat 4 */}
            <Card variant="bento" padding="sm" className="p-5 bg-white border border-black/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-3xl">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#606470] uppercase tracking-wider">
                  Dispute Documents
                </span>
                <div className="w-10 h-10 rounded-2xl bg-[#DBF1F4] flex items-center justify-center p-2 text-[#43A8B2]">
                  <FileText className="w-5 h-5" strokeWidth={2} />
                </div>
              </div>
              <p className="font-heading font-extrabold text-3xl text-[#202128] mt-3">
                <CountUp end={docsGenerated} />
              </p>
              <span className="text-[11px] text-[#606470] mt-1 block font-medium">Section 65B certified</span>
            </Card>
          </>
        )}
      </div>

      {/* Monthly Overcharges Trends Chart */}
      <div className="bg-white border border-black/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-3xl p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="font-heading font-bold text-base sm:text-lg text-[#202128]">
              Overcharges Found by Month
            </h2>
            <p className="text-xs text-[#606470] mt-0.5">
              How much you have recovered and identified across monthly hospital bills
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#43A8B2] bg-[#DBF1F4]/60 px-3 py-1 rounded-full">
            <TrendingUp className="w-3.5 h-3.5" />
            Statutory Recovery
          </span>
        </div>
        <OverchargeChart data={stats?.monthly_trend} />
      </div>

      {/* Main Grid: Left Column 65% / Right Column 35% */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Recent Bills) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-base sm:text-lg text-[#202128]">
              Recent Hospital Bills
            </h2>
            {totalBills > 0 && (
              <Link href="/bills">
                <Button variant="ghost" size="sm" className="text-xs text-[#606470] hover:text-[#202128]">
                  See all
                  <ArrowRight className="w-3.5 h-3.5 ml-1" strokeWidth={2} />
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
          <h2 className="font-heading font-bold text-base sm:text-lg text-[#202128]">
            Live Forensic Activity
          </h2>

          <Card padding="md" className="space-y-3 bg-white border border-black/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            {notificationsQuery.isLoading ? (
              <div className="space-y-3">
                <SkeletonCard className="p-3" />
                <SkeletonCard className="p-3" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-[#606470] space-y-2">
                <Bell className="w-8 h-8 mx-auto opacity-40 text-[#606470]" strokeWidth={1.5} />
                <p className="text-xs font-bold text-[#202128]">No recent updates</p>
                <p className="text-[11px] text-[#606470]">You will receive instant notifications when bills finish scanning.</p>
              </div>
            ) : (
              <div className="divide-y divide-black/[0.05]">
                {notifications.slice(0, 5).map((notif) => (
                  <div key={notif.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#EDF0FB] text-[#202128] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#202128] truncate">
                        {notif.title}
                      </p>
                      <p className="text-[11px] text-[#606470] line-clamp-2 mt-0.5">
                        {notif.body}
                      </p>
                      <span className="text-[10px] text-[#606470] block mt-1">
                        {formatTimeAgo(notif.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-black/[0.06] text-center">
              <Link
                href="/notifications"
                className="text-xs font-bold text-[#43A8B2] hover:text-[#202128] inline-flex items-center gap-1.5"
              >
                <span>View all notifications</span>
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
