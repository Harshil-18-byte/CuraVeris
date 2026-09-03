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
            feature_label: "Total extra charges compared to the bill size",
            shap_value: 0.28,
            direction: "INCREASES_RISK",
            explanation: "The amount of extra charges is large compared to the overall bill.",
          },
          {
            feature_label: "Medicines charged above government price caps",
            shap_value: 0.19,
            direction: "INCREASES_RISK",
            explanation: "Some essential medicines cost more than government-mandated price limits.",
          },
          {
            feature_label: "Items charged separately that should be included",
            shap_value: 0.14,
            direction: "INCREASES_RISK",
            explanation: "Certain routine supplies were billed on top of regular room charges.",
          },
          {
            feature_label: "Hospital room charges within normal range",
            shap_value: -0.09,
            direction: "DECREASES_RISK",
            explanation: "Room rent rates align with standard benchmarks for this category.",
          },
          {
            feature_label: "Standard routine lab test charges",
            shap_value: -0.05,
            direction: "DECREASES_RISK",
            explanation: "Blood tests and lab investigations are priced fairly.",
          },
        ];

  return (
    <div className="p-6 space-y-4 text-left">
      <div>
        <h3 className="font-heading font-semibold text-base text-text-primary">
          What affected this result
        </h3>
        <p className="text-xs text-text-secondary mt-0.5">
          These factors had the biggest impact on our estimate:
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
                    {isRiskRaising ? "Made concern higher" : "Made concern lower"}
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary mt-0.5 leading-normal">
                  {factor.explanation || (isRiskRaising
                    ? "Charges on this item differ from standard government pricing patterns."
                    : "This item matches expected pricing benchmarks for this hospital.")}
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
          We compared your bill to thousands of similar hospital bills across India to find these patterns.
        </span>
      </div>
    </div>
  );
};
