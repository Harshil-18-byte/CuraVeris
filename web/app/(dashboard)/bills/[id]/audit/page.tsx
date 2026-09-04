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
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AuditReportPage() {
  const params = useParams();
  const billId = params.id as string;
  const [activeTab, setActiveTab] = useState<string>("findings");

  // Fetch Bill
  const billQuery = useQuery({
    queryKey: ["bill", billId],
    queryFn: () => api.bills.getById(billId),
    staleTime: 30 * 1000,
  });

  // Fetch Audit
  const auditQuery = useQuery({
    queryKey: ["audit", billId],
    queryFn: () => api.audit.getReport(billId),
    staleTime: 30 * 1000,
  });

  // Fetch Evidence
  const evidenceQuery = useQuery({
    queryKey: ["evidence", billId],
    queryFn: () => api.evidence.getByBillId(billId),
    staleTime: 30 * 1000,
  });

  // Fetch FRM Assessment
  const frmQuery = useQuery({
    queryKey: ["frm", billId],
    queryFn: () => api.frm.getAssessment(billId),
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
        <Card padding="lg" className="text-center py-12">
          {is404 ? (
            <div className="space-y-3 max-w-sm mx-auto">
              <h2 className="font-heading font-bold text-lg text-text-primary">
                Report not ready yet
              </h2>
              <p className="text-xs text-text-secondary">
                Your bill is still being checked. Please check back in a moment.
              </p>
              <div className="pt-3">
                <Link href={`/bills/${billId}`}>
                  <Button size="sm" variant="primary">
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
        return "bg-danger text-white border-danger";
      case "HIGH":
        return "bg-danger-bg text-danger border-l-4 border-l-danger text-text-primary";
      case "MEDIUM":
        return "bg-warning-bg text-[#92400E] border-l-4 border-l-warning text-text-primary";
      default:
        return "bg-success-bg text-success border-l-4 border-l-success text-text-primary";
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
      <div className="bg-gradient-to-b from-[#111520]/90 to-[#0A0D14]/95 rounded-3xl border border-white/[0.08] p-6 mb-4 shadow-2xl space-y-4 backdrop-blur-xl">
        {/* Top Breadcrumb Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
              <Link href="/bills" className="hover:text-cyan-400 transition-colors">
                Your Bills
              </Link>
              <span>/</span>
              <span className="text-neutral-300">Bill Results</span>
            </div>
            <h1 className="font-heading font-bold text-2xl text-white tracking-tight">
              {bill?.hospital_name || "Hospital Bill Check Results"}
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              {bill?.admission_date ? `Stay: ${formatDate(bill.admission_date)}` : ""}{" "}
              {bill?.discharge_date ? `– ${formatDate(bill.discharge_date)}` : ""} · Scheme:{" "}
              {bill?.insurance_type || "Self Pay"}
            </p>
          </div>

          {/* Metric Chips in Row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/5 px-4 py-2.5 rounded-2xl border border-white/10 text-right">
              <span className="text-[10px] font-semibold uppercase text-neutral-400 block">
                Total Bill
              </span>
              <span className="font-mono font-bold text-sm text-white">
                {formatCurrency(bill?.total_billed_amount)}
              </span>
            </div>

            <div className="bg-white/5 px-4 py-2.5 rounded-2xl border border-white/10 text-right">
              <span className="text-[10px] font-semibold uppercase text-neutral-400 block">
                Extra Charged
              </span>
              <span className="font-mono font-bold text-sm text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.4)]">
                {formatCurrency(audit.total_overcharge_deterministic)}
              </span>
            </div>

            <div className="bg-white/5 px-4 py-2.5 rounded-2xl border border-white/10 text-right">
              <span className="text-[10px] font-semibold uppercase text-neutral-400 block">
                Questionable Items
              </span>
              <span className="font-heading font-bold text-sm text-white">
                {audit.finding_count || findings.length}
              </span>
            </div>
          </div>
        </div>

        {/* Risk Level Banner Strip */}
        <div
          className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 border ${getRiskBannerStyle(
            riskLabel
          )}`}
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
          <span>{getRiskBannerText(riskLabel)}</span>
        </div>
      </div>

      {/* 2. RADIX TABS */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        {/* Tab Bar Header */}
        <Tabs.List className="bg-[#0B0E17]/80 rounded-2xl border border-white/[0.08] p-1.5 flex gap-2 overflow-x-auto select-none shadow-xl backdrop-blur-xl">
          <Tabs.Trigger
            value="findings"
            className="h-10 px-4 text-xs font-semibold rounded-xl text-neutral-400 data-[state=active]:text-black data-[state=active]:bg-white data-[state=active]:shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:text-white transition-all flex items-center gap-2 focus:outline-none"
          >
            <AlertTriangle className="w-4 h-4" strokeWidth={1.5} />
            <span>Overcharges Found</span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-500/20 text-red-400">
              {findings.length}
            </span>
          </Tabs.Trigger>

          <Tabs.Trigger
            value="assessment"
            className="h-10 px-4 text-xs font-semibold rounded-xl text-neutral-400 data-[state=active]:text-black data-[state=active]:bg-white data-[state=active]:shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:text-white transition-all flex items-center gap-2 focus:outline-none"
          >
            <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
            <span>Our Assessment</span>
          </Tabs.Trigger>

          <Tabs.Trigger
            value="financial"
            className="h-10 px-4 text-xs font-semibold rounded-xl text-neutral-400 data-[state=active]:text-black data-[state=active]:bg-white data-[state=active]:shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:text-white transition-all flex items-center gap-2 focus:outline-none"
          >
            <TrendingDown className="w-4 h-4" strokeWidth={1.5} />
            <span>Financial Impact</span>
          </Tabs.Trigger>

          <Tabs.Trigger
            value="evidence"
            className="h-10 px-4 text-xs font-semibold rounded-xl text-neutral-400 data-[state=active]:text-black data-[state=active]:bg-white data-[state=active]:shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:text-white transition-all flex items-center gap-2 focus:outline-none"
          >
            <Lock className="w-4 h-4" strokeWidth={1.5} />
            <span>Proof Document</span>
          </Tabs.Trigger>
        </Tabs.List>

        {/* TAB 1: FINDINGS */}
        <Tabs.Content value="findings" className="focus:outline-none animate-in fade-in-50 duration-150">
          <FindingsTable findings={findings} billId={billId} />
        </Tabs.Content>

        {/* TAB 2: ASSESSMENT */}
        <Tabs.Content value="assessment" className="focus:outline-none animate-in fade-in-50 duration-150">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 40%: Score Dial */}
            <div className="lg:col-span-5">
              <Card padding="none">
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
              <Card padding="none">
                <ShapChart shapValues={audit.shap_values} />
              </Card>
            </div>
          </div>
        </Tabs.Content>

        {/* TAB 3: FINANCIAL RISK */}
        <Tabs.Content value="financial" className="focus:outline-none animate-in fade-in-50 duration-150">
          <Card padding="lg" className="text-center py-12 max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-cyan-400 flex items-center justify-center mx-auto shadow-inner">
              <TrendingDown className="w-6 h-6" strokeWidth={1.5} />
            </div>

            <div>
              <h3 className="font-heading font-bold text-lg text-white">
                Understand what this bill means for your savings
              </h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto font-normal">
                We calculate your realistic risk of loss, ability to pay without distress, and test 5 what-if situations.
              </p>
            </div>

            <div className="pt-2">
              <Link href={`/bills/${billId}/risk`}>
                <Button variant="primary" size="md" className="rounded-full px-6">
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
            <Card padding="lg" className="text-center py-12">
              <FileCheck2 className="w-10 h-10 text-neutral-500 mx-auto" strokeWidth={1.5} />
              <h3 className="font-heading font-semibold text-base text-white mt-3">
                Proof Certificate Generating
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Your tamper-evident Section 65B certificate is being generated.
              </p>
            </Card>
          )}
        </Tabs.Content>
      </Tabs.Root>
    </PageShell>
  );
}
