import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Zap, Timer } from "lucide-react";
import ModeShell from "@/components/ModeShell";
import FlagImage from "@/components/FlagImage";
import { flagsByRegion, shuffle, pickOptions } from "@/data/countries";
import { useProgress } from "@/lib/ProgressContext";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { formatElapsedTime, useElapsedTimer } from "@/hooks/use-elapsed-timer";
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
    // No cleanup needed — 250 ms is short and the component handles unmount
    // through the running→false guard; but we return a noop to be tidy.
    return () => clearTimeout(tid);
  }

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
    return (
      <ModeShell title="Speed Run" region={region || "World"}>
        <div className="text-center py-10">
          <Zap className="w-10 h-10 mx-auto text-terra mb-3" aria-hidden="true" />
          <h2 className="font-display text-3xl text-forest">Time!</h2>
          <p className="text-2xl font-display text-forest mt-2">{finalScoreRef.current} pts</p>
          <p className="text-sm text-muted-foreground">
            {correctCount} correct · best combo {best}x
          </p>
          <p className="mt-1 text-sm font-semibold text-terra">Finished in {formatElapsedTime(elapsedMs)}</p>
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
        <p className="text-center text-sm text-muted-foreground mt-3">
          Tap the matching country
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
