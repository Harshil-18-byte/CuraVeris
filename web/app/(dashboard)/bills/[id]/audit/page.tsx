"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import * as Tabs from "@radix-ui/react-tabs";
import {
  ArrowLeft,
  FileText,
  Scale,
  Cpu,
  ShieldCheck,
  Download,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SkeletonCard, SkeletonText } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { InlineError } from "@/components/ui/InlineError";
import { AuditSummary } from "@/components/audit/AuditSummary";
import { FindingsTable } from "@/components/audit/FindingsTable";
import { RiskGauge } from "@/components/audit/RiskGauge";
import { ShapChart } from "@/components/audit/ShapChart";
import { CertificateCard } from "@/components/evidence/CertificateCard";
import { api } from "@/lib/api";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

export default function AuditReportPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const billId = params.id as string;
  const initialTab = searchParams.get("tab") || "summary";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [findingsPage, setFindingsPage] = useState(1);

  // Query 1: Bill details
  const billQuery = useQuery({
    queryKey: ["bill", billId],
    queryFn: () => api.bills.getById(billId),
    staleTime: 30 * 1000,
  });

  // Query 2: Audit data
  const auditQuery = useQuery({
    queryKey: ["audit", billId],
    queryFn: () => api.audits.getByBillId(billId),
    staleTime: 30 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.status === 404) return false;
      return failureCount < 2;
    },
  });

  // Query 3: Audit findings (paginated)
  const findingsQuery = useQuery({
    queryKey: ["findings", billId, findingsPage],
    queryFn: () =>
      api.audits.getFindings(billId, {
        page: findingsPage,
        per_page: 50,
      }),
    enabled: !!auditQuery.data?.id,
    staleTime: 30 * 1000,
  });

  // Query 4: Cryptographic Evidence record
  const evidenceQuery = useQuery({
    queryKey: ["evidence", billId],
    queryFn: () => api.evidence.getByBillId(billId),
    enabled: !!auditQuery.data?.id,
    staleTime: 30 * 1000,
  });

  const bill = billQuery.data;
  const audit = auditQuery.data;
  const findings = findingsQuery.data?.items || audit?.findings || [];
  const evidence = evidenceQuery.data;

  if (auditQuery.isLoading) {
    return (
      <PageShell
        title={<SkeletonText width="md" className="h-8" />}
        description="Retrieving statutory audit results and cryptographic certificates…"
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
        title="Audit Status"
        description="Statutory audit and ML inference report."
        action={
          <Link href={`/bills/${billId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Processing Timeline
            </Button>
          </Link>
        }
      >
        <Card padding="lg" className="text-center py-12">
          {is404 ? (
            <EmptyState
              icon={Clock}
              title="Audit in progress"
              description="Your bill is being audited against CGHS, NPPA, DPCO and IRDAI price gazettes. This usually takes 1–3 minutes."
              action={{
                label: "Check Progress Tracker",
                href: `/bills/${billId}`,
              }}
            />
          ) : (
            <InlineError
              title="Failed to load audit report"
              message={(auditQuery.error as any)?.message || "Could not retrieve audit record from server."}
              onRetry={() => auditQuery.refetch()}
            />
          )}
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={`Audit Report: ${bill?.hospital_name || "Hospital Invoice"}`}
      description={`Statutory Gazette Engine v${audit.statutory_ref_version || "1.0"} · Completed on ${formatDate(audit.completed_at)}`}
      action={
        <div className="flex items-center gap-3">
          <Link href={`/bills/${billId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Processing Timeline
            </Button>
          </Link>
          <a
            href={`/api/v1/legal-docs/bills/${billId}/dispute-notice`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm">
              <Download className="w-4 h-4 mr-1.5" />
              Download Dispute Notice
            </Button>
          </a>
        </div>
      }
    >
      {/* High-Level Overview Card */}
      <Card padding="lg" accentColor="danger" className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div>
          <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block">
            Billed Amount
          </span>
          <p className="font-mono font-bold text-xl text-neutral-900 mt-1">
            {formatCurrency(bill?.total_billed_amount ?? audit.total_billed)}
          </p>
          <span className="text-xs text-neutral-600 mt-0.5 block">Total Hospital Gross</span>
        </div>

        <div>
          <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block">
            Statutory Overcharge
          </span>
          <p className="font-mono font-bold text-2xl text-danger mt-1">
            {formatCurrency(audit.total_overcharge_deterministic)}
          </p>
          <span className="text-xs text-danger font-semibold mt-0.5 block">Legally Recoverable</span>
        </div>

        <div>
          <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block">
            Infractions Flagged
          </span>
          <p className="font-heading font-bold text-xl text-neutral-900 mt-1">
            {audit.finding_count ?? findings.length} Items
          </p>
          <span className="text-xs text-neutral-600 mt-0.5 block">Price Gazette Violations</span>
        </div>

        <div className="sm:text-right">
          <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block">
            Ensemble Risk Level
          </span>
          <div className="mt-1 flex sm:justify-end">
            <Badge
              variant={
                audit.risk_label === "CRITICAL" || audit.risk_label === "HIGH"
                  ? "danger"
                  : audit.risk_label === "MEDIUM"
                  ? "warning"
                  : "success"
              }
              size="md"
            >
              {audit.risk_label || "LOW"} RISK
            </Badge>
          </div>
          <span className="text-xs text-neutral-600 mt-1 block">
            Score: {audit.risk_score !== null && audit.risk_score !== undefined ? `${Math.round(Number(audit.risk_score) * 100)}%` : "—"}
          </span>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <Tabs.List className="flex items-center gap-2 border-b border-neutral-300 pb-px overflow-x-auto">
          <Tabs.Trigger
            value="summary"
            className={cn(
              "px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap",
              activeTab === "summary"
                ? "border-primary text-primary"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            )}
          >
            <FileText className="w-4 h-4" />
            <span>Summary</span>
          </Tabs.Trigger>

          <Tabs.Trigger
            value="findings"
            className={cn(
              "px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap",
              activeTab === "findings"
                ? "border-primary text-primary"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            )}
          >
            <Scale className="w-4 h-4" />
            <span>Statutory Findings ({audit.finding_count ?? findings.length})</span>
          </Tabs.Trigger>

          <Tabs.Trigger
            value="ai-analysis"
            className={cn(
              "px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap",
              activeTab === "ai-analysis"
                ? "border-primary text-primary"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            )}
          >
            <Cpu className="w-4 h-4" />
            <span>AI Risk & SHAP Analysis</span>
          </Tabs.Trigger>

          <Tabs.Trigger
            value="evidence"
            className={cn(
              "px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap",
              activeTab === "evidence"
                ? "border-primary text-primary"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            )}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Section 65B Evidence</span>
          </Tabs.Trigger>
        </Tabs.List>

        {/* Tab 1: Summary */}
        <Tabs.Content value="summary" className="focus:outline-none">
          <AuditSummary audit={audit} />
        </Tabs.Content>

        {/* Tab 2: Findings */}
        <Tabs.Content value="findings" className="focus:outline-none">
          <FindingsTable
            findings={findings}
            isLoading={findingsQuery.isLoading}
          />
        </Tabs.Content>

        {/* Tab 3: AI Analysis */}
        <Tabs.Content value="ai-analysis" className="focus:outline-none space-y-6">
          <div className="p-4 bg-warning-surface border border-warning/20 rounded-card flex items-start gap-3 text-sm text-warning">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="font-body">
              This predictive AI risk assessment evaluates statistical anomalies and billing fragmentation. It is non-binding. Statutory infractions listed in the Findings tab represent legally binding gazette breaches.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-4">
              {audit.risk_score !== null && audit.risk_score !== undefined ? (
                <RiskGauge
                  score={Number(audit.risk_score)}
                  label={audit.risk_label || "LOW"}
                  lowerBound={Number(audit.uncertainty_lower ?? 0)}
                  upperBound={Number(audit.uncertainty_upper ?? 0)}
                />
              ) : (
                <Card padding="lg" className="text-center py-8">
                  <p className="text-sm text-neutral-600">AI risk score not available.</p>
                </Card>
              )}
            </div>
            <div className="lg:col-span-8">
              {audit.shap_values && audit.shap_values.length > 0 ? (
                <ShapChart
                  shapValues={audit.shap_values}
                  modelVersion={audit.ml_model_version}
                />
              ) : (
                <Card padding="lg" className="text-center py-8">
                  <p className="text-sm text-neutral-600">
                    AI analysis was not available for this bill.
                  </p>
                </Card>
              )}
            </div>
          </div>
        </Tabs.Content>

        {/* Tab 4: Evidence */}
        <Tabs.Content value="evidence" className="focus:outline-none">
          {evidence ? (
            <CertificateCard evidence={evidence} billId={billId} />
          ) : (
            <Card padding="lg" className="text-center py-8">
              <p className="text-xs text-neutral-600">Sealing cryptographic evidence record…</p>
            </Card>
          )}
        </Tabs.Content>
      </Tabs.Root>
    </PageShell>
  );
}
