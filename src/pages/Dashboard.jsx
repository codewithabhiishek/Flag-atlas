import { Link } from "react-router-dom";
import { Flame, Target, Clock, Trophy, RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from "recharts";
import { useProgress } from "@/lib/ProgressContext";
import { levelProgress, rankFromMastered } from "@/lib/scoring";
import { masteredCount, weakestFlags, regionMastery } from "@/lib/derive";
import { REGIONS } from "@/data/regions";
import { COUNTRIES } from "@/data/countries";
import StatCard from "@/components/StatCard";
import PassportStamps from "@/components/PassportStamps";
import FlagImage from "@/components/FlagImage";

export default function Dashboard() {
  const { state, reset } = useProgress();
  const lp = levelProgress(state.xp);
  const rank = rankFromMastered(masteredCount(state.flags));
  const acc = state.stats.answered
    ? Math.round((state.stats.correct / state.stats.answered) * 100)
    : 0;
  const mins = Math.round(state.stats.timePlayedMs / 60000);
  const weak = weakestFlags(state.flags, 6);
  const chartData = REGIONS.map((r) => ({
    name: r.id.slice(0, 3),
    value: regionMastery(state.flags, r.id),
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-6">
        <h1 className="font-display text-3xl text-forest">Field Notebook</h1>
        <p className="text-sm text-muted-foreground">
          Level {lp.level} · {rank.title} · {lp.into}/{lp.span} XP to next
        </p>
        <div className="h-2 rounded-full bg-muted overflow-hidden mt-2 max-w-md">
          <div
            className="h-full bg-forest transition-all duration-500"
            style={{ width: `${lp.pct}%` }}
          />
        </div>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Flags mastered"
          value={masteredCount(state.flags)}
          sub={`of ${COUNTRIES.length}`}
          icon={Trophy}
        />
        <StatCard
          label="Accuracy"
          value={`${acc}%`}
          sub={`${state.stats.answered} answered`}
          icon={Target}
        />
        <StatCard
          label="Day streak"
          value={state.streak}
          sub="days"
          icon={Flame}
        />
        <StatCard
          label="Time played"
          value={`${mins}m`}
          sub="total"
          icon={Clock}
        />
      </section>

      <section className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-display text-lg text-forest mb-3">
            Mastery by region
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((d, i) => (
                    <Cell
                      key={i}
                      fill={
                        d.value >= 100
                          ? "hsl(var(--gold))"
                          : "hsl(var(--terra))"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-display text-lg text-forest mb-3">
            Weakest flags
          </h3>
          <ul className="space-y-2">
            {weak.length === 0 && (
              <li className="text-sm text-muted-foreground">
                No data yet — play a round.
              </li>
            )}
            {weak.map(({ c, acc: a, seen }) => (
              <li key={c.code} className="flex items-center gap-3">
                <div className="w-8 h-6 rounded overflow-hidden border border-border shrink-0">
                  <FlagImage code={c.code} className="w-full h-full" />
                </div>
                <span className="text-sm flex-1 truncate">{c.name}</span>
                <span className="text-xs text-muted-foreground">
                  {Math.round(a * 100)}% · {seen} seen
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 mb-6">
        <h3 className="font-display text-lg text-forest mb-3">
          Passport stamps
        </h3>
        <PassportStamps flags={state.flags} />
      </section>

      <section className="flex items-center justify-between rounded-2xl border border-border bg-card p-5">
        <div>
          <h3 className="font-medium text-forest">Reset progress</h3>
          <p className="text-xs text-muted-foreground">
            Clears all XP, flags and stamps.
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm("Reset all progress?")) reset();
          }}
          className="px-3 h-9 rounded-md border border-destructive text-destructive text-sm inline-flex items-center gap-1"
        >
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
      </section>

      <div className="mt-6 text-center">
        <Link
          to="/"
          className="text-sm text-muted-foreground hover:text-forest"
        >
          ← Back to map
        </Link>
      </div>
    </div>
  );
}
