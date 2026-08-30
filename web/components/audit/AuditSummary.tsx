import React from "react";
import { AlertTriangle, ShieldCheck, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import { Audit } from "@/types";

interface AuditSummaryProps {
  audit: Audit;
}

export const AuditSummary: React.FC<AuditSummaryProps> = ({ audit }) => {
  return (
    <div className="space-y-6">
      {/* 4 Info Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
              Total Overcharges
            </span>
            <div className="w-8 h-8 rounded-lg bg-danger-surface text-danger flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="font-mono font-bold text-2xl text-danger mt-2">
            {formatCurrency(audit.total_overcharge_deterministic)}
          </p>
          <span className="text-xs text-neutral-600 block mt-1">Confirmed statutory violations</span>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
              Violations Flagged
            </span>
            <div className="w-8 h-8 rounded-lg bg-warning-surface text-warning flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <p className="font-heading font-bold text-2xl text-neutral-900 mt-2">
            {audit.finding_count} Items
          </p>
          <span className="text-xs text-neutral-600 block mt-1">Breaching price gazettes</span>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
              Ensemble Risk Score
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary-surface text-primary flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="font-heading font-bold text-2xl text-neutral-900">
              {Math.round((audit.risk_score || 0) * 100)}%
            </p>
            <Badge
              variant={
                audit.risk_label === "CRITICAL"
                  ? "danger"
                  : audit.risk_label === "HIGH"
                  ? "warning"
                  : "success"
              }
            >
              {audit.risk_label || "LOW"}
            </Badge>
          </div>
          <span className="text-xs text-neutral-600 block mt-1">Predictive ML assessment</span>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
              Shadow Billing
            </span>
            <div className="w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-300 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="font-heading font-bold text-2xl mt-2 text-neutral-900">
            {audit.shadow_bill_detected ? "Detected" : "Clean"}
          </p>
          <span className="text-xs text-neutral-600 block mt-1">
            {audit.shadow_bill_detected
              ? "Duplicate entries identified"
              : "No duplicate charges detected"}
          </span>
        </Card>
      </div>

      {/* Recommendations Section */}
      {audit.recommendations && audit.recommendations.length > 0 && (
        <Card padding="lg">
          <h3 className="font-heading font-bold text-lg text-neutral-900 mb-4">
            Recommended Action Steps
          </h3>
          <div className="space-y-4">
            {audit.recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-3.5 pb-4 last:pb-0 border-b last:border-b-0 border-neutral-300">
                <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-heading font-bold text-xs flex-shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-heading font-semibold text-sm text-neutral-900">
                      {rec.title}
                    </h4>
                    {rec.priority === "URGENT" && (
                      <Badge variant="danger" size="sm">Urgent</Badge>
                    )}
                  </div>
                  <p className="text-xs text-neutral-600 mt-1 font-body leading-relaxed">
                    {rec.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
