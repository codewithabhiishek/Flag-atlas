import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Zap, Timer, Trophy } from "lucide-react";
import ModeShell from "@/components/ModeShell";
import FlagImage from "@/components/FlagImage";
import { flagsByRegion, shuffle, pickOptions } from "@/data/countries";
import { useProgress } from "@/lib/ProgressContext";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { formatElapsedTime, useElapsedTimer } from "@/hooks/use-elapsed-timer";
import { useFlagPrefetch } from "@/hooks/use-flag-prefetch";
import { playUiSound } from "@/lib/sounds";

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
  const questionStartedAtRef = useRef(Date.now());
  const elapsedMs = useElapsedTimer(running, seed);
  const lastTimerCueRef = useRef(null);

  const flag = pool[pos];
  useFlagPrefetch(pool, pos);
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

  // The final ten seconds become visually and audibly urgent, but use a
  // single quiet cue per second instead of a distracting alarm.
  useEffect(() => {
    if (time === 0 && lastTimerCueRef.current !== 0) {
      lastTimerCueRef.current = 0;
      playUiSound("timerEnd");
      return;
    }
    if (!running || time > 10 || lastTimerCueRef.current === time) return;
    lastTimerCueRef.current = time;
    playUiSound("timerWarning");
  }, [running, time]);

  // Record leaderboard exactly once when the game ends.
  // We use a ref for the final score to avoid stale closure issues.
  useEffect(() => {
    if (!running) {
      // Don't pollute the top-10 with zero-score entries from instant quits.
      if (finalScoreRef.current > 0) {
        recordLeaderboard(region || "World", finalScoreRef.current);
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
    questionStartedAtRef.current = Date.now();
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
      record(flag.code, { correct: true, quality: 5, xpGain: 5, timeMs: Date.now() - questionStartedAtRef.current });
      nextFlag();
    } else {
      comboRef.current = 0;
      setCombo(0);
      setFlash("no");
      record(flag.code, { correct: false, quality: 2, xpGain: 0, timeMs: Date.now() - questionStartedAtRef.current });
      setTime((s) => {
        const next = Math.max(0, s - 2);
        if (next === 0) setRunning(false);
        return next;
      });
      nextFlag();
    }
    const tid = setTimeout(() => setFlash(null), 250);
    return () => clearTimeout(tid);
  }

  // Keyboard support: Press A, B, C, D or 1, 2, 3, 4 to select matching answer option
  useEffect(() => {
    if (!running) return;

    function handleKeyDown(e) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.isComposing
      ) {
        return;
      }

      const key = e.key.toUpperCase();
      const keyMap = {
        A: 0,
        "1": 0,
        B: 1,
        "2": 1,
        C: 2,
        "3": 2,
        D: 3,
        "4": 3,
      };

      const optionIndex = keyMap[key];
      if (optionIndex !== undefined && options[optionIndex]) {
        e.preventDefault();
        pick(options[optionIndex]);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [running, options, flag]);

  function restart() {
    comboRef.current = 0;
    finalScoreRef.current = 0;
    questionStartedAtRef.current = Date.now();
    lastTimerCueRef.current = null;
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
    const accuracy = count > 0 ? Math.round((correctCount / count) * 100) : 0;

    return (
      <ModeShell title="Speed Run" region={region || "World"}>
        <div className="mx-auto max-w-md">
          <div className="atlas-card grid-paper p-6 sm:p-8 text-center brutal-shadow border-2 border-foreground bg-card">
            {/* Trophy / Zap Icon Badge */}
            <div className="inline-flex w-14 h-14 border-2 border-foreground bg-terra/20 text-terra items-center justify-center mb-4 brutal-shadow rounded-xl">
              <Zap className="w-7 h-7 fill-current" aria-hidden="true" />
            </div>

            <h2 className="font-display text-3xl sm:text-4xl text-foreground font-bold tracking-tight">
              Time's Up!
            </h2>

            {/* Main Score Hero */}
            <div className="mt-3 mb-6 inline-flex flex-col items-center">
              <span className="text-4xl sm:text-5xl font-display font-extrabold text-forest">
                {finalScoreRef.current}
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
                Total Points
              </span>
            </div>

            {/* Structured Stats Grid — Symmetric & Uniform */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-6">
              {/* Questions Correct / Total */}
              <div className="border-2 border-foreground/30 bg-background/80 rounded-lg p-2.5 sm:p-3 flex flex-col items-center justify-center">
                <span className="text-base sm:text-lg font-bold font-mono text-foreground">
                  {correctCount} <span className="text-xs text-muted-foreground font-normal">/ {count}</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">
                  Answered
                </span>
              </div>

              {/* Accuracy % */}
              <div className="border-2 border-foreground/30 bg-background/80 rounded-lg p-2.5 sm:p-3 flex flex-col items-center justify-center">
                <span className="text-base sm:text-lg font-bold font-mono text-forest">
                  {accuracy}%
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">
                  Accuracy
                </span>
              </div>

              {/* Best Streak / Combo */}
              <div className="border-2 border-foreground/30 bg-background/80 rounded-lg p-2.5 sm:p-3 flex flex-col items-center justify-center">
                <span className="text-base sm:text-lg font-bold font-mono text-terra">
                  {best}x
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">
                  Best Combo
                </span>
              </div>
            </div>

            {/* Time Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-terra/40 bg-terra/10 text-xs font-semibold text-terra mb-6">
              <Timer className="w-3.5 h-3.5" />
              <span>Finished in {formatElapsedTime(elapsedMs)}</span>
            </div>

            {/* Leaderboard Section */}
            <div className="border-2 border-foreground/30 bg-background/60 rounded-xl p-3 sm:p-4 mb-6 text-left">
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-gold" />
                  Leaderboard · {region || "World"}
                </h3>
                <span className="text-[10px] font-mono text-muted-foreground uppercase">Top 5</span>
              </div>
              <ol className="space-y-1.5">
                {lb.length === 0 && (
                  <li className="text-xs text-muted-foreground text-center py-2">No scores recorded yet</li>
                )}
                {lb.map((e, i) => {
                  const isCurrentRun = e.score === finalScoreRef.current && i === 0;
                  return (
                    <li
                      key={i}
                      className={cn(
                        "flex items-center justify-between text-xs sm:text-sm px-3 py-2 rounded-lg border font-mono font-medium transition-all",
                        i === 0
                          ? "bg-gold/20 border-gold/60 text-gold-foreground font-bold shadow-sm"
                          : "bg-card/70 border-border text-foreground",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span className={cn("w-5 text-center font-bold", i === 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground")}>
                          #{i + 1}
                        </span>
                        {isCurrentRun && (
                          <span className="text-[9px] font-sans font-bold bg-forest text-primary-foreground px-1.5 py-0.5 rounded uppercase">
                            New
                          </span>
                        )}
                      </span>
                      <span className="font-bold">{e.score} pts</span>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Action Buttons — Symmetrical & Bold */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/"
                className="inline-flex items-center justify-center border-2 border-foreground bg-card h-11 text-sm font-bold uppercase tracking-tight rounded-lg hover:bg-muted active:translate-y-0.5 transition-all"
              >
                Back to Map
              </Link>
              <button
                onClick={restart}
                className="inline-flex items-center justify-center border-2 border-foreground bg-forest text-primary-foreground h-11 text-sm font-bold uppercase tracking-tight rounded-lg hover:opacity-95 active:translate-y-0.5 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.25)]"
              >
                Play Again
              </button>
            </div>
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
            className={cn(
              "inline-flex min-w-10 justify-center",
              time <= 10 && "animate-pulse rounded bg-destructive/15 px-2 py-1 font-bold text-destructive",
            )}
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
        <p className="text-center text-sm text-muted-foreground mt-3 flex items-center justify-center gap-1.5 flex-wrap">
          <span>Choose the matching country</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-mono bg-muted/60 px-1.5 py-0.5 rounded border border-foreground/15 text-muted-foreground">
            Keys <kbd className="font-bold text-foreground">A</kbd>–<kbd className="font-bold text-foreground">D</kbd>
          </span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
          {options.map((opt, idx) => (
            <button
              key={opt.code}
              data-sound={opt.code === flag.code ? "success" : "error"}
              onClick={() => pick(opt)}
              aria-label={opt.name}
              className="group min-h-[44px] rounded-lg border-2 border-foreground bg-card px-3 py-2 text-sm font-semibold flex items-center gap-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all text-left select-none"
            >
              <span className="w-6 h-6 rounded-md bg-muted text-foreground/80 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-foreground/20 group-hover:bg-foreground group-hover:text-background transition-colors">
                {["A", "B", "C", "D"][idx] || idx + 1}
              </span>
              <span className="truncate flex-1 font-semibold text-sm sm:text-base leading-snug">{opt.name}</span>
            </button>
          ))}
        </div>
      </div>
    </ModeShell>
  );
}
