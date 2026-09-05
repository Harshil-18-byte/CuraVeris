"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Download,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Plus,
  Info,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { AuditFinding } from "@/types";

interface FindingsTableProps {
  findings: AuditFinding[];
  billId: string;
}

export const FindingsTable: React.FC<FindingsTableProps> = ({ findings, billId }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedForDispute, setSelectedForDispute] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleDisputeSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedForDispute((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalOvercharge = findings.reduce(
    (sum, f) => sum + (f.overcharge_amount ?? 0),
    0
  );

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
      case "HIGH":
        return (
          <div className="w-9 h-9 rounded-full bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4" strokeWidth={2} />
          </div>
        );
      case "MEDIUM":
        return (
          <div className="w-9 h-9 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4" strokeWidth={2} />
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-full bg-[#DBF1F4] text-[#202128] flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
          </div>
        );
    }
  };

  const getSeverityAccent = (severity: string): "danger" | "warning" | "success" => {
    switch (severity) {
      case "CRITICAL":
      case "HIGH":
        return "danger";
      case "MEDIUM":
        return "warning";
      default:
        return "success";
    }
  };

  const getFindingTypeLabel = (type: string) => {
    switch (type) {
      case "NPPA_CEILING_VIOLATION":
        return "Charged more than the government price cap for medical devices";
      case "DPCO_OVERCHARGE":
        return "Charged more than the government price cap for this medicine";
      case "CGHS_PACKAGE_UNBUNDLED":
        return "Charged more than the government rate";
      case "DUPLICATE_CHARGE":
      case "SHADOW_BILL":
        return "This item may have been charged twice";
      case "IRDAI_NON_PAYABLE":
        return "This item cannot be charged to insurance";
      case "GST_MISAPPLICATION":
        return "Tax was wrongly applied to this item";
      case "PMJAY_NON_COMPLIANT":
        return "This charge is not allowed under Ayushman Bharat";
      case "CONSUMER_PROTECTION_VIOLATION":
      default:
        return "We found a charge that breaks the rules";
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Item Description",
      "Finding Type",
      "Severity",
      "Hospital Charged (INR)",
      "Government-Approved Rate (INR)",
      "Extra You Were Charged (INR)",
      "Source",
    ];

    const rows = findings.map((f) => [
      `"${(f.item_description || "Unknown Item").replace(/"/g, '""')}"`,
      `"${f.finding_type}"`,
      f.severity,
      f.billed_amount ?? 0,
      f.benchmark_amount ?? 0,
      f.overcharge_amount ?? 0,
      `"${(f.statutory_reference || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CuraVeris_Findings_Bill_${billId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (findings.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-3">
        <CheckCircle2 className="w-10 h-10 text-[#43A8B2] mx-auto" strokeWidth={2} />
        <h3 className="font-heading font-bold text-base text-[#202128]">
          Great news — we didn&apos;t find any overcharges in this bill.
        </h3>
        <p className="text-xs text-[#606470] max-w-sm mx-auto font-medium">
          All the charges appear to be within the allowed limits.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge variant="danger" size="md">
            {findings.length} possible overcharges found
          </Badge>
          <div className="px-3.5 py-1 bg-white border border-black/[0.06] rounded-full text-xs font-bold text-[#202128] shadow-xs">
            Total extra: <span className="text-[#DC2626] font-mono">{formatCurrency(totalOvercharge)}</span>
          </div>
        </div>

        <Button variant="secondary" size="sm" onClick={handleExportCSV} className="rounded-full">
          <Download className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.75} />
          Export CSV
        </Button>
      </div>

      {/* Info Notice */}
      <div className="p-4 bg-[#DBF1F4]/40 border border-[#79C5CD]/30 rounded-2xl text-xs text-[#202128] font-medium flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#43A8B2] flex-shrink-0 mt-0.5" strokeWidth={2} />
        <span>
          The confirmed overcharges below are based on official government rules. You can include them in your formal complaint letter.
        </span>
      </div>

      {/* Findings List */}
      <div className="space-y-3">
        {findings.map((f) => {
          const isExpanded = expandedId === f.id;
          const isSelected = !!selectedForDispute[f.id];

          return (
            <Card
              key={f.id}
              variant="accent-left"
              accentColor={getSeverityAccent(f.severity)}
              padding="sm"
              className="cursor-pointer transition-all duration-200 bg-white border border-black/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md hover:scale-[1.005]"
              onClick={() => toggleExpand(f.id)}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Left Section */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {getSeverityIcon(f.severity)}

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-sm text-[#202128] truncate">
                        {f.item_description || "Billed Service / Item"}
                      </h4>
                      <Badge variant="default" size="sm">
                        {getFindingTypeLabel(f.finding_type)}
                      </Badge>
                      {f.finding_source === "DETERMINISTIC" ? (
                        <Badge variant="success" size="sm">
                          Confirmed overcharge
                        </Badge>
                      ) : (
                        <Badge variant="accent" size="sm">
                          AI-estimated risk
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#606470] pt-0.5">
                      <span>
                        Hospital charged:{" "}
                        <strong className="font-mono text-[#202128]">
                          {formatCurrency(f.billed_amount)}
                        </strong>
                      </span>
                      <span>
                        Government price:{" "}
                        <strong className="font-mono text-[#202128]">
                          {formatCurrency(f.benchmark_amount)}
                        </strong>
                      </span>
                    </div>

                    {f.statutory_reference && (
                      <p className="text-[11px] text-[#606470] italic font-mono">
                        Source: {f.statutory_reference.includes("CGHS") ? "Central Government Health Scheme rate list" : f.statutory_reference.includes("NPPA") ? "Government price cap for medical devices" : f.statutory_reference.includes("DPCO") ? "Government price cap for medicines" : "Government price list"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Section */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pl-12 sm:pl-0">
                  <div className="text-right">
                    <span className="text-[11px] text-[#606470] uppercase block font-bold">
                      Extra you were charged
                    </span>
                    <span className="font-mono font-extrabold text-lg text-[#DC2626]">
                      +{formatCurrency(f.overcharge_amount)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[#606470] text-xs font-semibold">
                    <span>{isExpanded ? "Less" : "Details"}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" strokeWidth={1.5} />
                    ) : (
                      <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Drawer Details */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-black/[0.06] space-y-3 text-xs animate-in fade-in-50 duration-150">
                  <div>
                    <span className="font-bold text-[#202128] block mb-0.5">
                      Why this is wrong:
                    </span>
                    <p className="text-[#606470] leading-relaxed">
                      {f.user_explanation ||
                        f.legal_basis ||
                        "This charge exceeds the government-allowed price or was billed twice."}
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#F5F7FB] border border-black/[0.04] rounded-2xl text-[#202128]">
                    <span className="font-bold text-[#202128] block mb-0.5">
                      In simple terms:
                    </span>
                    <p className="text-[#606470]">
                      The hospital charged you more than what government rules allow for this item. You have the right to request a refund or bill correction.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={(e) => toggleDisputeSelection(f.id, e)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-150 ${
                        isSelected
                          ? "bg-[#DBF1F4] text-[#202128] border border-[#79C5CD]/50 shadow-xs"
                          : "bg-[#EDF0FB] text-[#202128] hover:bg-[#DBF1F4]"
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>{isSelected ? "Included in complaint letter" : "Include in my complaint letter"}</span>
                    </button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Findings Total Summary Box */}
      <div className="curaveris-hero-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex items-center justify-between">
        <div>
          <span className="text-xs text-[#606470] uppercase font-bold tracking-wider block">
            Total extra charges we confirmed
          </span>
          <p className="text-xs text-[#202128] font-semibold mt-0.5">
            Eligible for refund or hospital complaint
          </p>
        </div>
        <p className="font-mono font-extrabold text-2xl text-[#DC2626]">
          {formatCurrency(totalOvercharge)}
        </p>
      </div>

      {/* Primary CTA */}
      <div className="pt-2">
        <a
          href={`/api/v1/legal-docs/bills/${billId}/dispute-notice`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="primary" size="lg" className="w-full rounded-full bg-[#202128] hover:bg-black text-white font-bold py-4 shadow-md">
            <FileText className="w-4 h-4 mr-2" strokeWidth={1.5} />
            Create My Complaint Letter
          </Button>
        </a>
      </div>
    </div>
  );
};
