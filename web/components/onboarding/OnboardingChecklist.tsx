"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, X } from "lucide-react";

const STEPS = [
  {
    key: "bill_uploaded",
    label: "Upload your first bill",
    description: "Take a photo or upload a PDF of any hospital bill.",
    action: "Upload Now",
    href: "/bills/upload",
  },
  {
    key: "audit_complete",
    label: "Complete your first audit",
    description: "Wait for processing to finish and view your itemized results.",
    action: "View Bills",
    href: "/bills",
  },
  {
    key: "profile_complete",
    label: "Complete your profile",
    description: "Add your phone number to receive instant SMS alerts.",
    action: "Update Profile",
    href: "/account",
  },
];

export default function OnboardingChecklist({
  onboarding,
  onDismiss,
}: {
  onboarding?: Record<string, boolean>;
  onDismiss?: () => void;
}) {
  const [dismissed, setDismissed] = useState(false);

  if (!onboarding || dismissed || onboarding.checklist_dismissed) return null;

  const completedCount = STEPS.filter((s) => Boolean(onboarding[s.key])).length;
  const allDone = completedCount === STEPS.length;

  if (allDone) return null;

  const percent = Math.round((completedCount / STEPS.length) * 100);

  return (
    <div className="bg-white border border-[#43A8B2]/30 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-5 mb-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-heading text-base sm:text-lg font-bold text-[#202128]">
            Get started with CuraVeris
          </p>
          <p className="font-body text-xs sm:text-sm text-[#606470] mt-0.5">
            {completedCount} of {STEPS.length} steps completed ({percent}%)
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setDismissed(true);
            if (onDismiss) onDismiss();
          }}
          className="text-[#8C93A4] hover:text-[#202128] text-xs font-semibold p-1 rounded-md transition-colors"
          title="Dismiss checklist"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#EDF0FB] rounded-full h-2 mb-4">
        <div
          className="bg-[#43A8B2] h-2 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="space-y-3">
        {STEPS.map((step) => {
          const isComplete = Boolean(onboarding[step.key]);
          return (
            <div
              key={step.key}
              className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-[#F8F9FA] transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    isComplete
                      ? "bg-[#0CAF60] text-white"
                      : "bg-[#EDF0FB] border border-black/[0.1] text-transparent"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <p
                    className={`font-body text-xs sm:text-sm ${
                      isComplete
                        ? "text-[#8C93A4] line-through font-normal"
                        : "text-[#202128] font-bold"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[11px] text-[#606470] truncate">
                    {step.description}
                  </p>
                </div>
              </div>

              {!isComplete && (
                <Link
                  href={step.href}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#43A8B2] hover:text-[#202128] flex-shrink-0"
                >
                  <span>{step.action}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
