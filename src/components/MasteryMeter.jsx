export default function MasteryMeter({ value }) {
  return (
    <div className="h-2.5 border-2 border-foreground bg-background overflow-hidden">
      <div
        className="h-full bg-forest transition-all duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
