"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import * as Tabs from "@radix-ui/react-tabs";
import {
  ArrowLeft,
  Download,
  AlertTriangle,
  FileCheck2,
  TrendingDown,
  PieChart as PieChartIcon,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SkeletonCard, SkeletonText } from "@/components/ui/Skeleton";
import { InlineError } from "@/components/ui/InlineError";
import { FindingsTable } from "@/components/audit/FindingsTable";
import { RiskGauge } from "@/components/audit/RiskGauge";
import { ShapChart } from "@/components/audit/ShapChart";
import { CertificateCard } from "@/components/evidence/CertificateCard";
import PayButton from "@/components/payment/PayButton";
import { Star } from "lucide-react";
import { api, hospitalsApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AuditReportPage() {
  const params = useParams();
  const billId = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";
  const [activeTab, setActiveTab] = useState<string>("findings");
  const [rating, setRating] = useState<number>(0);
  const [ratedSuccess, setRatedSuccess] = useState(false);

  // Fetch Bill
  const billQuery = useQuery({
    queryKey: ["bill", billId],
    queryFn: () => api.bills.getById(billId),
    enabled: !!billId,
    staleTime: 30 * 1000,
  });

  // Fetch Audit
  const auditQuery = useQuery({
    queryKey: ["audit", billId],
    queryFn: () => api.audit.getReport(billId),
    enabled: !!billId,
    staleTime: 30 * 1000,
  });

  // Fetch Evidence
  const evidenceQuery = useQuery({
    queryKey: ["evidence", billId],
    queryFn: () => api.evidence.getByBillId(billId),
    enabled: !!billId,
    staleTime: 30 * 1000,
  });

  // Fetch FRM Assessment
  const frmQuery = useQuery({
    queryKey: ["frm", billId],
    queryFn: () => api.frm.getAssessment(billId),
    enabled: !!billId,
    staleTime: 30 * 1000,
    retry: false,
  });

  const bill = billQuery.data;
  const audit = auditQuery.data;
  const evidence = evidenceQuery.data;
  const assessment = frmQuery.data;

  if (auditQuery.isLoading || billQuery.isLoading) {
    return (
      <PageShell
        title={<SkeletonText width="md" className="h-8" />}
        description="Loading your results…"
      >
        <div className="space-y-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </PageShell>
    );
  }

  if (auditQuery.isError || !audit) {
    const is404 = (auditQuery.error as any)?.status === 404;
    return (
      <PageShell
        title={is404 ? "Report not found" : "Could not load report"}
        description="Could not load details for this bill check."
        action={
          <Link href="/bills">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1.5" strokeWidth={1.5} />
              Back to Your Bills
            </Button>
          </Link>
        }
      >
        <Card padding="lg" className="text-center py-12 bg-white border border-black/[0.06] shadow-sm">
          {is404 ? (
            <div className="space-y-3 max-w-sm mx-auto">
              <h2 className="font-heading font-bold text-lg text-[#202128]">
                Report not ready yet
              </h2>
              <p className="text-xs text-[#606470]">
                Your bill is still being checked. Please check back in a moment.
              </p>
              <div className="pt-3">
                <Link href={`/bills/${billId}`}>
                  <Button size="sm" variant="primary" className="rounded-full bg-[#202128] text-white hover:bg-black">
                    View Bill Progress
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <InlineError
              title="Failed to load report"
              message={(auditQuery.error as any)?.message || "Please check your connection and try again."}
              onRetry={() => auditQuery.refetch()}
            />
          )}
        </Card>
      </PageShell>
    );
  }

  const findings = audit.findings || [];
  const riskLabel = audit.risk_label || "LOW";

  const getRiskBannerStyle = (label: string) => {
    switch (label) {
      case "CRITICAL":
        return "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]";
      case "HIGH":
        return "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]";
      case "MEDIUM":
        return "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]";
      default:
        return "bg-[#DBF1F4] text-[#202128] border-[#79C5CD]/30";
    }
  };

  const getRiskBannerText = (label: string) => {
    switch (label) {
      case "CRITICAL":
        return "Very High Concern · Major overcharges found. We recommend disputing these charges before paying.";
      case "HIGH":
        return "High Concern · Multiple charges found above government-approved price limits.";
      case "MEDIUM":
        return "Some Concern · A few charges appear higher than standard rates.";
      default:
        return "Low Concern · All charges look reasonable and within government price limits.";
    }
  };

  return (
    <PageShell>
      {/* 1. HEADER SECTION */}
      <div className="curaveris-hero-card p-6 mb-4 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-4">
        {/* Top Breadcrumb Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#606470] mb-1 font-semibold">
              <Link href="/bills" className="hover:text-[#202128] transition-colors">
                Your Bills
              </Link>
              <span>/</span>
              <span className="text-[#202128] font-bold">Bill Results</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl text-[#202128] tracking-tight">
              {bill?.hospital_name || "Hospital Bill Check Results"}
            </h1>
            <p className="text-xs text-[#606470] mt-0.5 font-medium">
              {bill?.admission_date ? `Stay: ${formatDate(bill.admission_date)}` : ""}{" "}
              {bill?.discharge_date ? `– ${formatDate(bill.discharge_date)}` : ""} · Scheme:{" "}
              {bill?.insurance_type || "Self Pay"}
            </p>
          </div>

          {/* Metric Chips in Row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white px-4 py-2.5 rounded-2xl border border-black/[0.06] text-right shadow-xs">
              <span className="text-[10px] font-bold uppercase text-[#606470] block">
                Total Bill
              </span>
              <span className="font-mono font-bold text-sm text-[#202128]">
                {formatCurrency(bill?.total_billed_amount)}
              </span>
            </div>

            <div className="bg-white px-4 py-2.5 rounded-2xl border border-black/[0.06] text-right shadow-xs">
              <span className="text-[10px] font-bold uppercase text-[#606470] block">
                Extra Charged
              </span>
              <span className="font-mono font-extrabold text-sm text-[#DC2626]">
                {formatCurrency(audit.total_overcharge_deterministic)}
              </span>
            </div>

            <div className="bg-white px-4 py-2.5 rounded-2xl border border-black/[0.06] text-right shadow-xs">
              <span className="text-[10px] font-bold uppercase text-[#606470] block">
                Questionable Items
              </span>
              <span className="font-heading font-extrabold text-sm text-[#202128]">
                {audit.finding_count || findings.length}
              </span>
            </div>
          </div>
        </div>

        {/* Risk Level Banner Strip */}
        <div
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 border shadow-xs ${getRiskBannerStyle(
            riskLabel
          )}`}
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
          <span>{getRiskBannerText(riskLabel)}</span>
        </div>
      </div>

      {/* 2. RADIX TABS */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        {/* Tab Bar Header */}
        <Tabs.List className="bg-[#EDF0FB] rounded-full p-1.5 flex gap-2 overflow-x-auto select-none border border-black/[0.03]">
          <Tabs.Trigger
            value="findings"
            className="h-10 px-5 text-xs font-bold rounded-full text-[#606470] data-[state=active]:text-[#202128] data-[state=active]:bg-[#DBF1F4] data-[state=active]:shadow-xs hover:text-[#202128] transition-all flex items-center gap-2 focus:outline-none"
          >
            <AlertTriangle className="w-4 h-4" strokeWidth={2} />
            <span>Overcharges Found</span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#FEE2E2] text-[#DC2626]">
              {findings.length}
            </span>
          </Tabs.Trigger>

          <Tabs.Trigger
            value="assessment"
            className="h-10 px-5 text-xs font-bold rounded-full text-[#606470] data-[state=active]:text-[#202128] data-[state=active]:bg-[#DBF1F4] data-[state=active]:shadow-xs hover:text-[#202128] transition-all flex items-center gap-2 focus:outline-none"
          >
            <ShieldCheck className="w-4 h-4" strokeWidth={2} />
            <span>Our Assessment</span>
          </Tabs.Trigger>

          <Tabs.Trigger
            value="financial"
            className="h-10 px-5 text-xs font-bold rounded-full text-[#606470] data-[state=active]:text-[#202128] data-[state=active]:bg-[#DBF1F4] data-[state=active]:shadow-xs hover:text-[#202128] transition-all flex items-center gap-2 focus:outline-none"
          >
            <TrendingDown className="w-4 h-4" strokeWidth={2} />
            <span>Financial Impact</span>
          </Tabs.Trigger>

          <Tabs.Trigger
            value="evidence"
            className="h-10 px-5 text-xs font-bold rounded-full text-[#606470] data-[state=active]:text-[#202128] data-[state=active]:bg-[#DBF1F4] data-[state=active]:shadow-xs hover:text-[#202128] transition-all flex items-center gap-2 focus:outline-none"
          >
            <Lock className="w-4 h-4" strokeWidth={2} />
            <span>Proof Document</span>
          </Tabs.Trigger>
        </Tabs.List>

        {/* TAB 1: FINDINGS */}
        <Tabs.Content value="findings" className="focus:outline-none animate-in fade-in-50 duration-150 space-y-6">
          <FindingsTable findings={findings} billId={billId} />

          {/* Pay Undisputed Amount Action */}
          <PayButton
            billId={billId}
            undisputedAmount={Math.max(
              0,
              (Number(bill?.total_billed_amount) || 0) -
                (Number(audit?.total_overcharge_deterministic) || 0)
            )}
          />

          {/* Hospital Transparency Rating Prompt */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-heading font-bold text-sm text-[#202128]">
                  How was your billing experience at {bill?.hospital_name || "this hospital"}?
                </p>
                <p className="text-xs text-[#606470] mt-0.5">
                  Your rating helps build community transparency scores for Indian healthcare providers.
                </p>
              </div>

              {ratedSuccess ? (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                  ✓ Rating submitted. Thank you!
                </span>
              ) : (
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={async () => {
                        setRating(star);
                        try {
                          await hospitalsApi.rateHospital({
                            bill_id: billId,
                            score: star,
                          });
                          setRatedSuccess(true);
                        } catch {
                          setRatedSuccess(true);
                        }
                      }}
                      className="p-1 text-[#D1D5DB] hover:text-[#FBBF24] transition-colors"
                      title={`Rate ${star} star`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? "fill-[#FBBF24] text-[#FBBF24]"
                            : "hover:fill-[#FDE68A] hover:text-[#FBBF24]"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Tabs.Content>

        {/* TAB 2: ASSESSMENT */}
        <Tabs.Content value="assessment" className="focus:outline-none animate-in fade-in-50 duration-150">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 40%: Score Dial */}
            <div className="lg:col-span-5">
              <Card padding="none" className="bg-white border border-black/[0.06] shadow-sm">
                <RiskGauge
                  score={audit.risk_score}
                  label={audit.risk_label}
                  uncertaintyLower={audit.uncertainty_lower}
                  uncertaintyUpper={audit.uncertainty_upper}
                />
              </Card>
            </div>

            {/* Right 60%: Factors */}
            <div className="lg:col-span-7">
              <Card padding="none" className="bg-white border border-black/[0.06] shadow-sm">
                <ShapChart shapValues={audit.shap_values} />
              </Card>
            </div>
          </div>
        </Tabs.Content>

        {/* TAB 3: FINANCIAL RISK */}
        <Tabs.Content value="financial" className="focus:outline-none animate-in fade-in-50 duration-150">
          <Card padding="lg" className="text-center py-12 max-w-lg mx-auto space-y-4 bg-white border border-black/[0.06] shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#DBF1F4] text-[#202128] flex items-center justify-center mx-auto shadow-xs">
              <TrendingDown className="w-6 h-6 text-[#43A8B2]" strokeWidth={2} />
            </div>

            <div>
              <h3 className="font-heading font-extrabold text-lg text-[#202128]">
                Understand what this bill means for your savings
              </h3>
              <p className="text-xs text-[#606470] mt-1 max-w-sm mx-auto font-medium">
                We calculate your realistic risk of loss, ability to pay without distress, and test 5 what-if situations.
              </p>
            </div>

            <div className="pt-2">
              <Link href={`/bills/${billId}/risk`}>
                <Button variant="primary" size="md" className="rounded-full px-6 bg-[#202128] hover:bg-black text-white font-bold">
                  View Full Financial Risk Analysis →
                </Button>
              </Link>
            </div>
          </Card>
        </Tabs.Content>

        {/* TAB 4: EVIDENCE CERTIFICATE */}
        <Tabs.Content value="evidence" className="focus:outline-none animate-in fade-in-50 duration-150">
          {evidence ? (
            <CertificateCard evidence={evidence} billId={billId} />
          ) : (
            <Card padding="lg" className="text-center py-12 bg-white border border-black/[0.06] shadow-sm">
              <FileCheck2 className="w-10 h-10 text-[#606470] mx-auto" strokeWidth={1.5} />
              <h3 className="font-heading font-bold text-base text-[#202128] mt-3">
                Proof Certificate Generating
              </h3>
              <p className="text-xs text-[#606470] mt-1">
                Your tamper-evident Section 65B certificate is being generated.
              </p>
            </Card>
          )}
        </Tabs.Content>
      </Tabs.Root>
    </PageShell>
  );
}
