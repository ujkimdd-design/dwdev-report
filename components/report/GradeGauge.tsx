"use client";

type GaugeVariant = "fitness" | "balance" | "risk";

interface GradeGaugeProps {
  grade: string;
  variant?: GaugeVariant;
}

const fitnessGrades = [
  { label: "매우부족", color: "#ef4444" },
  { label: "다소부족", color: "#f97316" },
  { label: "보통", color: "#eab308" },
  { label: "우수", color: "#3b82f6" },
  { label: "매우우수", color: "#22c55e" },
];

const balanceGrades = [
  { label: "매우약함", color: "#ef4444" },
  { label: "약함", color: "#f97316" },
  { label: "보통", color: "#eab308" },
  { label: "균형", color: "#22c55e" },
];

function getGrades(variant: GaugeVariant) {
  if (variant === "balance") return balanceGrades;
  return fitnessGrades;
}

export default function GradeGauge({ grade, variant = "fitness" }: GradeGaugeProps) {
  const grades = getGrades(variant);
  const activeIdx = grades.findIndex((g) => g.label === grade);

  return (
    <div className="w-full">
      <div className="flex gap-0.5 h-5 rounded overflow-hidden">
        {grades.map((g, i) => (
          <div
            key={g.label}
            className="flex-1 relative transition-all"
            style={{
              backgroundColor: i === activeIdx ? g.color : "#e5e7eb",
            }}
          >
            {i === activeIdx && (
              <div className="absolute inset-0 ring-2 ring-offset-1 ring-gray-400 rounded" />
            )}
          </div>
        ))}
      </div>
      <div className="flex mt-1">
        {grades.map((g, i) => (
          <div key={g.label} className="flex-1 text-center">
            <span
              className={`text-[9px] leading-tight ${
                i === activeIdx ? "font-bold" : "text-gray-400"
              }`}
              style={{ color: i === activeIdx ? g.color : undefined }}
            >
              {g.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
