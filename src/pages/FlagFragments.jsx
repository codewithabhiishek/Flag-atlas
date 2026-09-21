import { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, X } from "lucide-react";
import ModeShell from "@/components/ModeShell";
import SessionSummary from "@/components/SessionSummary";
import FlagImage from "@/components/FlagImage";
import { flagsByRegion, shuffle, pickOptions } from "@/data/countries";
import { useProgress } from "@/lib/ProgressContext";
import { cn } from "@/lib/utils";
import { formatElapsedTime, useElapsedTimer } from "@/hooks/use-elapsed-timer";
import { useFlagPrefetch } from "@/hooks/use-flag-prefetch";

const ROUND = 10;

export default function FlagFragments() {
  const [sp] = useSearchParams();
  const region = sp.get("region") || "";
  const { touchStreak, record } = useProgress();
  const [seed, setSeed] = useState(0);
  const queue = useMemo(
    () => shuffle(flagsByRegion(region)).slice(0, ROUND),
    [region, seed],
  );
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState([]);
  const [outcome, setOutcome] = useState(null);
  // Store earned XP at answer time so the display doesn't recalculate on re-render
  const [earnedXp, setEarnedXp] = useState(0);
  const [session, setSession] = useState({ correct: 0, wrong: 0, xp: 0 });
  const readyAtRef = useRef(0);
  const questionStartedAtRef = useRef(Date.now());
  const elapsedMs = useElapsedTimer(outcome !== "done", seed);
  const flag = queue[idx];
  useFlagPrefetch(queue, idx);

  // Guarantee clean state reset and cooldown whenever question/flag changes
  useEffect(() => {
    setChosen([]);
    setOutcome(null);
    readyAtRef.current = Date.now() + 220;
    questionStartedAtRef.current = Date.now();
  }, [flag?.code, seed]);

  // Deps keyed on flag.code + region so options always match the current flag.
  // Using idx/seed would fail when seed changes and idx stays at 0.
  const options = useMemo(
    () => (flag ? pickOptions(flag.code, region, 4) : []),
    // flag.code changes whenever the current flag changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [flag?.code, region],
  );

  useEffect(() => {
    touchStreak();
  }, [touchStreak]);

  function pick(opt) {
    if (outcome || !flag) return;
    if (Date.now() < readyAtRef.current) return;
    if (opt.code === flag.code) {
      const xp = 12 + (3 - chosen.length) * 4;
      const quality = chosen.length === 0 ? 5 : chosen.length <= 1 ? 4 : 3;
      record(flag.code, { correct: true, quality, xpGain: xp, timeMs: Date.now() - questionStartedAtRef.current });
      setEarnedXp(xp);
      setOutcome("win");
      setSession((s) => ({ ...s, correct: s.correct + 1, xp: s.xp + xp }));
    } else {
      const nc = [...chosen, opt.code];
      setChosen(nc);
      if (nc.length >= 3) {
        record(flag.code, { correct: false, quality: 2, xpGain: 0, timeMs: Date.now() - questionStartedAtRef.current });
        setOutcome("lose");
        setSession((s) => ({ ...s, wrong: s.wrong + 1 }));
      }
    }
  }

  function next(e) {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (document.activeElement && typeof document.activeElement.blur === "function") {
      document.activeElement.blur();
    }
    if (idx + 1 >= queue.length) {
      setOutcome("done");
    } else {
      setIdx((i) => i + 1);
      setChosen([]);
      setOutcome(null);
      setEarnedXp(0);
    }
  }

  // Keyboard support: Press A, B, C, D to pick; Enter / Space to advance to next
  useEffect(() => {
    if (outcome === "done" || !flag) return;

    function handleKeyDown(e) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.isComposing ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey
      ) {
        return;
      }

      const key = e.key.toUpperCase();
      if (outcome) {
        if (key === "ENTER" || key === " " || key === "ARROW_RIGHT") {
          e.preventDefault();
          next();
        }
        return;
      }

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
  }, [outcome, options, flag, idx, queue.length]);

  if (outcome === "done") {
    return (
      <SessionSummary
        correct={session.correct}
        total={queue.length}
        xp={session.xp}
        timeMs={elapsedMs}
        onAgain={() => {
          setSeed((s) => s + 1);
          setIdx(0);
          setChosen([]);
          setOutcome(null);
          setEarnedXp(0);
          setSession({ correct: 0, wrong: 0, xp: 0 });
        }}
      />
    );
  }

  if (!flag) return null;

  const blur = Math.max(0, 14 - chosen.length * 4);

  return (
    <ModeShell title="Flag Fragments" region={region || "World"}>
      <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
        <span>
          Flag {idx + 1} / {queue.length}
        </span>
        <span>
          Score {session.correct} · +{session.xp} XP
        </span>
        <span className="font-semibold">Time · {formatElapsedTime(elapsedMs)}</span>
      </div>
      <div key={flag.code} className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <div className="mx-auto max-w-md aspect-[3/2] rounded-lg overflow-hidden bg-muted relative">
          <div style={{ filter: `blur(${blur}px)` }} className="w-full h-full">
            <FlagImage code={flag.code} className="w-full h-full" priority={true} />
          </div>
          <div className="absolute top-2 left-2 text-xs px-2 py-1 rounded-full bg-background/80 text-foreground">
            {chosen.length}/3 misses · blur {blur}px
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-3 flex items-center justify-center gap-1.5 flex-wrap">
          <span>Which country does this flag belong to?</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-mono bg-muted/60 px-1.5 py-0.5 rounded border border-foreground/15 text-muted-foreground">
            Keys <kbd className="font-bold text-foreground">A</kbd>–<kbd className="font-bold text-foreground">D</kbd>
          </span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
          {options.map((opt, idx) => {
            const wrong = chosen.includes(opt.code);
            const showAns = outcome && opt.code === flag.code;
            const keyLetter = ["A", "B", "C", "D"][idx] || idx + 1;
            return (
              <button
                key={opt.code}
                type="button"
                disabled={!!outcome}
                data-sound={opt.code === flag.code ? "success" : "error"}
                onClick={() => pick(opt)}
                aria-pressed={showAns ? true : wrong ? false : undefined}
                aria-label={`${opt.name}${showAns ? " — correct answer" : wrong ? " — wrong answer" : ""}`}
                className={cn(
                  "group min-h-[44px] rounded-lg border-2 px-3 py-2 text-sm font-semibold flex items-center gap-2.5 transition-all text-left select-none",
                  showAns
                    ? "border-emerald-600 dark:border-emerald-400 bg-emerald-500/15 text-emerald-950 dark:text-emerald-100 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.9)]"
                    : wrong
                      ? "border-destructive bg-destructive/15 text-destructive line-through shadow-[1px_1px_0px_0px_rgba(239,68,68,0.7)]"
                      : "border-foreground bg-card text-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
                )}
              >
                <span
                  className={cn(
                    "w-6 h-6 rounded-md font-mono font-bold text-xs flex items-center justify-center shrink-0 border transition-all duration-150",
                    showAns
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : wrong
                        ? "bg-destructive text-white border-destructive shadow-sm"
                        : "bg-muted text-foreground/80 border-foreground/20 group-hover:bg-foreground group-hover:text-background",
                  )}
                >
                  {showAns ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : wrong ? <X className="w-3.5 h-3.5 stroke-[3]" /> : keyLetter}
                </span>
                <span className="truncate flex-1 font-semibold text-sm sm:text-base leading-snug">{opt.name}</span>
              </button>
            );
          })}
        </div>
      </div>
      {outcome && (
        <div className="mt-4 border-2 border-foreground bg-card p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn(
                  "text-xs font-black uppercase tracking-wider px-2 py-0.5 border-2 rounded",
                  outcome === "win"
                    ? "border-emerald-600 bg-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                    : "border-destructive bg-destructive/20 text-destructive dark:text-rose-400"
                )}>
                  {outcome === "win" ? `Correct · +${earnedXp} XP` : "Incorrect"}
                </span>
                <span className="text-xs font-bold uppercase tracking-tight text-forest">
                  {outcome === "win" ? "Added to Atlas Progress" : "Atlas Progress Updated"}
                </span>
              </div>
              <div className="text-sm font-bold text-foreground">
                {flag.name}
                <span className="text-muted-foreground font-semibold ml-1.5 text-xs sm:text-sm">
                  · {flag.region}{flag.capital ? ` · Capital: ${flag.capital}` : ""}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={next}
              className="h-10 shrink-0 border-2 border-foreground bg-foreground px-5 text-sm font-bold text-background shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 transition-transform self-end sm:self-center"
            >
              {idx + 1 >= queue.length ? "Finish →" : "Next flag →"}
            </button>
          </div>
        </div>
      )}
    </ModeShell>
  );
}
