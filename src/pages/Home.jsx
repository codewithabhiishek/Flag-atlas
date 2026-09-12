import { Link } from "react-router-dom";
import {
  Sparkles,
  Zap,
  Eye,
  Palette,
  Layers,
  ArrowRight,
  Star,
  Swords,
} from "lucide-react";
import { useProgress } from "@/lib/ProgressContext";
import { levelProgress, rankFromMastered } from "@/lib/scoring";
import {
  masteredCount,
  regionMastery,
  masteredInRegion,
  regionTotal,
} from "@/lib/derive";
import { REGIONS } from "@/data/regions";
import WorldMap from "@/components/WorldMap";
import MasteryMeter from "@/components/MasteryMeter";
import PassportStamps from "@/components/PassportStamps";
import { cn } from "@/lib/utils";

const MODES = [
  {
    key: "fragments",
    path: "/play/fragments",
    label: "Fragments",
    icon: Sparkles,
  },
  { key: "speed", path: "/play/speed", label: "Speed Run", icon: Zap },
  { key: "recall", path: "/play/recall", label: "Recall", icon: Eye },
  { key: "builder", path: "/play/builder", label: "Builder", icon: Palette },
];

function LegendDot({ className, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-tight">
      <span className={cn("w-3 h-3 border-2 border-foreground", className)} />
      {label}
    </span>
  );
}

export default function Home() {
  const { state } = useProgress();
  const lp = levelProgress(state.xp);
  const rank = rankFromMastered(masteredCount(state.flags));
  const mastered = masteredCount(state.flags);
  const acc = state.stats.answered
    ? Math.round((state.stats.correct / state.stats.answered) * 100)
    : 0;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6">
      <section className="atlas-card grid-paper p-5 sm:p-8">
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-foreground font-bold">
              Explorer Rank
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-foreground mt-1">
              {rank.title}
            </h1>
            <p className="text-muted-foreground text-sm mt-2 font-medium">
              {mastered} flags mastered · 🔥 {state.streak}-day streak · {acc}%
              accuracy
            </p>
          </div>
          <div className="w-full md:max-w-sm">
            <div className="flex justify-between text-xs mb-1.5 font-bold uppercase">
              <span className="text-foreground">Level {lp.level}</span>
              <span className="text-muted-foreground">
                {lp.into}/{lp.span} XP
              </span>
            </div>
            <div className="h-3 border-2 border-foreground bg-background overflow-hidden">
              <div
                className="h-full bg-forest transition-all duration-500"
                style={{ width: `${lp.pct}%` }}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Link
              to="/battle"
              className="inline-flex items-center gap-2 border-2 border-foreground bg-gold px-4 h-11 font-bold uppercase text-sm tracking-tight hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform"
            >
              <Swords className="w-4 h-4" /> Battle a friend →
            </Link>
            <Link
              to="/play/fragments?region=Europe"
              className="inline-flex items-center gap-2 border-2 border-foreground bg-foreground text-background px-4 h-11 font-bold uppercase text-sm tracking-tight hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform"
            >
              Begin in Europe →
            </Link>
            <Link
              to="/review"
              className="inline-flex items-center gap-2 border-2 border-foreground bg-card px-4 h-11 font-bold uppercase text-sm tracking-tight hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform"
            >
              Review weak flags
            </Link>
          </div>
        </div>
      </section>

      <section className="atlas-card overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 sm:px-5 pt-4 pb-3 border-b-2 border-foreground">
          <div>
            <h2 className="font-display text-xl sm:text-2xl text-foreground">
              The Atlas
            </h2>
            <p className="text-xs text-muted-foreground font-medium">
              Each territory fills as you master its flag · hover to preview
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] text-muted-foreground">
            <LegendDot className="bg-land" label="Locked" />
            <LegendDot className="bg-terra" label="Learning" />
            <LegendDot className="bg-forest" label="Mastered" />
          </div>
        </div>
        <div className="bg-ocean">
          <WorldMap flags={state.flags} />
        </div>
      </section>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {REGIONS.map((r) => {
          const m = regionMastery(state.flags, r.id);
          const done = masteredInRegion(state.flags, r.id);
          const tot = regionTotal(r.id);
          return (
            <div key={r.id} className="atlas-card p-4 sm:p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display text-lg sm:text-xl text-foreground">
                  {r.id}
                </h3>
                <span className="text-xs text-muted-foreground font-bold">
                  {tot === 0 ? "—" : `${done}/${tot} · ${m}%`}
                </span>
              </div>
              <MasteryMeter value={m} />
              {tot === 0 ? (
                <p className="text-xs text-muted-foreground mt-4 italic">
                  Frozen continent — no flags to learn.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {MODES.map((md) => (
                    <Link
                      key={md.key}
                      to={`${md.path}?region=${encodeURIComponent(r.id)}`}
                      className="group border-2 border-foreground bg-card px-3 py-2 hover:bg-terra hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <md.icon className="w-4 h-4 text-foreground" />
                        <span className="text-sm font-bold uppercase tracking-tight">
                          {md.label}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-50 group-hover:opacity-100" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </section>

      <section className="grid sm:grid-cols-2 gap-4 sm:gap-5">
        <Link
          to="/battle"
          className="atlas-card p-5 hover:-translate-x-1 hover:-translate-y-1 transition-transform bg-gold"
        >
          <div className="flex items-center gap-3">
            <Swords className="w-6 h-6 text-foreground" />
            <div>
              <div className="font-bold uppercase">Multiplayer Battle</div>
              <div className="text-xs text-foreground/70 font-medium">
                Race a friend · most correct wins
              </div>
            </div>
          </div>
        </Link>
        <Link
          to="/dashboard"
          className="atlas-card p-5 hover:-translate-x-1 hover:-translate-y-1 transition-transform"
        >
          <div className="flex items-center gap-3">
            <Star className="w-6 h-6 text-foreground" />
            <div>
              <div className="font-bold uppercase">Stats & Stamps</div>
              <div className="text-xs text-muted-foreground font-medium">
                Progress, accuracy, passport
              </div>
            </div>
          </div>
        </Link>
      </section>

      <section className="atlas-card p-5">
        <h3 className="font-display text-lg sm:text-xl text-foreground mb-3">
          Passport
        </h3>
        <PassportStamps flags={state.flags} />
      </section>
    </div>
  );
}
