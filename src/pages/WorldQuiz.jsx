import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Globe2, X } from "lucide-react";
import ModeShell from "@/components/ModeShell";
import SessionSummary from "@/components/SessionSummary";
import FlagImage from "@/components/FlagImage";
import { COUNTRIES, pickOptions, shuffle } from "@/data/countries";
import { useProgress } from "@/lib/ProgressContext";
import { cn } from "@/lib/utils";
import { formatElapsedTime, useElapsedTimer } from "@/hooks/use-elapsed-timer";
import { useFlagPrefetch } from "@/hooks/use-flag-prefetch";

// A complete Go Berserk run covers every country once, in a fresh random order.
const ROUND = COUNTRIES.length;

export default function WorldQuiz() {
  const { record, touchStreak } = useProgress();
  const [seed, setSeed] = useState(0);
  const queue = useMemo(() => shuffle(COUNTRIES).slice(0, ROUND), [seed]);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [session, setSession] = useState({ correct: 0, xp: 0 });
  const answerLocked = useRef(false);
  const questionStartedAtRef = useRef(Date.now());
  const elapsedMs = useElapsedTimer(index < queue.length, seed);
  const flag = queue[index];
  useFlagPrefetch(queue, index);
  const options = useMemo(
    () => (flag ? pickOptions(flag.code, null, 4) : []),
    [flag?.code],
  );

  useEffect(() => {
    touchStreak();
  }, [touchStreak]);

  useEffect(() => {
    answerLocked.current = false;
    setChosen(null);
    questionStartedAtRef.current = Date.now();
  }, [flag?.code]);

  function answer(option) {
    if (answerLocked.current || !flag) return;
    answerLocked.current = true;
    const correct = option.code === flag.code;
    const xp = correct ? 10 : 0;
    setChosen(option.code);
    record(flag.code, {
      correct,
      quality: correct ? 5 : 2,
      xpGain: xp,
      timeMs: Date.now() - questionStartedAtRef.current,
    });
    setSession((current) => ({
      correct: current.correct + (correct ? 1 : 0),
      xp: current.xp + xp,
    }));
  }

  function next() {
    setIndex((current) => current + 1);
  }

  // Keyboard support: Press A, B, C, D to pick; Enter / Space to advance to next
  useEffect(() => {
    if (index >= queue.length || !flag) return;

    function handleKeyDown(e) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.isComposing
      ) {
        return;
      }

      const key = e.key.toUpperCase();
      if (chosen !== null) {
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
        answer(options[optionIndex]);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [chosen, options, flag, index, queue.length]);

  if (index >= queue.length) {
    return (
      <SessionSummary
        correct={session.correct}
        total={queue.length}
        xp={session.xp}
        timeMs={elapsedMs}
        onAgain={() => {
          setSeed((value) => value + 1);
          setIndex(0);
          setChosen(null);
          setSession({ correct: 0, xp: 0 });
        }}
      />
    );
  }

  if (!flag) return null;

  return (
    <ModeShell title="Go Berserk" region="All countries">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="font-bold">Question {index + 1} / {queue.length}</span>
        <span className="inline-flex items-center gap-1 font-semibold"><Globe2 className="h-3.5 w-3.5" /> Time · {formatElapsedTime(elapsedMs)}</span>
      </div>
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <div className="mx-auto max-w-md aspect-[3/2] overflow-hidden rounded-lg border-2 border-foreground bg-muted">
          <FlagImage code={flag.code} className="h-full w-full" alt={`Flag quiz question ${index + 1}`} />
        </div>
        <p className="mt-3 text-center text-sm text-muted-foreground flex items-center justify-center gap-1.5 flex-wrap">
          <span>Which country does this flag belong to?</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-mono bg-muted/60 px-1.5 py-0.5 rounded border border-foreground/15 text-muted-foreground">
            Keys <kbd className="font-bold text-foreground">A</kbd>–<kbd className="font-bold text-foreground">D</kbd>
          </span>
        </p>
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {options.map((option, optIdx) => {
            const isCorrect = option.code === flag.code;
            const isChoice = chosen === option.code;
            const keyLetter = ["A", "B", "C", "D"][optIdx] || optIdx + 1;
            return (
              <button
                key={option.code}
                type="button"
                disabled={chosen !== null}
                data-sound={option.code === flag.code ? "success" : "error"}
                onClick={() => answer(option)}
                className={cn(
                  "min-h-12 border-2 px-3 py-2 text-left text-sm font-bold transition-all flex items-center gap-2.5 rounded-lg",
                  chosen === null
                    ? "border-foreground bg-card hover:-translate-x-0.5 hover:-translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.25)]"
                    : isCorrect
                      ? "border-emerald-600 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200"
                      : isChoice
                        ? "border-destructive bg-destructive/15 text-destructive"
                        : "border-border bg-muted/30 text-muted-foreground opacity-60",
                )}
              >
                <span className="w-6 h-6 rounded-md bg-muted text-foreground/80 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-foreground/20">
                  {chosen !== null && isCorrect ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : chosen !== null && isChoice && !isCorrect ? <X className="h-3.5 w-3.5 stroke-[3]" /> : keyLetter}
                </span>
                <span className="truncate flex-1 font-semibold text-sm sm:text-base leading-snug">{option.name}</span>
              </button>
            );
          })}
        </div>
        {chosen !== null && (
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t-2 border-foreground/20 pt-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn(
                  "text-xs font-black uppercase tracking-wider px-2 py-0.5 border-2 rounded",
                  chosen === flag.code
                    ? "border-emerald-600 bg-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                    : "border-destructive bg-destructive/20 text-destructive dark:text-rose-400"
                )}>
                  {chosen === flag.code ? "Correct · +10 XP" : "Incorrect"}
                </span>
                <span className="text-xs font-bold uppercase tracking-tight text-forest">
                  {chosen === flag.code ? "Added to Atlas Progress" : "Atlas Progress Updated"}
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
              data-sound="advance"
              onClick={next}
              className="h-10 shrink-0 border-2 border-foreground bg-foreground px-5 text-sm font-bold text-background shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 transition-transform self-end sm:self-center"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </ModeShell>
  );
}
