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
  { id: 1, label: "Reading your bill", sub: "We're scanning the text from your document" },
  { id: 2, label: "Checking the prices", sub: "We're comparing each charge to government-approved rates" },
  { id: 3, label: "Running our analysis", sub: "We're calculating the risk and potential overcharges" },
  { id: 4, label: "Working out your options", sub: "We're figuring out what you can do about the overcharges" },
  { id: 5, label: "Preparing your report", sub: "Almost done — putting together your results" },
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
    <div className="bg-gradient-to-b from-[#111520]/90 to-[#0A0D14]/95 rounded-3xl border border-white/[0.08] p-8 sm:p-12 shadow-2xl text-center max-w-xl mx-auto backdrop-blur-xl">
      {/* 1. COMPLETED STATE */}
      {isComplete && (
        <div className="space-y-6 animate-in fade-in-50 zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.3)]">
            <Check className="w-10 h-10" strokeWidth={2.5} />
          </div>

          <div>
            <h2 className="font-heading font-bold text-2xl text-white">
              Your bill has been checked!
            </h2>
            <p className="text-xs text-neutral-400 mt-1.5 max-w-sm mx-auto font-normal">
              We&apos;ve checked your bill against government rules and prepared your results.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href={`/bills/${billId}/audit`} className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto rounded-full">
                See What We Found
                <ArrowRight className="w-4 h-4 ml-2" strokeWidth={1.5} />
              </Button>
            </Link>

            <Link href={`/bills/${billId}/risk`} className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto rounded-full">
                Check My Financial Situation
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 2. FAILED STATE */}
      {isFailed && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-400 flex items-center justify-center mx-auto text-red-400 shadow-[0_0_30px_rgba(248,113,113,0.3)]">
            <X className="w-10 h-10" strokeWidth={2} />
          </div>

          <div>
            <h2 className="font-heading font-bold text-2xl text-white">
              Something went wrong while checking your bill.
            </h2>
            <p className="text-xs text-neutral-400 mt-1.5 max-w-sm mx-auto font-normal">
              {failureReason?.includes("read") || failureReason?.includes("OCR")
                ? "We had trouble reading your bill. Please try uploading a clearer photo with better lighting."
                : "Our team has been notified. Please try uploading again."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/bills/upload" className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="w-full sm:w-auto rounded-full">
                <RefreshCw className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Try Again
              </Button>
            </Link>
            <Link href="/bills" className="w-full sm:w-auto">
              <Button variant="ghost" size="md" className="w-full sm:w-auto rounded-full">
                Back to Bills
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 3. ACTIVE PROCESSING STATE */}
      {!isComplete && !isFailed && (
        <div className="space-y-8">
          {/* Custom SVG Circular Progress */}
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="text-white/10"
                strokeWidth="4"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="text-cyan-400 transition-all duration-500 ease-out drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-heading font-bold text-xs text-white">
                {currentStep} of 5
              </span>
            </div>
          </div>

          <div>
            <h2 className="font-heading font-bold text-2xl text-white">
              We&apos;re checking your bill now
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Usually takes 3–8 minutes. We&apos;ll notify you when it&apos;s ready.
            </p>
          </div>

          {/* Vertical Step Tracker */}
          <div className="max-w-xs mx-auto text-left space-y-4">
            {STEPS.map((stepItem) => {
              const isStepDone = currentStep > stepItem.id;
              const isStepActive = currentStep === stepItem.id;

              return (
                <div key={stepItem.id} className="relative flex items-start gap-3.5">
                  {/* Step Icon Circle */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      isStepDone
                        ? "bg-emerald-500/15 border border-emerald-400 text-emerald-400"
                        : isStepActive
                        ? "bg-cyan-500/15 border-2 border-cyan-400 text-cyan-400 ring-4 ring-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                        : "bg-white/5 border border-white/10 text-neutral-500"
                    }`}
                  >
                    {isStepDone ? (
                      <Check className="w-4 h-4" strokeWidth={2.5} />
                    ) : isStepActive ? (
                      <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p
                      className={`text-xs font-semibold leading-tight ${
                        isStepActive
                          ? "text-white"
                          : isStepDone
                          ? "text-neutral-200"
                          : "text-neutral-500"
                      }`}
                    >
                      {stepItem.label}
                    </p>
                    {isStepActive && (
                      <p className="text-[11px] text-neutral-400 mt-0.5 animate-in fade-in-50 duration-200">
                        {stepItem.sub}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time Estimate Pill */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-neutral-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" strokeWidth={1.5} />
            <span>Usually takes 3–8 minutes. We&apos;ll notify you when it&apos;s ready.</span>
          </div>
        </div>
      )}
    </div>
  );
};
