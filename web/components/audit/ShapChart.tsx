"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { ShapExplanation } from "@/types";

interface ShapChartProps {
  shapValues: ShapExplanation[];
  modelVersion?: string;
}

export const ShapChart: React.FC<ShapChartProps> = ({ shapValues, modelVersion }) => {
  if (!shapValues || shapValues.length === 0) {
    return (
      <Card padding="lg">
        <h3 className="font-heading font-bold text-base text-neutral-900 mb-2">
          Explainable AI Factor Analysis
        </h3>
        <p className="text-xs text-neutral-600">
          SHAP factor attribution is generated when the ML ensemble completes full inference.
        </p>
      </Card>
    );
  }

  const chartData = shapValues.slice(0, 8).map((s) => ({
    name: s.feature_label,
    value: s.shap_value,
    direction: s.direction,
    explanation: s.explanation,
  }));

  return (
    <Card padding="lg" className="space-y-6">
      <div>
        <h3 className="font-heading font-bold text-base text-neutral-900">
          Why this risk score? (SHAP Factor Attribution)
        </h3>
        <p className="text-xs text-neutral-600 mt-0.5">
          Features extending to the right increase audit risk; features to the left reduce risk.
        </p>
      </div>

      {/* Horizontal Bar Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <XAxis type="number" tick={{ fontSize: 11, fill: "#4A4A6A" }} />
            <YAxis
              type="category"
              dataKey="name"
              width={140}
              tick={{ fontSize: 11, fill: "#1A1A2E" }}
            />
            <Tooltip
              formatter={(val: number) => [`Impact: ${val > 0 ? "+" : ""}${val.toFixed(3)}`, "SHAP Value"]}
              contentStyle={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #C8C8D8",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 4, 4]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.value > 0 ? "#922B21" : "#1E8449"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Feature Breakdown Table */}
      <div className="overflow-x-auto border-t border-neutral-300 pt-4">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-neutral-600 uppercase font-semibold border-b border-neutral-300 pb-2">
              <th className="pb-2">Factor / Feature</th>
              <th className="pb-2 text-center">Impact</th>
              <th className="pb-2">Clinical / Billing Rationale</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-300">
            {chartData.map((item, idx) => (
              <tr key={idx} className="py-2">
                <td className="py-2.5 font-semibold text-neutral-900 pr-3">{item.name}</td>
                <td className="py-2.5 text-center px-2">
                  <span
                    className={
                      item.value > 0
                        ? "text-danger font-bold font-mono"
                        : "text-success font-bold font-mono"
                    }
                  >
                    {item.value > 0 ? `+${item.value.toFixed(2)}` : item.value.toFixed(2)}
                  </span>
                </td>
                <td className="py-2.5 text-neutral-600 font-body leading-relaxed">
                  {item.explanation}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Model Footnote */}
      <div className="pt-2 text-[11px] text-neutral-600 font-mono">
        Engine Model: {modelVersion || "xgb_mlp_ensemble_v1.0"} · TreeExplainer Kernel
      </div>
    </Card>
  );
};
