import { cn } from "@/lib/utils";

/** Base pulsing skeleton block */
export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded bg-muted/60 dark:bg-muted/40",
        className,
      )}
    />
  );
}

/** Skeleton for a single flag card (used in game modes while pool loads) */
export function FlagCardSkeleton() {
  return (
    <div className="atlas-card p-4 border-2 border-foreground/20 space-y-3">
      {/* Flag image placeholder */}
      <Skeleton className="w-full aspect-[3/2] rounded-lg" />
      {/* Country name */}
      <Skeleton className="h-4 w-3/4 rounded" />
      {/* Region */}
      <Skeleton className="h-3 w-1/2 rounded" />
    </div>
  );
}

/** Skeleton for a stat pill (hero section) */
export function StatPillSkeleton() {
  return <Skeleton className="h-8 w-28 rounded-md" />;
}

/** Skeleton for the XP progress bar */
export function XpBarSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Skeleton className="h-3 w-16 rounded" />
        <Skeleton className="h-3 w-20 rounded" />
      </div>
      <Skeleton className="h-3 w-full rounded-sm border-2 border-foreground/20" />
    </div>
  );
}

/** Skeleton for a region card */
export function RegionCardSkeleton() {
  return (
    <div className="atlas-card px-4 py-3.5 border-2 border-foreground/20 flex items-center gap-4">
      <div className="flex-1 space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-4 w-10 rounded" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    </div>
  );
}

/** Skeleton for the WorldMap (just the ocean rectangle) */
export function MapSkeleton() {
  return (
    <div className="w-full bg-ocean py-4 flex items-center justify-center" style={{ minHeight: 260 }}>
      <Skeleton className="w-[90%] mx-auto rounded-xl" style={{ height: 220 }} />
    </div>
  );
}

/** Full home page skeleton — shown on first render before data hydrates */
export function HomeSkeleton() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-6">
      {/* Hero */}
      <div className="atlas-card grid-paper p-5 sm:p-7 border-2 border-foreground/20">
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="space-y-3 flex-1">
            <Skeleton className="h-5 w-32 rounded" />
            <Skeleton className="h-12 w-48 rounded" />
            <div className="flex gap-2">
              <StatPillSkeleton />
              <StatPillSkeleton />
              <StatPillSkeleton />
            </div>
          </div>
          <div className="w-full sm:max-w-xs space-y-3">
            <XpBarSkeleton />
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1 rounded" />
              <Skeleton className="h-10 w-10 rounded" />
              <Skeleton className="h-10 w-10 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Quiz */}
      <div className="atlas-card p-5 border-2 border-foreground/20 space-y-4">
        <Skeleton className="h-5 w-36 rounded" />
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="w-32 rounded-lg shrink-0" style={{ height: "5.5rem" }} />
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-11 rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="atlas-card border-2 border-foreground/20 overflow-hidden">
        <div className="px-5 py-4 border-b border-foreground/10 flex justify-between">
          <Skeleton className="h-5 w-32 rounded" />
          <div className="flex gap-3">
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
        </div>
        <MapSkeleton />
      </div>

      {/* Game modes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="atlas-card p-4 border-2 border-foreground/20 space-y-2">
            <Skeleton className="w-9 h-9 rounded-lg" />
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-3 w-full rounded" />
          </div>
        ))}
      </div>

      {/* Region cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <RegionCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
