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
        <h3 className="font-heading font-semibold text-base text-white">
          What affected this result
        </h3>
        <p className="text-xs text-neutral-400 mt-0.5">
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
              className="flex items-start gap-3.5 p-3.5 bg-[#0B0E17]/80 rounded-2xl border border-white/[0.08] shadow-inner"
            >
              {/* Direction Indicator */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isRiskRaising ? "bg-red-500/15 text-red-400 border border-red-500/30" : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
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
                  <h4 className="text-xs font-semibold text-white">
                    {factor.feature_label}
                  </h4>
                  <span
                    className={`text-[11px] font-semibold ${
                      isRiskRaising ? "text-red-400" : "text-emerald-400"
                    }`}
                  >
                    {isRiskRaising ? "Made concern higher" : "Made concern lower"}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1 leading-normal">
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
      <div className="mt-4 p-3.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-neutral-400 italic leading-relaxed flex items-start gap-2">
        <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
        <span>
          We compared your bill to thousands of similar hospital bills across India to find these patterns.
        </span>
      </div>
    </div>
  );
};
