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
import { MonthlyTrendItem } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface OverchargeChartProps {
  data?: MonthlyTrendItem[];
}

export default function OverchargeChart({ data = [] }: OverchargeChartProps) {
  const hasData = data.some((d) => d.overcharge > 0 || d.bills > 0);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-44 text-center p-4">
        <p className="font-body text-xs sm:text-sm text-[#8C93A4]">
          No audit history yet. Upload your first hospital bill to see monthly recovery trends.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-48 pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "#8C93A4", fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#8C93A4" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val) => (val >= 1000 ? `₹${val / 1000}k` : `₹${val}`)}
          />
          <Tooltip
            cursor={{ fill: "rgba(0, 0, 0, 0.03)" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const item = payload[0]?.payload as MonthlyTrendItem;
              return (
                <div className="bg-[#202128] text-white rounded-xl shadow-lg p-3 text-xs border border-white/10 space-y-1">
                  <p className="font-semibold text-gray-300">{item?.month}</p>
                  <p className="font-mono font-bold text-[#FF6B6B]">
                    {formatCurrency(item?.overcharge || 0)} overcharged
                  </p>
                  <p className="text-[11px] text-gray-400">{item?.bills || 0} bills scanned</p>
                </div>
              );
            }}
          />
          <Bar dataKey="overcharge" radius={[6, 6, 0, 0]} maxBarSize={44}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.overcharge > 0 ? "#E53935" : "#43A8B2"}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
