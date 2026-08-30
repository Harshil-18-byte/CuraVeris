"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Download, Info, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils";
import { AuditFinding } from "@/types";

interface FindingsTableProps {
  findings: AuditFinding[];
  isLoading?: boolean;
}

export const FindingsTable: React.FC<FindingsTableProps> = ({
  findings,
  isLoading = false,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const hasMlFindings = findings.some((f) => f.finding_source === "ML");
  const totalConfirmed = findings
    .filter((f) => f.finding_source === "DETERMINISTIC")
    .reduce((sum, f) => sum + (f.overcharge_amount || 0), 0);

  const handleExportCSV = () => {
    const headers = [
      "Finding Type",
      "Source",
      "Item Description",
      "Billed Amount (INR)",
      "Benchmark Amount (INR)",
      "Overcharge (INR)",
      "Severity",
      "Statutory Reference",
      "Legal Basis",
    ];

    const rows = findings.map((f) => [
      `"${f.finding_type}"`,
      `"${f.finding_source}"`,
      `"${(f.item_description || "").replace(/"/g, '""')}"`,
      f.billed_amount || 0,
      f.benchmark_amount || 0,
      f.overcharge_amount || 0,
      `"${f.severity}"`,
      `"${(f.statutory_reference || "").replace(/"/g, '""')}"`,
      `"${(f.legal_basis || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CuraVeris_Audit_Findings_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isLoading && findings.length === 0) {
    return (
      <div className="bg-white rounded-card shadow-card border border-neutral-300">
        <EmptyState
          icon={ShieldCheck}
          title="No findings"
          description="No statutory violations were detected in this bill."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Statutory Disclaimer Notice */}
      {hasMlFindings && (
        <div className="p-4 bg-warning-surface border border-warning/20 rounded-card flex items-start gap-3 text-sm text-warning">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="font-body">
            Some items below are estimated by our AI risk ensemble. Look for the{" "}
            <span className="font-semibold text-primary">STATUTORY</span> label for confirmed, legally enforceable gazette violations.
          </p>
        </div>
      )}

      {/* Table Card Header & Export Action */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading font-bold text-lg text-neutral-900">
            Itemized Audit Findings ({findings.length})
          </h3>
          <p className="text-xs text-neutral-600">
            Click on any line item to inspect the statutory citation and grounds for legal dispute.
          </p>
        </div>
        {findings.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-1.5" />
            Export CSV
          </Button>
        )}
      </div>

      {/* Main Findings Table */}
      <div className="w-full overflow-x-auto bg-white rounded-card shadow-card border border-neutral-300">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-300 text-xs font-semibold uppercase tracking-wider text-neutral-600">
              <th className="py-3.5 px-4">Infraction Type</th>
              <th className="py-3.5 px-4">Source</th>
              <th className="py-3.5 px-4">Item Description</th>
              <th className="py-3.5 px-4 text-right">Billed</th>
              <th className="py-3.5 px-4 text-right">Benchmark</th>
              <th className="py-3.5 px-4 text-right">Overcharge</th>
              <th className="py-3.5 px-4 text-center">Severity</th>
              <th className="py-3.5 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-300 text-sm font-body">
            {isLoading ? (
              <>
                <SkeletonRow cols={8} />
                <SkeletonRow cols={8} />
                <SkeletonRow cols={8} />
              </>
            ) : (
              <>
                {findings.map((f) => {
                  const isExpanded = expandedId === f.id;
                  return (
                    <React.Fragment key={f.id}>
                      <tr
                        onClick={() => toggleRow(f.id)}
                        className="hover:bg-neutral-50/80 cursor-pointer transition-colors duration-150"
                      >
                        <td className="py-3.5 px-4 font-semibold text-neutral-900">
                          {f.finding_type.replace(/_/g, " ")}
                        </td>
                        <td className="py-3.5 px-4">
                          {f.finding_source === "DETERMINISTIC" ? (
                            <span className="px-2 py-0.5 text-[11px] font-bold rounded-badge bg-primary-surface text-primary border border-primary/20">
                              STATUTORY
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[11px] font-bold rounded-badge bg-warning-surface text-warning border border-warning/20">
                              AI ESTIMATE
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-neutral-900 max-w-[200px] truncate">
                          {f.item_description || "Hospital Charge"}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-medium text-neutral-900 whitespace-nowrap">
                          {formatCurrency(f.billed_amount)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-medium text-neutral-600 whitespace-nowrap">
                          {formatCurrency(f.benchmark_amount)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-danger whitespace-nowrap">
                          {formatCurrency(f.overcharge_amount)}
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <Badge
                            variant={
                              f.severity === "CRITICAL" || f.severity === "HIGH"
                                ? "danger"
                                : f.severity === "MEDIUM"
                                ? "warning"
                                : "success"
                            }
                          >
                            {f.severity}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right text-primary">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 inline" />
                          ) : (
                            <ChevronDown className="w-4 h-4 inline" />
                          )}
                        </td>
                      </tr>

                      {/* Expanded Statutory Details Drawer */}
                      {isExpanded && (
                        <tr className="bg-neutral-50/70 border-b border-neutral-300">
                          <td colSpan={8} className="p-5">
                            <div className="space-y-3 bg-white p-4 rounded-card border border-neutral-300">
                              <div>
                                <span className="text-xs font-bold uppercase text-neutral-600 block mb-1">
                                  Statutory Authority & Reference
                                </span>
                                <p className="text-sm font-semibold text-primary">
                                  {f.statutory_reference || "Gazette Reference"}
                                </p>
                              </div>
                              <div>
                                <span className="text-xs font-bold uppercase text-neutral-600 block mb-1">
                                  Legal Basis & Grounds for Dispute
                                </span>
                                <p className="text-xs text-neutral-900 leading-relaxed font-body">
                                  {f.legal_basis}
                                </p>
                              </div>
                              <div>
                                <span className="text-xs font-bold uppercase text-neutral-600 block mb-1">
                                  Patient Plain Explanation
                                </span>
                                <p className="text-xs text-neutral-600 leading-relaxed font-body">
                                  {f.user_explanation}
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}

                {/* Total Row */}
                <tr className="bg-neutral-50 font-bold">
                  <td
                    colSpan={5}
                    className="py-4 px-4 text-neutral-900 text-right uppercase text-xs tracking-wider"
                  >
                    Total Confirmed Statutory Overcharges:
                  </td>
                  <td className="py-4 px-4 text-right font-mono font-bold text-danger text-base whitespace-nowrap">
                    {formatCurrency(totalConfirmed)}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
