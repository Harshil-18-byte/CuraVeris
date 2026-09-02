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
          <div className="w-9 h-9 rounded-full bg-danger-bg text-danger flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4" strokeWidth={1.5} />
          </div>
        );
      case "MEDIUM":
        return (
          <div className="w-9 h-9 rounded-full bg-warning-bg text-warning flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4" strokeWidth={1.5} />
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-full bg-success-bg text-success flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
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
        return "Above government cap";
      case "DPCO_OVERCHARGE":
        return "Over medicine price cap";
      case "CGHS_PACKAGE_UNBUNDLED":
      case "DUPLICATE_CHARGE":
        return "Double charge";
      case "CONSUMER_PROTECTION_VIOLATION":
        return "Unfair extra fee";
      default:
        return "Not on price list";
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Item Description",
      "Finding Type",
      "Severity",
      "Billed Amount (INR)",
      "Benchmark Rate (INR)",
      "Overcharge Amount (INR)",
      "Statutory Reference",
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
      <div className="p-12 text-center bg-white rounded-lg border border-border-subtle shadow-xs space-y-3">
        <CheckCircle2 className="w-10 h-10 text-success mx-auto" strokeWidth={1.5} />
        <h3 className="font-heading font-semibold text-base text-text-primary">
          No extra charges found
        </h3>
        <p className="text-sm text-text-secondary max-w-sm mx-auto">
          All charges on this bill appear reasonable and within government price limits.
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
            {findings.length} overcharges found
          </Badge>
          <div className="px-3 py-1 bg-bg-secondary border border-border-subtle rounded-full text-xs font-semibold text-text-primary">
            Total extra: {formatCurrency(totalOvercharge)}
          </div>
        </div>

        <Button variant="secondary" size="sm" onClick={handleExportCSV}>
          <Download className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
          Export CSV
        </Button>
      </div>

      {/* Info Notice */}
      <div className="p-3.5 bg-info-bg border border-info/20 rounded-lg text-xs text-text-secondary flex items-start gap-2.5">
        <Info className="w-4 h-4 text-info flex-shrink-0 mt-0.5" strokeWidth={1.5} />
        <span>
          The confirmed overcharges below are based on official government rules (NPPA, CGHS, DPCO). You can include them in your formal complaint letter.
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
              className="cursor-pointer transition-all duration-150 hover:shadow-md"
              onClick={() => toggleExpand(f.id)}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Left Section */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {getSeverityIcon(f.severity)}

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-sm text-text-primary truncate">
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
                          AI estimate
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary pt-0.5">
                      <span>
                        Hospital charged:{" "}
                        <strong className="font-mono text-text-primary">
                          {formatCurrency(f.billed_amount)}
                        </strong>
                      </span>
                      <span>
                        Government price:{" "}
                        <strong className="font-mono text-text-primary">
                          {formatCurrency(f.benchmark_amount)}
                        </strong>
                      </span>
                    </div>

                    {f.statutory_reference && (
                      <p className="text-[11px] text-text-tertiary italic">
                        Rule: {f.statutory_reference}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Section */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pl-12 sm:pl-0">
                  <div className="text-right">
                    <span className="text-[11px] text-text-tertiary uppercase block">
                      Extra Charged
                    </span>
                    <span className="font-mono font-bold text-lg text-danger">
                      +{formatCurrency(f.overcharge_amount)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-text-tertiary text-xs">
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
                <div className="mt-4 pt-4 border-t border-border-subtle space-y-3 text-xs animate-in fade-in-50 duration-150">
                  <div>
                    <span className="font-semibold text-text-primary block mb-0.5">
                      Why this charge is unfair:
                    </span>
                    <p className="text-text-secondary leading-relaxed">
                      {f.user_explanation ||
                        f.legal_basis ||
                        "This charge exceeds the prescribed maximum rate or constitutes a duplicate fee under applicable regulations."}
                    </p>
                  </div>

                  <div className="p-3 bg-bg-secondary rounded-md text-text-secondary">
                    <span className="font-semibold text-text-primary block mb-0.5">
                      In simple terms:
                    </span>
                    <p>
                      The hospital charged you more than what the official guidelines allow for this item. You have the right to request a refund or bill correction.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={(e) => toggleDisputeSelection(f.id, e)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        isSelected
                          ? "bg-success-bg text-success border border-success/30"
                          : "bg-brand-accent-light text-brand-accent hover:bg-brand-accent/15"
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>{isSelected ? "Added to complaint letter" : "Add to my complaint letter"}</span>
                    </button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Findings Total Summary Box */}
      <div className="p-5 bg-white rounded-lg border border-border-subtle shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs text-text-tertiary uppercase font-semibold tracking-wider block">
            Total Confirmed Extra Charges
          </span>
          <p className="text-xs text-text-secondary mt-0.5">
            Eligible for reimbursement or hospital dispute
          </p>
        </div>
        <p className="font-mono font-bold text-2xl text-danger">
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
          <Button variant="primary" size="lg" className="w-full">
            <FileText className="w-4 h-4 mr-2" strokeWidth={1.5} />
            Create My Complaint Letter
          </Button>
        </a>
      </div>
    </div>
  );
};
