"use client";

interface BalanceBarProps {
  label: string;
  leftValue: number | null | undefined;
  rightValue: number | null | undefined;
  unit?: string;
  maxValue?: number;
}

export default function BalanceBar({
  label,
  leftValue,
  rightValue,
  unit = "kgf",
  maxValue = 100,
}: BalanceBarProps) {
  const lv = leftValue ?? 0;
  const rv = rightValue ?? 0;

  const leftPct = Math.min((lv / maxValue) * 100, 100);
  const rightPct = Math.min((rv / maxValue) * 100, 100);

  const imbalancePct =
    lv + rv > 0 ? Math.abs(lv - rv) / Math.max(lv, rv) : 0;
  const isImbalanced = imbalancePct > 0.15;

  const barColor = isImbalanced ? "#ef4444" : "#1d4ed8";

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        {isImbalanced && (
          <span className="text-xs text-red-500 font-semibold">불균형</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {/* Left side */}
        <div className="flex-1 flex justify-end items-center gap-1.5">
          <span className="text-xs text-gray-500 w-12 text-right">
            {lv.toFixed(1)} {unit}
          </span>
          <div className="flex-1 h-4 bg-gray-100 rounded-l overflow-hidden">
            <div
              className="h-full rounded-l transition-all"
              style={{
                width: `${leftPct}%`,
                backgroundColor: barColor,
                marginLeft: "auto",
              }}
            />
          </div>
        </div>

        {/* Center divider */}
        <div className="w-px h-5 bg-gray-400" />

        {/* Right side */}
        <div className="flex-1 flex items-center gap-1.5">
          <div className="flex-1 h-4 bg-gray-100 rounded-r overflow-hidden">
            <div
              className="h-full rounded-r transition-all"
              style={{
                width: `${rightPct}%`,
                backgroundColor: barColor,
              }}
            />
          </div>
          <span className="text-xs text-gray-500 w-12">
            {rv.toFixed(1)} {unit}
          </span>
        </div>
      </div>
      <div className="flex justify-between mt-0.5">
        <span className="text-xs text-gray-400">좌</span>
        <span className="text-xs text-gray-400">우</span>
      </div>
    </div>
  );
}
