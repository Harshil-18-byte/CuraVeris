import React from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { RiskLabel } from "@/types";

interface RiskGaugeProps {
  score: number;
  label: RiskLabel | string;
  lowerBound?: number;
  upperBound?: number;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  label,
  lowerBound,
  upperBound,
}) => {
  const percentage = Math.round(score * 100);
  const lowerPct = Math.round((lowerBound || Math.max(0, score - 0.08)) * 100);
  const upperPct = Math.round((upperBound || Math.min(1, score + 0.08)) * 100);

  // SVG circular gauge geometry
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score * circumference);

  const getStrokeColor = () => {
    if (score < 0.25) return "#1E8449"; // Success
    if (score <= 0.55) return "#B7770D"; // Warning
    return "#922B21"; // Danger
  };

  return (
    <Card padding="lg" className="flex flex-col items-center justify-center text-center">
      <h3 className="font-heading font-bold text-base text-neutral-900 mb-4">
        Overall Risk Probability
      </h3>

      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="88"
            cy="88"
            r={radius}
            stroke="#C8C8D8"
            strokeWidth="12"
            fill="transparent"
            className="opacity-40"
          />
          {/* Active progress circle */}
          <circle
            cx="88"
            cy="88"
            r={radius}
            stroke={getStrokeColor()}
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Inner centered text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading font-bold text-4xl text-neutral-900 tracking-tight">
            {percentage}%
          </span>
          <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider mt-0.5">
            Audit Risk
          </span>
        </div>
      </div>

      <div className="mt-4">
        <Badge
          variant={
            label === "CRITICAL" || label === "HIGH"
              ? "danger"
              : label === "MEDIUM"
              ? "warning"
              : "success"
          }
          size="md"
        >
          {label} RISK LEVEL
        </Badge>
      </div>

      <div className="mt-4 pt-4 border-t border-neutral-300 w-full text-xs text-neutral-600">
        <span>Monte Carlo Confidence Interval: </span>
        <span className="font-semibold text-neutral-900 font-mono">
          {lowerPct}% – {upperPct}%
        </span>
      </div>
    </Card>
  );
};
