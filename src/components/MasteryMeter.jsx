export default function MasteryMeter({ value }) {
  return (
    <div className="h-2.5 border-2 border-foreground bg-background overflow-hidden relative shadow-[1px_1px_0px_0px_rgba(0,0,0,0.5)]">
      <div
        className="h-full bg-forest relative overflow-hidden transition-all duration-700 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      >
        <div className="absolute inset-0 shimmer-progress opacity-60" />
      </div>
    </div>
  );
}
