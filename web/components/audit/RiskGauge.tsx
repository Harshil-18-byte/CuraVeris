"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import { RiskLabel } from "@/types";

interface RiskGaugeProps {
  score?: number | null;
  label?: RiskLabel | null;
  uncertaintyLower?: number | null;
  uncertaintyUpper?: number | null;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score = 0,
  label = "LOW",
  uncertaintyLower,
  uncertaintyUpper,
}) => {
  const numericScore = Math.min(Math.max(Number(score || 0) * 100, 0), 100);

  // SVG Dial Math
  const size = 200;
  const strokeWidth = 14;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  // Arc of 270 degrees (3/4 circle)
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (numericScore / 100) * arcLength;

  const getDialColor = (lvl?: string | null) => {
    switch (lvl) {
      case "CRITICAL":
      case "HIGH":
        return "#DC2626"; // danger
      case "MEDIUM":
        return "#D97706"; // warning
      default:
        return "#16A34A"; // success
    }
  };

  const getRiskLabelText = (lvl?: string | null) => {
    switch (lvl) {
      case "CRITICAL":
        return "Very High Concern";
      case "HIGH":
        return "High Concern";
      case "MEDIUM":
        return "Some Concern";
      default:
        return "Low Concern";
    }
  };

  const getRiskBadgeVariant = (lvl?: string | null) => {
    switch (lvl) {
      case "CRITICAL":
      case "HIGH":
        return "danger";
      case "MEDIUM":
        return "warning";
      default:
        return "success";
    }
  };

  const getRiskExplanation = (lvl?: string | null) => {
    switch (lvl) {
      case "CRITICAL":
        return "This bill has major overcharges. You should dispute these before paying.";
      case "HIGH":
        return "We found several charges that look higher than they should be. We recommend asking the hospital to explain them.";
      case "MEDIUM":
        return "There are a few charges you should look at before paying.";
      default:
        return "This bill looks mostly fine. We found only minor or no issues.";
    }
  };

  const dialColor = getDialColor(label);

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-4">
        How concerned should you be about this bill?
      </span>

      {/* 200x200 Custom SVG Dial */}
      <div className="relative w-[200px] h-[200px] flex items-center justify-center">
        <svg
          className="w-[200px] h-[200px] transform rotate-[135deg]"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background Track Ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />

          {/* Active Score Ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={dialColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Score Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <span className="font-heading font-extrabold text-4xl text-text-primary tracking-tight">
            {Math.round(numericScore)}
          </span>
          <span className="text-xs text-text-tertiary mt-0.5">out of 100</span>
        </div>
      </div>

      {/* Risk Badge */}
      <div className="mt-4">
        <Badge variant={getRiskBadgeVariant(label)} size="md">
          {getRiskLabelText(label)}
        </Badge>
      </div>

      <p className="text-xs text-text-secondary mt-2 max-w-xs font-normal">
        {getRiskExplanation(label)}
      </p>

      {/* Confidence Band */}
      {uncertaintyLower !== undefined &&
        uncertaintyLower !== null &&
        uncertaintyUpper !== undefined &&
        uncertaintyUpper !== null && (
          <p className="text-xs text-text-tertiary mt-2">
            Our estimate could be between {Math.round(uncertaintyLower * 100)} and {Math.round(uncertaintyUpper * 100)}
          </p>
        )}

      <p className="text-[11px] text-text-tertiary mt-2 max-w-xs">
        We compared your bill to thousands of similar hospital bills across India to find these patterns.
      </p>
    </div>
  );
};
