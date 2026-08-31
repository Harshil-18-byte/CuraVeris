"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, AlertTriangle, ShieldCheck, FileText, ArrowRight, RefreshCw, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useBillStatusSocket } from "@/hooks/useBillStatusSocket";
import { ProcessingStatus } from "@/types";
import { cn } from "@/lib/utils";

interface ProcessingTrackerProps {
  billId: string;
  initialStatus?: ProcessingStatus;
  failureReason?: string | null;
}

const STEPS = [
  { label: "Reading Bill Document", sub: "OCR text extraction and structured line-item normalization" },
  { label: "Statutory Rule Auditing", sub: "Cross-referencing against CGHS, NPPA, DPCO, IRDAI & GST gazette caps" },
  { label: "ML Risk Ensemble", sub: "XGBoost + PyTorch uncertainty evaluation and SHAP factor attribution" },
  { label: "Financial Analysis", sub: "Reconciling recoverable overcharges and duplicate billing patterns" },
  { label: "Cryptographic Report Ready", sub: "Section 65B Indian Evidence Act Merkle tree sealing & HMAC signing" },
];

export const ProcessingTracker: React.FC<ProcessingTrackerProps> = ({
  billId,
  initialStatus,
  failureReason,
}) => {
  const { status, isConnected } = useBillStatusSocket(billId, initialStatus);

  const getActiveStepIndex = (st: ProcessingStatus): number => {
    switch (st) {
      case "QUEUED":
        return 0;
      case "EXTRACTING":
        return 0;
      case "AUDITING":
        return 1;
      case "ML_ANALYSIS":
        return 2;
      case "FINANCIAL_ANALYSIS":
        return 3;
      case "GENERATING_REPORT":
      case "GENERATING_EVIDENCE":
        return 4;
      case "COMPLETED":
        return 5;
      case "FAILED":
        return -1;
      default:
        return 0;
    }
  };

  const activeIndex = getActiveStepIndex(status);
  const isComplete = status === "COMPLETED";
  const isFailed = status === "FAILED";

  return (
    <div className="space-y-6">
      <Card padding="lg" className="space-y-6">
        {/* Header with live connection indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-white/60 gap-3">
          <div>
            <h2 className="font-heading font-bold text-xl text-neutral-900 tracking-tight">
              Audit Pipeline Progress
            </h2>
            <p className="text-xs text-neutral-600 mt-0.5">
              Automated validation against official Indian healthcare regulatory price gazettes
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-white/70 border border-white/80 rounded-badge shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-semibold text-neutral-900">
              Live Audit Engine Connected
            </span>
          </div>
        </div>

        {/* 5-Step Vertical Pipeline */}
        <div className="space-y-6 relative pl-2">
          {STEPS.map((step, idx) => {
            const isDone = isComplete || (activeIndex > idx && !isFailed);
            const isCurrent = !isComplete && activeIndex === idx && !isFailed;
            const isPending = !isComplete && activeIndex < idx && !isFailed;
            const isError = isFailed && idx === Math.max(0, activeIndex);

            return (
              <div key={idx} className="flex items-start gap-4 relative">
                {/* Step Connector Line */}
                {idx < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "absolute left-4 top-8 bottom-[-24px] w-0.5 transition-colors duration-300",
                      isDone ? "bg-success" : "bg-neutral-300/60"
                    )}
                  />
                )}

                {/* Step Icon Circle */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all duration-300",
                    isDone
                      ? "bg-gradient-to-tr from-success to-emerald-400 text-white shadow-[0_2px_8px_rgba(30,132,73,0.3)]"
                      : isCurrent
                      ? "bg-gradient-to-tr from-primary to-primary-light text-white shadow-[0_2px_12px_rgba(27,79,114,0.4)] animate-pulse"
                      : isError
                      ? "bg-danger text-white shadow-[0_2px_8px_rgba(146,43,33,0.3)]"
                      : "bg-white/80 border-2 border-neutral-300/80 text-neutral-400 backdrop-blur-xs"
                  )}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isError ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-bold">{idx + 1}</span>
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 pt-0.5">
                  <div className="flex items-center gap-2">
                    <h3
                      className={cn(
                        "font-heading font-semibold text-sm transition-colors",
                        isDone || isCurrent ? "text-neutral-900 font-bold" : "text-neutral-600"
                      )}
                    >
                      {step.label}
                    </h3>
                    {isCurrent && (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-badge bg-primary-surface text-primary border border-primary/20 animate-pulse">
                        Analyzing
                      </span>
                    )}
                    {isDone && (
                      <span className="text-success text-xs font-semibold">Verified</span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-600 mt-0.5 font-body">{step.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Failed State Card */}
        {isFailed && (
          <div className="p-4 bg-danger-surface/80 border border-danger/30 rounded-card backdrop-blur-xs">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-heading font-bold text-sm text-danger">
                  Processing Interrupted
                </h4>
                <p className="text-xs text-neutral-600 mt-1">
                  {failureReason || "We could not process this bill. Please verify the document format or re-upload."}
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <Link href="/bills/upload">
                    <Button size="sm" variant="destructive">
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                      Try Re-uploading
                    </Button>
                  </Link>
                  <a
                    href="mailto:support@curaveris.in"
                    className="text-xs font-semibold text-neutral-600 hover:underline"
                  >
                    Contact Support →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Completed State Action Buttons */}
        {isComplete && (
          <div className="pt-5 border-t border-white/60 flex flex-col sm:flex-row items-center gap-3">
            <Link href={`/bills/${billId}/audit`} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                <FileText className="w-4 h-4 mr-2" />
                View Full Audit Report
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href={`/bills/${billId}/audit?tab=evidence`} className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                <ShieldCheck className="w-4 h-4 mr-2 text-primary" />
                View Cryptographic Certificate
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};
