import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Zap, Timer } from "lucide-react";
import ModeShell from "@/components/ModeShell";
import FlagImage from "@/components/FlagImage";
import { flagsByRegion, shuffle, pickOptions } from "@/data/countries";
import { useProgress } from "@/lib/ProgressContext";
import confetti from "canvas-confetti";
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
  // Use a ref for combo so the pick() closure always reads the latest value
  // without needing to nest setState calls.
  const comboRef = useRef(0);
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const [time, setTime] = useState(DURATION);
  const [running, setRunning] = useState(true);
  const [flash, setFlash] = useState(null);
  const [count, setCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  // Track final score in a ref so the leaderboard effect always sees the
  // committed value — React batches state updates so reading `score` inside
  // the effect immediately after setScore may give a stale value.
  const finalScoreRef = useRef(0);

  const flag = pool[pos];
  const options = useMemo(
    () => (flag ? pickOptions(flag.code, region, 4) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [flag?.code, region],
  );

  useEffect(() => {
    touchStreak();
  }, [touchStreak]);

  // Timer — restarts cleanly whenever `seed` changes (restart) because the
  // effect re-runs when `seed` is in the deps via `running` reset in restart().
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
    // `seed` is intentionally in deps: restarting bumps seed → running becomes
    // true again → effect re-fires with a fresh interval.
  }, [running, seed]);

  // Record leaderboard exactly once when the game ends.
  // We use a ref for the final score to avoid stale closure issues.
  useEffect(() => {
    if (!running) {
      recordLeaderboard(region || "World", finalScoreRef.current);
      if (finalScoreRef.current > 0) {
        confetti({
          particleCount: 75,
          spread: 80,
          origin: { y: 0.55 },
          colors: ["#F59E0B", "#10B981", "#3B82F6", "#EF4444"],
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  function nextFlag() {
    setPos((p) => (p + 1) % pool.length);
  }

  function pick(opt) {
    if (!running) return;
    setCount((c) => c + 1);
    if (opt.code === flag.code) {
      const currentCombo = comboRef.current;
      const gain = Math.round(10 * (1 + currentCombo * 0.2));
      const newCombo = currentCombo + 1;
      comboRef.current = newCombo;
      setCombo(newCombo);
      setBest((b) => Math.max(b, newCombo));
      setScore((s) => {
        const next = s + gain;
        finalScoreRef.current = next;
        return next;
      });
      setCorrectCount((c) => c + 1);
      setFlash("ok");
      record(flag.code, { correct: true, quality: 5, xpGain: 5 });
      nextFlag();
    } else {
      comboRef.current = 0;
      setCombo(0);
      setFlash("no");
      record(flag.code, { correct: false, quality: 2, xpGain: 0 });
      setTime((s) => {
        const next = Math.max(0, s - 2);
        if (next === 0) setRunning(false);
        return next;
      });
      nextFlag();
    }
    const tid = setTimeout(() => setFlash(null), 250);
    // No cleanup needed — 250 ms is short and the component handles unmount
    // through the running→false guard; but we return a noop to be tidy.
    return () => clearTimeout(tid);
  }

  function restart() {
    comboRef.current = 0;
    finalScoreRef.current = 0;
    setPos(0);
    setScore(0);
    setCombo(0);
    setBest(0);
    setTime(DURATION);
    setCount(0);
    setCorrectCount(0);
    setFlash(null);
    // Set running before bumping seed so the timer effect fires correctly.
    setRunning(true);
    setSeed((s) => s + 1);
  }

  if (!running) {
    const lb = (state.leaderboards[region || "World"] || []).slice(0, 5);
    return (
      <ModeShell title="Speed Run" region={region || "World"}>
        <div className="text-center py-10">
          <Zap className="w-10 h-10 mx-auto text-terra mb-3" aria-hidden="true" />
          <h2 className="font-display text-3xl text-forest">Time!</h2>
          <p className="text-2xl font-display text-forest mt-2">{finalScoreRef.current} pts</p>
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
              className="px-4 h-10 inline-flex items-center rounded-md border border-border text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Map
            </Link>
            <button
              onClick={restart}
              className="px-4 h-10 inline-flex items-center rounded-md bg-forest text-primary-foreground text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Again
            </button>
          </div>
        </div>
      </ModeShell>
    );
  }

  if (!flag) return null;

  return (
    <ModeShell title="Speed Run" region={region || "World"}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Timer className="w-4 h-4 text-terra" aria-hidden="true" />
          <span
            className={cn(time <= 10 && "text-destructive font-medium")}
            aria-label={`${time} seconds remaining`}
            aria-live="polite"
            aria-atomic="true"
          >
            {time}s
          </span>
        </div>
        <div className="text-sm">
          Score <b className="text-forest">{score}</b> · Combo {combo}x
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <div
          className={cn(
            "mx-auto max-w-md aspect-[3/2] rounded-lg overflow-hidden bg-muted transition-shadow",
            flash === "ok" && "ring-2 ring-forest",
            flash === "no" && "ring-2 ring-destructive",
          )}
          aria-live="polite"
          aria-atomic="true"
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
              aria-label={opt.name}
              className="h-11 rounded-lg border border-border px-3 text-sm font-medium hover:border-terra transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {opt.name}
            </button>
          ))}
        </div>
      </div>
    </ModeShell>
  );
}
