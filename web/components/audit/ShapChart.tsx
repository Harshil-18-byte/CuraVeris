"use client";

import React from "react";
import { TrendingUp, TrendingDown, Info } from "lucide-react";
import { ShapExplanation } from "@/types";

interface ShapChartProps {
  shapValues?: ShapExplanation[] | null;
}

export const ShapChart: React.FC<ShapChartProps> = ({ shapValues }) => {
  if (!shapValues || shapValues.length === 0) {
    return (
      <div className="p-8 text-center space-y-2">
        <Info className="w-8 h-8 text-[#606470] mx-auto opacity-50" strokeWidth={1.5} />
        <h4 className="font-heading font-bold text-sm text-[#202128]">
          AI analysis was not available for this bill
        </h4>
        <p className="text-xs text-[#606470] max-w-xs mx-auto">
          Deterministic statutory price benchmarks were applied directly.
        </p>
      </div>
    );
  }

  const factors: ShapExplanation[] = shapValues.slice(0, 5);

  return (
    <div className="p-6 space-y-4 text-left">
      <div>
        <h3 className="font-heading font-bold text-base text-[#202128]">
          What affected this result
        </h3>
        <p className="text-xs text-[#606470] mt-0.5 font-medium">
          These factors had the biggest impact on our estimate:
        </p>
      </div>

      <div className="space-y-3 pt-2">
        {factors.map((factor, idx) => {
          const isRiskRaising =
            factor.direction === "INCREASES_RISK" || factor.shap_value > 0;

          return (
            <div
              key={idx}
              className="flex items-start gap-3.5 p-3.5 bg-[#F5F7FB] rounded-2xl border border-black/[0.05] shadow-xs"
            >
              {/* Direction Indicator */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isRiskRaising
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                }`}
              >
                {isRiskRaising ? (
                  <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.5} />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" strokeWidth={2.5} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-[#202128]">
                    {factor.feature_label}
                  </h4>
                  <span
                    className={`text-[11px] font-bold ${
                      isRiskRaising ? "text-red-600" : "text-emerald-600"
                    }`}
                  >
                    {isRiskRaising ? "Made concern higher" : "Made concern lower"}
                  </span>
                </div>
                <p className="text-[11px] text-[#606470] mt-1 leading-normal font-medium">
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
      <div className="mt-4 p-3.5 bg-[#EDF0FB] border border-black/[0.04] rounded-2xl text-xs text-[#606470] leading-relaxed flex items-start gap-2">
        <Info className="w-4 h-4 text-[#43A8B2] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
        <span className="font-medium">
          We compared your bill to thousands of similar hospital bills across India to find these patterns.
        </span>
      </div>
    </div>
  );
};
