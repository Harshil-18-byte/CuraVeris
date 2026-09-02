"use client";

import React from "react";
import { AlertTriangle, TrendingDown, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import { Audit } from "@/types";

interface AuditSummaryProps {
  audit: Audit;
}

export const AuditSummary: React.FC<AuditSummaryProps> = ({ audit }) => {
  const getRiskBadgeVariant = (label?: string | null) => {
    switch (label) {
      case "CRITICAL":
      case "HIGH":
        return "danger";
      case "MEDIUM":
        return "warning";
      default:
        return "success";
    }
  };

  const getRiskLabelText = (label?: string | null) => {
    switch (label) {
      case "CRITICAL":
        return "Very high concern";
      case "HIGH":
        return "High concern";
      case "MEDIUM":
        return "Some concern";
      default:
        return "Low concern";
    }
  };

  const findingsCount = audit.finding_count || (audit.findings ? audit.findings.length : 0);
  const totalOvercharge = audit.total_overcharge_deterministic ?? 0;

  return (
    <div className="space-y-6">
      {/* 4 Info Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Confirmed Overcharges */}
        <Card padding="sm" variant="stat">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
              Possible Extra Charges
            </span>
            <AlertTriangle className="w-4 h-4 text-danger" strokeWidth={1.5} />
          </div>
          <p className="font-mono font-bold text-3xl text-danger mt-3">
            {formatCurrency(totalOvercharge)}
          </p>
          <span className="text-xs text-text-secondary mt-1 block">Exceeding government rules</span>
        </Card>

        {/* Card 2: Questionable Line Items */}
        <Card padding="sm" variant="stat">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
              Questionable Items
            </span>
            <TrendingDown className="w-4 h-4 text-text-tertiary" strokeWidth={1.5} />
          </div>
          <p className="font-heading font-bold text-3xl text-text-primary mt-3">
            {findingsCount}
          </p>
          <span className="text-xs text-text-secondary mt-1 block">Charges flagged for dispute</span>
        </Card>

        {/* Card 3: Concern Level */}
        <Card padding="sm" variant="stat">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
              Overall Concern Level
            </span>
            <ShieldCheck className="w-4 h-4 text-text-tertiary" strokeWidth={1.5} />
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <p className="font-heading font-bold text-3xl text-text-primary">
              {Math.round((Number(audit.risk_score) || 0) * 100)}
            </p>
            <span className="text-xs text-text-tertiary">/ 100</span>
            <Badge variant={getRiskBadgeVariant(audit.risk_label)}>
              {getRiskLabelText(audit.risk_label)}
            </Badge>
          </div>
          <span className="text-xs text-text-secondary mt-1 block">Our overall assessment</span>
        </Card>

        {/* Card 4: Shadow Billing */}
        <Card padding="sm" variant="stat">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
              Duplicate Billing
            </span>
            <CheckCircle2 className="w-4 h-4 text-text-tertiary" strokeWidth={1.5} />
          </div>
          <div className="mt-3">
            <Badge variant={audit.shadow_bill_detected ? "danger" : "success"} size="md">
              {audit.shadow_bill_detected ? "Detected" : "None Found"}
            </Badge>
          </div>
          <span className="text-xs text-text-secondary mt-1 block">
            {audit.shadow_bill_detected
              ? "Items billed both separately & in package"
              : "No duplicate package charges"}
          </span>
        </Card>
      </div>
    </div>
  );
};
