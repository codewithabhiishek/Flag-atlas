import {
  Landmark,
  Mountain,
  Sun,
  Globe2,
  Palmtree,
  Snowflake,
  Compass,
} from "lucide-react";
import { REGIONS } from "@/data/regions";
import { regionMastery } from "@/lib/derive";
import { cn } from "@/lib/utils";

const ICONS = {
  "North America": Globe2,
  "South America": Compass,
  Europe: Landmark,
  Asia: Mountain,
  Africa: Sun,
  Antarctica: Snowflake,
  Oceania: Palmtree,
};

export default function PassportStamps({ flags }) {
  return (
    <div className="flex flex-wrap gap-2">
      {REGIONS.map((r) => {
        const Icon = ICONS[r.id];
        const pct = regionMastery(flags, r.id);
        const unlocked = pct >= 100;
        return (
          <div
            key={r.id}
            className={cn(
              "w-14 h-14 rounded-full border flex flex-col items-center justify-center transition-all",
              unlocked
                ? "border-gold text-gold bg-gold/5"
                : "border-border text-muted-foreground/50",
            )}
            title={`${r.id} · ${pct}% mastered`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-[8px] mt-0.5 font-medium tracking-wide">
              {r.id.slice(0, 3).toUpperCase()}
            </span>
          </div>
        );
      })}
    </div>
  );
}
