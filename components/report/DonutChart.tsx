"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface DonutChartProps {
  score: number;
  maxScore?: number;
  color?: string;
  label?: string;
  size?: "small" | "medium" | "large";
  unit?: string;
}

export default function DonutChart({
  score,
  maxScore = 100,
  color = "#1d4ed8",
  label,
  size = "medium",
  unit = "점",
}: DonutChartProps) {
  const pct = Math.min(Math.max(score / maxScore, 0), 1);
  const data = [
    { value: pct * 100 },
    { value: (1 - pct) * 100 },
  ];

  const sizeMap = {
    small: { dim: 100, inner: 30, outer: 45, fontSize: "text-xl", labelSize: "text-xs" },
    medium: { dim: 130, inner: 38, outer: 58, fontSize: "text-2xl", labelSize: "text-xs" },
    large: { dim: 160, inner: 48, outer: 70, fontSize: "text-3xl", labelSize: "text-sm" },
  };

  const s = sizeMap[size];

  return (
    <div className="flex flex-col items-center gap-1">
      <div style={{ width: s.dim, height: s.dim }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={s.inner}
              outerRadius={s.outer}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill={color} />
              <Cell fill="#e5e7eb" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold leading-none ${s.fontSize}`} style={{ color }}>
            {score}
          </span>
          <span className="text-xs text-gray-400">{unit}</span>
        </div>
      </div>
      {label && (
        <p className={`text-gray-600 font-medium text-center ${s.labelSize}`}>
          {label}
        </p>
      )}
    </div>
  );
}
