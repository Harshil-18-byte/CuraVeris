"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  Loader2,
  X,
  ArrowRight,
  Clock,
  Download,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProcessingStatus } from "@/types";

interface ProcessingTrackerProps {
  billId: string;
  initialStatus: ProcessingStatus;
  failureReason?: string | null;
  onRetry?: () => void;
}

const STEPS = [
  { id: 1, label: "Reading your bill", sub: "Extracting line items, medicines, and prices" },
  { id: 2, label: "Checking the prices", sub: "Comparing against NPPA, CGHS, PM-JAY and DPCO price caps" },
  { id: 3, label: "Running our analysis", sub: "Checking for double billing and hidden charges" },
  { id: 4, label: "Working out your options", sub: "Assessing how this bill affects your personal finances" },
  { id: 5, label: "Preparing your report", sub: "Creating your complaint letter and proof certificate" },
];

export const ProcessingTracker: React.FC<ProcessingTrackerProps> = ({
  billId,
  initialStatus,
  failureReason,
  onRetry,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Map backend processing status to 1-5 step index
  useEffect(() => {
    switch (initialStatus) {
      case "QUEUED":
        setCurrentStep(1);
        break;
      case "EXTRACTING":
        setCurrentStep(1);
        break;
      case "AUDITING":
        setCurrentStep(2);
        break;
      case "ML_ANALYSIS":
        setCurrentStep(3);
        break;
      case "FINANCIAL_ANALYSIS":
        setCurrentStep(4);
        break;
      case "GENERATING_REPORT":
      case "GENERATING_EVIDENCE":
        setCurrentStep(5);
        break;
      case "COMPLETED":
        setCurrentStep(6);
        break;
      case "FAILED":
      default:
        break;
    }
  }, [initialStatus]);

  const isComplete = initialStatus === "COMPLETED";
  const isFailed = initialStatus === "FAILED";

  // SVG Circular progress computation for active state
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = Math.min(Math.max((currentStep / 5) * 100, 10), 100);
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="bg-white rounded-xl border border-border-subtle p-8 sm:p-12 shadow-sm text-center max-w-xl mx-auto">
      {/* 1. COMPLETED STATE */}
      {isComplete && (
        <div className="space-y-6 animate-in fade-in-50 zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-full bg-success-bg border-2 border-success flex items-center justify-center mx-auto text-success">
            <Check className="w-10 h-10" strokeWidth={2.5} />
          </div>

          <div>
            <h2 className="font-heading font-bold text-2xl text-text-primary">
              Your bill has been checked!
            </h2>
            <p className="text-sm text-text-secondary mt-1 max-w-sm mx-auto font-normal">
              We&apos;ve verified your bill against government rules and prepared your dispute report.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href={`/bills/${billId}/audit`} className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                See What We Found
                <ArrowRight className="w-4 h-4 ml-2" strokeWidth={1.5} />
              </Button>
            </Link>

            <a
              href={`/api/v1/legal-docs/bills/${billId}/dispute-notice`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                <Download className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Download Proof Document
              </Button>
            </a>
          </div>
        </div>
      )}

      {/* 2. FAILED STATE */}
      {isFailed && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="w-20 h-20 rounded-full bg-danger-bg border-2 border-danger/40 flex items-center justify-center mx-auto text-danger">
            <X className="w-10 h-10" strokeWidth={2} />
          </div>

          <div>
            <h2 className="font-heading font-bold text-2xl text-text-primary">
              Something went wrong
            </h2>
            <p className="text-sm text-text-secondary mt-1.5 max-w-sm mx-auto font-normal">
              {failureReason || "We had trouble reading parts of your bill. Please upload a clearer photo or PDF."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/bills/upload" className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="w-full sm:w-auto">
                <RefreshCw className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Try Again
              </Button>
            </Link>
            <Link href="/bills" className="w-full sm:w-auto">
              <Button variant="ghost" size="md" className="w-full sm:w-auto">
                Back to Bills
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 3. ACTIVE PROCESSING STATE */}
      {!isComplete && !isFailed && (
        <div className="space-y-8">
          {/* Custom SVG 80px Circular Progress */}
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="text-border-default"
                strokeWidth="4"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="text-brand-accent transition-all duration-500 ease-out"
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-heading font-semibold text-sm text-text-primary">
                {currentStep} of 5
              </span>
            </div>
          </div>

          <div>
            <h2 className="font-heading font-bold text-2xl text-text-primary">
              We&apos;re checking your bill
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              This usually takes 1 to 2 minutes. Feel free to stay on this page or come back later.
            </p>
          </div>

          {/* Vertical Step Tracker */}
          <div className="max-w-xs mx-auto text-left space-y-4">
            {STEPS.map((stepItem) => {
              const isStepDone = currentStep > stepItem.id;
              const isStepActive = currentStep === stepItem.id;
              const isStepPending = currentStep < stepItem.id;

              return (
                <div key={stepItem.id} className="relative flex items-start gap-3.5">
                  {/* Step Icon Circle */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      isStepDone
                        ? "bg-success-bg border border-success text-success"
                        : isStepActive
                        ? "bg-brand-accent-light border-2 border-brand-accent text-brand-accent ring-4 ring-brand-accent/10"
                        : "bg-white border border-border-default text-text-tertiary"
                    }`}
                  >
                    {isStepDone ? (
                      <Check className="w-4 h-4" strokeWidth={2.5} />
                    ) : isStepActive ? (
                      <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-border-strong" />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p
                      className={`text-sm font-medium leading-tight ${
                        isStepActive
                          ? "text-text-primary font-semibold"
                          : isStepDone
                          ? "text-text-primary"
                          : "text-text-tertiary"
                      }`}
                    >
                      {stepItem.label}
                    </p>
                    {isStepActive && (
                      <p className="text-xs text-text-secondary mt-0.5 animate-in fade-in-50 duration-200">
                        {stepItem.sub}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time Estimate Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-bg-secondary rounded-full text-xs font-medium text-text-secondary">
            <Clock className="w-3.5 h-3.5 text-text-tertiary" strokeWidth={1.5} />
            <span>Estimated time: ~1 minute</span>
          </div>
        </div>
      )}
    </div>
  );
};
