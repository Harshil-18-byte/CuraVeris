"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldAlert,
  ArrowRight,
  Calculator,
  TrendingDown,
  AlertTriangle,
  Info,
  CheckCircle2,
  PieChart as PieChartIcon,
  Layers,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";

import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SkeletonCard, SkeletonText } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

const LOSS_DISTRIBUTION_DATA = [
  { percentile: "P10", loss: 2100, label: "Best Case" },
  { percentile: "P25", loss: 4500, label: "Optimistic" },
  { percentile: "P50", loss: 9800, label: "Median Expected" },
  { percentile: "P75", loss: 14200, label: "Moderate Risk" },
  { percentile: "P90", loss: 17100, label: "Severe Stress" },
  { percentile: "P95 (VaR)", loss: 18500, label: "95% Value at Risk" },
  { percentile: "P99 (CVaR)", loss: 24200, label: "Tail Risk" },
];

export default function FRMOverviewPage() {
  const [selectedBillId, setSelectedBillId] = useState<string>("");

  const billsQuery = useQuery({
    queryKey: ["bills", "list"],
    queryFn: () => api.bills.list(),
    staleTime: 30 * 1000,
  });

  const bills = billsQuery.data?.items ?? [];

  // Auto-select first bill if none selected
  const activeBillId = selectedBillId || (bills.length > 0 ? bills[0].id : "");
  const selectedBill = bills.find((b) => b.id === activeBillId);

  const frmQuery = useQuery({
    queryKey: ["frm", activeBillId],
    queryFn: () => api.frm.getAssessment(activeBillId),
    enabled: !!activeBillId,
    staleTime: 30 * 1000,
    retry: false,
  });

  const stressQuery = useQuery({
    queryKey: ["frm", "stress", activeBillId],
    queryFn: () => api.frm.getStressScenarios(activeBillId),
    enabled: !!activeBillId,
    staleTime: 30 * 1000,
    retry: false,
  });

  const lossDistQuery = useQuery({
    queryKey: ["frm", "loss-distribution", activeBillId],
    queryFn: () => api.frm.getLossDistribution(activeBillId),
    enabled: !!activeBillId,
    staleTime: 30 * 1000,
    retry: false,
  });

  const assessment = frmQuery.data;
  const stressScenarios = stressQuery.data ?? [];
  const lossDist = lossDistQuery.data;

  // Build histogram from real simulation
  const histogram =
    lossDist?.el_distribution_summary?.histogram ||
    assessment?.el_distribution_summary?.histogram ||
    [];

  const lossChartData = histogram.map((bin) => ({
    percentile: `₹${Math.round((bin.bin_start + bin.bin_end) / 2000)}k`,
    loss: Math.round((bin.bin_start + bin.bin_end) / 2),
    frequency: bin.frequency,
  }));

  if (billsQuery.isLoading) {
    return (
      <PageShell
        title={<SkeletonText width="md" className="h-8" />}
        description="Loading financial risk telemetry…"
      >
        <div className="space-y-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </PageShell>
    );
  }

  if (bills.length === 0) {
    return (
      <PageShell
        title="Financial Risk Management (FRM)"
        description="Monte Carlo simulations, out-of-pocket exposure modeling, and TPA insurance stress testing for inpatient bills."
      >
        <Card padding="lg" className="text-center py-16 space-y-4">
          <ShieldAlert className="w-12 h-12 text-[#43A8B2] mx-auto" strokeWidth={1.5} />
          <div>
            <h3 className="font-heading font-bold text-lg text-[#202128]">
              No bills available for financial risk analysis
            </h3>
            <p className="text-xs text-[#606470] mt-1 max-w-sm mx-auto">
              Upload your hospital bill to run Monte Carlo simulations and test insurance deduction scenarios.
            </p>
          </div>
          <Link href="/bills/upload">
            <Button variant="primary" size="md" className="rounded-full bg-[#202128] hover:bg-black text-white font-bold">
              Check a Hospital Bill
            </Button>
          </Link>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Financial Risk Management (FRM)"
      description="Monte Carlo simulations, out-of-pocket exposure modeling, and TPA insurance stress testing for inpatient bills."
      action={
        <Link href="/bills">
          <Button variant="secondary" size="sm" className="rounded-full">
            <span>View All Audited Bills</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </Link>
      }
    >
      {/* Bill Selector Bar */}
      <div className="bg-white rounded-2xl p-4 border border-black/[0.06] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[#43A8B2]" />
          <span className="text-xs font-extrabold text-[#202128]">Select Inpatient Case:</span>
        </div>
        <select
          value={activeBillId}
          onChange={(e) => setSelectedBillId(e.target.value)}
          className="bg-[#F5F7FB] border border-black/[0.08] text-xs font-bold text-[#202128] rounded-full px-4 py-2 outline-none focus:border-[#43A8B2] cursor-pointer"
        >
          {bills.map((b) => (
            <option key={b.id} value={b.id}>
              {b.hospital_name || "Hospital Bill"} — {formatCurrency(b.total_billed_amount)}
            </option>
          ))}
        </select>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#606470]">
            <span className="text-xs font-bold uppercase tracking-wider">Out-of-Pocket VaR (95%)</span>
            <Badge variant="warning">Monte Carlo</Badge>
          </div>
          <p className="text-2xl font-extrabold text-[#202128]">
            {formatCurrency(assessment?.var_95)}
          </p>
          <p className="text-[11px] text-[#606470] font-medium">
            95% statistical confidence ceiling for unreimbursed hospital deductions.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#606470]">
            <span className="text-xs font-bold uppercase tracking-wider">Expected Loss (EL)</span>
            <Badge variant="default">Baseline</Badge>
          </div>
          <p className="text-2xl font-extrabold text-[#202128]">
            {formatCurrency(assessment?.expected_loss)}
          </p>
          <p className="text-[11px] text-[#606470] font-medium">
            Weighted financial exposure after accounting for NPPA recovery probability.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#606470]">
            <span className="text-xs font-bold uppercase tracking-wider">Household LCR</span>
            <Badge variant="success">Liquidity</Badge>
          </div>
          <p className="text-2xl font-extrabold text-[#202128]">
            {assessment?.lcr !== undefined && assessment?.lcr !== null ? `${assessment.lcr}x` : "—"}
          </p>
          <p className="text-[11px] text-[#606470] font-medium">
            Liquid Coverage Ratio against pending hospital co-payments.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#606470]">
            <span className="text-xs font-bold uppercase tracking-wider">Dispute Recovery Impact</span>
            <Badge variant="info">Section 65B</Badge>
          </div>
          <p className="text-2xl font-extrabold text-[#43A8B2]">
            {formatCurrency(selectedBill?.total_overcharge)}
          </p>
          <p className="text-[11px] text-[#606470] font-medium">
            Direct liquidity restored upon hospital grievance resolution.
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-black/[0.06] shadow-xs space-y-4">
          <div>
            <h3 className="font-heading font-extrabold text-lg text-[#202128]">
              Loss Distribution (Value at Risk Simulation)
            </h3>
            <p className="text-xs text-[#606470] mt-0.5">
              10,000 Monte Carlo iterations across insurance deduction scenarios.
            </p>
          </div>

          <div className="h-64 w-full">
            {lossChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lossChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="varGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#43A8B2" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#43A8B2" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="percentile" tick={{ fontSize: 11, fill: "#606470" }} />
                  <YAxis tickFormatter={(v) => `₹${v / 1000}k`} tick={{ fontSize: 11, fill: "#606470" }} />
                  <Tooltip
                    formatter={(val: number) => [`${formatCurrency(val)}`, "Loss Exposure"]}
                    contentStyle={{ borderRadius: "16px", border: "1px solid #E5E7EB", fontSize: "12px" }}
                  />
                  <Area type="monotone" dataKey="loss" stroke="#43A8B2" strokeWidth={2.5} fillOpacity={1} fill="url(#varGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-center p-6 bg-[#F5F7FB] rounded-2xl border border-black/[0.04]">
                <p className="text-xs text-[#606470]">
                  Loss distribution data is not yet computed for this bill. Run the financial assessment to view the simulation curve.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stress Testing Scenarios */}
        <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-black/[0.06] shadow-xs space-y-4">
          <div>
            <h3 className="font-heading font-extrabold text-lg text-[#202128]">
              TPA Insurance & Hospital Stress Scenarios
            </h3>
            <p className="text-xs text-[#606470] mt-0.5">
              Dynamic stress test results under policy deduction vs legal appeal outcomes.
            </p>
          </div>

          <div className="space-y-3">
            {stressScenarios.length > 0 ? (
              stressScenarios.map((sc, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#F5F7FB] border border-black/[0.04] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#202128]">{sc.scenario_name}</span>
                    <span className={`text-xs font-mono font-bold ${sc.delta_el && sc.delta_el < 0 ? "text-[#43A8B2]" : "text-[#202128]"}`}>
                      {sc.delta_el && sc.delta_el < 0 ? `-${formatCurrency(Math.abs(sc.delta_el))} Risk` : "Baseline"}
                    </span>
                  </div>
                  <p className="text-xs text-[#606470]">{sc.description}</p>
                  <div className="flex items-center gap-4 text-[11px] font-mono text-[#606470] pt-1">
                    <span>Exposure at Default: {formatCurrency(sc.resulting_ead ?? 0)}</span>
                    <span>Default Prob: {((sc.resulting_pd ?? 0) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-[#F5F7FB] rounded-2xl border border-black/[0.04]">
                <p className="text-xs text-[#606470]">No stress scenarios generated yet for this bill.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommendations Card */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-black/[0.06] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-[#43A8B2]" />
          <h3 className="font-heading font-extrabold text-lg text-[#202128]">
            Automated Household Liquidity Recommendations
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assessment?.financial_recommendations && assessment.financial_recommendations.length > 0 ? (
            assessment.financial_recommendations.map((rec, i) => (
              <div key={i} className="p-4 rounded-2xl bg-[#DFF1F3]/40 border border-[#43A8B2]/20 space-y-1.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#43A8B2] flex-shrink-0" />
                  <span className="text-xs font-extrabold text-[#202128]">Priority {rec.priority} Action</span>
                </div>
                <p className="text-xs font-bold text-[#202128] pl-6">{rec.action}</p>
                <p className="text-[11px] text-[#606470] pl-6">{rec.rationale}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-[#606470] col-span-2">No active hardship alerts for this case.</p>
          )}
        </div>
      </div>
    </PageShell>
  );
}
