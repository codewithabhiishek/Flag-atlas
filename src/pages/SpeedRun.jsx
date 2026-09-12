import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Zap, Timer } from "lucide-react";
import ModeShell from "@/components/ModeShell";
import FlagImage from "@/components/FlagImage";
import { flagsByRegion, shuffle, pickOptions } from "@/data/countries";
import { useProgress } from "@/lib/ProgressContext";
import { cn } from "@/lib/utils";

const DURATION = 45;

export default function SpeedRun() {
  const [sp] = useSearchParams();
  const region = sp.get("region") || "";
  const { touchStreak, record, recordLeaderboard, state } = useProgress();
  const [seed, setSeed] = useState(0);
  const pool = useMemo(() => shuffle(flagsByRegion(region)), [region, seed]);
  const [pos, setPos] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const [time, setTime] = useState(DURATION);
  const [running, setRunning] = useState(true);
  const [flash, setFlash] = useState(null);
  const [count, setCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const flag = pool[pos];
  const options = useMemo(() => pickOptions(flag.code, region, 4), [pos, seed]);

  useEffect(() => {
    touchStreak();
  }, [touchStreak]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setTime((s) => {
        if (s <= 1) {
          clearInterval(t);
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, seed]);

  useEffect(() => {
    if (!running && count > 0 && !finished) {
      setFinished(true);
      recordLeaderboard(region || "World", score);
    }
  }, [running, count, score, region, recordLeaderboard, finished]);

  function nextFlag() {
    setPos((p) => (p + 1) % pool.length);
  }

  function pick(opt) {
    if (!running) return;
    setCount((c) => c + 1);
    if (opt.code === flag.code) {
      const gain = Math.round(10 * (1 + combo * 0.2));
      setScore((s) => s + gain);
      setCombo((c) => {
        const n = c + 1;
        setBest((b) => Math.max(b, n));
        return n;
      });
      setCorrectCount((c) => c + 1);
      setFlash("ok");
      record(flag.code, { correct: true, quality: 5, xpGain: 5 });
      nextFlag();
    } else {
      setCombo(0);
      setFlash("no");
      record(flag.code, { correct: false, quality: 2, xpGain: 0 });
      setTime((s) => Math.max(0, s - 2));
      nextFlag();
    }
    setTimeout(() => setFlash(null), 250);
  }

  function restart() {
    setSeed((s) => s + 1);
    setPos(0);
    setScore(0);
    setCombo(0);
    setBest(0);
    setTime(DURATION);
    setRunning(true);
    setCount(0);
    setCorrectCount(0);
    setFinished(false);
    setFlash(null);
  }

  if (!running) {
    const lb = (state.leaderboards[region || "World"] || []).slice(0, 5);
    return (
      <ModeShell title="Speed Run" region={region || "World"}>
        <div className="text-center py-10">
          <Zap className="w-10 h-10 mx-auto text-terra mb-3" />
          <h2 className="font-display text-3xl text-forest">Time!</h2>
          <p className="text-2xl font-display text-forest mt-2">{score} pts</p>
          <p className="text-sm text-muted-foreground">
            {correctCount} correct · best combo {best}x
          </p>
          <div className="max-w-xs mx-auto mt-6 text-left">
            <h3 className="text-sm font-medium text-forest mb-2">
              Leaderboard · {region || "World"}
            </h3>
            <ol className="space-y-1">
              {lb.length === 0 && (
                <li className="text-xs text-muted-foreground">No scores yet</li>
              )}
              {lb.map((e, i) => (
                <li
                  key={i}
                  className={cn(
                    "flex justify-between text-sm px-3 py-1.5 rounded-md",
                    i === 0 ? "bg-gold/10 text-gold" : "bg-muted",
                  )}
                >
                  <span>#{i + 1}</span>
                  <span>{e.score}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="flex gap-2 justify-center mt-6">
            <Link
              to="/"
              className="px-4 h-10 inline-flex items-center rounded-md border border-border text-sm"
            >
              Map
            </Link>
            <button
              onClick={restart}
              className="px-4 h-10 inline-flex items-center rounded-md bg-forest text-primary-foreground text-sm"
            >
              Again
            </button>
          </div>
        </div>
      </ModeShell>
    );
  }

  return (
    <ModeShell title="Speed Run" region={region || "World"}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Timer className="w-4 h-4 text-terra" />
          <span className={cn(time <= 10 && "text-destructive font-medium")}>
            {time}s
          </span>
        </div>
        <div className="text-sm">
          Score <b className="text-forest">{score}</b> · Combo {combo}x
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <div
          className={cn(
            "mx-auto max-w-md aspect-[3/2] rounded-lg overflow-hidden bg-muted transition",
            flash === "ok" && "ring-2 ring-forest",
            flash === "no" && "ring-2 ring-destructive",
          )}
        >
          <FlagImage code={flag.code} className="w-full h-full" />
        </div>
        <p className="text-center text-sm text-muted-foreground mt-3">
          Tap the matching country
        </p>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {options.map((opt) => (
            <button
              key={opt.code}
              onClick={() => pick(opt)}
              className="h-11 rounded-lg border border-border px-3 text-sm font-medium hover:border-terra transition-colors"
            >
              {opt.name}
            </button>
          ))}
        </div>
      </div>
    </ModeShell>
  );
}
