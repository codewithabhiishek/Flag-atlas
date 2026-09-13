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

  function answer(option) {
    if (answerLocked.current) return;
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
        <p className="mt-3 text-center text-sm text-muted-foreground">Which country does this flag belong to?</p>
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {options.map((option) => {
            const isCorrect = option.code === flag.code;
            const isChoice = chosen === option.code;
            return (
              <button
                key={option.code}
                type="button"
                disabled={chosen !== null}
                data-sound={option.code === flag.code ? "success" : "error"}
                onClick={() => answer(option)}
                className={cn(
                  "min-h-12 border-2 px-3 text-left text-sm font-bold transition-all",
                  chosen === null
                    ? "border-foreground bg-card hover:-translate-x-0.5 hover:-translate-y-0.5"
                    : isCorrect
                      ? "border-emerald-600 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200"
                      : isChoice
                        ? "border-destructive bg-destructive/15 text-destructive"
                        : "border-border bg-muted/30 text-muted-foreground opacity-60",
                )}
              >
                <span className="inline-flex items-center gap-2">
                  {chosen !== null && isCorrect && <Check className="h-4 w-4" />}
                  {chosen !== null && isChoice && !isCorrect && <X className="h-4 w-4" />}
                  {option.name}
                </span>
              </button>
            );
          })}
        </div>
        {chosen !== null && (
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              {chosen === flag.code ? "Correct — +10 XP" : `The answer was ${flag.name}.`}
            </p>
            <button type="button" data-sound="advance" onClick={next} className="h-10 shrink-0 border-2 border-foreground bg-foreground px-4 text-sm font-bold text-background">
              Next →
            </button>
          </div>
        )}
      </div>
    </ModeShell>
  );
}
