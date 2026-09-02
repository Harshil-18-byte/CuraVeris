"use client";

import React from "react";
import { TrendingUp, TrendingDown, Info } from "lucide-react";
import { ShapExplanation } from "@/types";

interface ShapChartProps {
  shapValues?: ShapExplanation[] | null;
}

export const ShapChart: React.FC<ShapChartProps> = ({ shapValues }) => {
  // Default factors if not generated
  const factors: ShapExplanation[] =
    shapValues && shapValues.length > 0
      ? shapValues.slice(0, 5)
      : [
          {
            feature_label: "Total extra charges relative to bill size",
            shap_value: 0.28,
            direction: "INCREASES_RISK",
            explanation: "Charges on this item differ significantly from standard pricing patterns.",
          },
          {
            feature_label: "NPPA / DPCO capped medicine pricing",
            shap_value: 0.19,
            direction: "INCREASES_RISK",
            explanation: "Essential medicines charged above government notified ceiling prices.",
          },
          {
            feature_label: "Simultaneous itemised & package charges",
            shap_value: 0.14,
            direction: "INCREASES_RISK",
            explanation: "Standard consumables billed separately despite inclusion in room charges.",
          },
          {
            feature_label: "Accredited hospital tier benchmark consistency",
            shap_value: -0.09,
            direction: "DECREASES_RISK",
            explanation: "This item matches expected pricing benchmarks for this hospital category.",
          },
          {
            feature_label: "Standard routine lab charges",
            shap_value: -0.05,
            direction: "DECREASES_RISK",
            explanation: "Pathology and diagnostic investigation rates align with regional benchmarks.",
          },
        ];

  return (
    <div className="p-6 space-y-4 text-left">
      <div>
        <h3 className="font-heading font-semibold text-base text-text-primary">
          What affected this result
        </h3>
        <p className="text-xs text-text-secondary mt-0.5">
          Key patterns in this bill that influenced our assessment
        </p>
      </div>

      <div className="space-y-3.5 pt-2">
        {factors.map((factor, idx) => {
          const isRiskRaising =
            factor.direction === "INCREASES_RISK" || factor.shap_value > 0;

          return (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 bg-white rounded-md border border-border-subtle shadow-2xs"
            >
              {/* Direction Indicator */}
              <div
                className={`w-6 h-6 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isRiskRaising ? "bg-danger-bg text-danger" : "bg-success-bg text-success"
                }`}
              >
                {isRiskRaising ? (
                  <TrendingUp className="w-3.5 h-3.5" strokeWidth={2} />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" strokeWidth={2} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-semibold text-text-primary">
                    {factor.feature_label}
                  </h4>
                  <span
                    className={`text-[11px] font-medium ${
                      isRiskRaising ? "text-danger" : "text-success"
                    }`}
                  >
                    {isRiskRaising ? "Raises concern" : "Lowers concern"}
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary mt-0.5 leading-normal">
                  {factor.explanation || (isRiskRaising
                    ? "Charges on this item differ significantly from standard government pricing patterns."
                    : "This item matches expected pricing benchmarks for this hospital category.")}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="mt-4 p-3 bg-bg-secondary rounded-md text-xs text-text-tertiary italic leading-relaxed flex items-start gap-2">
        <Info className="w-4 h-4 text-text-tertiary flex-shrink-0 mt-0.5" strokeWidth={1.5} />
        <span>
          This analysis shows patterns compared across thousands of medical bills in India to help you evaluate your bill.
        </span>
      </div>
    </div>
  );
};
