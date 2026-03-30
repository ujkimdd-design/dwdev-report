interface ScoreCardProps {
  label: string;
  score: number | string | null | undefined;
  unit?: string;
  description?: string;
  color?: string;
  small?: boolean;
}

export default function ScoreCard({
  label,
  score,
  unit = "",
  description,
  color = "#1d4ed8",
  small = false,
}: ScoreCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <p className={`text-gray-500 font-medium ${small ? "text-xs" : "text-sm"} mb-1`}>
        {label}
      </p>
      <p
        className={`font-bold leading-tight ${small ? "text-2xl" : "text-3xl"}`}
        style={{ color }}
      >
        {score !== null && score !== undefined ? score : "-"}
        {score !== null && score !== undefined && unit && (
          <span className="text-sm font-medium text-gray-400 ml-1">{unit}</span>
        )}
      </p>
      {description && (
        <p className="text-xs text-gray-400 mt-1">{description}</p>
      )}
    </div>
  );
}
