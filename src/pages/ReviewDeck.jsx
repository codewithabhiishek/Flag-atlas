import { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Check, X, Layers } from "lucide-react";
import ModeShell from "@/components/ModeShell";
import SessionSummary from "@/components/SessionSummary";
import FlagImage from "@/components/FlagImage";
import { COUNTRIES, pickOptions } from "@/data/countries";
import { useProgress } from "@/lib/ProgressContext";
import { isDue } from "@/lib/spacedRepetition";
import { cn } from "@/lib/utils";
import { formatElapsedTime, useElapsedTimer } from "@/hooks/use-elapsed-timer";
import { useFlagPrefetch } from "@/hooks/use-flag-prefetch";

export default function ReviewDeck() {
  const { state, touchStreak, record } = useProgress();
  const readyAtRef = useRef(0);
  const questionStartedAtRef = useRef(Date.now());

  // A card enters the review deck when it is due for spaced-repetition review
  // OR when its accuracy is weak (correct < 60% of seen, minimum 2 attempts).
  // Filtering on `r.wrong > 0` alone would trap every card that was ever
  // missed once — including well-learned cards — so we use a proper weakness
  // threshold instead.
  const deck = useMemo(() => {
    return COUNTRIES.filter((c) => {
      const r = state.flags[c.code];
      if (!r || r.seen === 0) return false;
      const isDueForReview = isDue(r.sr);
      const isWeak = r.seen >= 2 && r.correct / r.seen < 0.6;
      return isDueForReview || isWeak;
    });
  }, [state.flags]);

  // Snapshot the deck when a session starts. Deriving the playing deck
  // directly from `state.flags` would shrink it after every answer (each
  // recorded answer pushes that card's SR due date forward), which shifts all
  // later cards up and skips one whenever "Next card" also advances `idx`.
  // The live memo is still used for the empty-state check and to build a fresh
  // snapshot when starting a new session.
  const [sessionDeck, setSessionDeck] = useState(deck);

  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [done, setDone] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [seed, setSeed] = useState(0);
  const flag = sessionDeck[idx];
  useFlagPrefetch(sessionDeck, idx);
  const elapsedMs = useElapsedTimer(done < sessionDeck.length && Boolean(flag), seed);

  // Guarantee clean state reset and cooldown whenever question/card changes
  useEffect(() => {
    setChosen(null);
    readyAtRef.current = Date.now() + 220;
    questionStartedAtRef.current = Date.now();
  }, [flag?.code, seed]);

  // Deps keyed on flag?.code so options update whenever the flag changes.
  // Using deck.length would fail when deck re-builds but idx stays at 0.
  const options = useMemo(
    () => (flag ? pickOptions(flag.code, flag.region, 4) : []),
    // flag.code changes whenever the current card changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [flag?.code, seed],
  );

  useEffect(() => {
    touchStreak();
  }, [touchStreak]);

  function pick(opt) {
    if (chosen || !flag) return;
    if (Date.now() < readyAtRef.current) return;
    setChosen(opt.code);
    const ok = opt.code === flag.code;
    record(flag.code, {
      correct: ok,
      quality: ok ? 5 : 2,
      xpGain: ok ? 10 : 0,
      timeMs: Date.now() - questionStartedAtRef.current,
    });
    if (ok) setCorrect((c) => c + 1);
    setDone((d) => d + 1);
  }

  function next(e) {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (document.activeElement && typeof document.activeElement.blur === "function") {
      document.activeElement.blur();
    }
    setChosen(null);
    setIdx((i) => i + 1);
    setSeed((s) => s + 1);
  }

  // Keyboard support: A, B, C, D to pick; Enter / Space to advance
  useEffect(() => {
    if (done >= sessionDeck.length || !flag) return;

    function handleKeyDown(e) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.isComposing
      ) {
        return;
      }

      const key = e.key.toUpperCase();
      if (chosen) {
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
  }, [chosen, options, flag, done, sessionDeck.length]);

  if (sessionDeck.length === 0) {
    return (
      <ModeShell title="Review Deck" region="Weak flags">
        <div className="atlas-card p-8 text-center max-w-md mx-auto">
          <Layers className="w-12 h-12 mx-auto text-forest mb-3" />
          <h2 className="font-display text-xl mb-2">No flags need review!</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Cards appear here when they're due for spaced repetition or if your accuracy on them is below 60%.
          </p>
          <Link
            to="/atlas"
            className="inline-block px-4 py-2 rounded-md bg-forest text-primary-foreground text-sm font-medium"
          >
            Back to Atlas
          </Link>
        </div>
      </ModeShell>
    );
  }

  if (done >= sessionDeck.length || !flag) {
    return (
      <SessionSummary
        correct={correct}
        total={done}
        xp={correct * 10}
        timeMs={elapsedMs}
        onAgain={() => {
          // Rebuild the snapshot from the live deck so the new session reflects
          // the flags reviewed in the previous one (they are no longer due).
          setSessionDeck(deck);
          setIdx(0);
          setChosen(null);
          setDone(0);
          setCorrect(0);
          setSeed((s) => s + 1);
        }}
      />
    );
  }

  return (
    <ModeShell title="Review Deck" region="Weak flags">
      <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
        <span>
          Card {Math.min(idx + 1, sessionDeck.length)} / {sessionDeck.length}
        </span>
        <span>
          {correct} correct · +{correct * 10} XP
        </span>
        <span className="font-semibold">Time · {formatElapsedTime(elapsedMs)}</span>
      </div>
      <div key={flag.code} className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <div className="mx-auto max-w-md aspect-[3/2] rounded-lg overflow-hidden bg-muted">
          <FlagImage code={flag.code} className="w-full h-full" priority={true} />
        </div>
        <p className="text-center text-sm text-muted-foreground mt-3">
          Which country does this flag belong to?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
          {options.map((opt, idx) => {
            const isAns = opt.code === flag.code;
            const picked = chosen === opt.code;
            const reveal = chosen && (isAns || picked);
            const keyLetter = ["A", "B", "C", "D"][idx] || idx + 1;
            return (
              <button
                key={opt.code}
                type="button"
                disabled={!!chosen}
                data-sound={opt.code === flag.code ? "success" : "error"}
                onClick={() => pick(opt)}
                aria-label={`${opt.name}${reveal && isAns ? " — correct answer" : reveal && picked ? " — wrong answer" : ""}`}
                className={cn(
                  "group min-h-[44px] rounded-lg border-2 px-3 py-2 text-sm font-semibold flex items-center gap-2.5 transition-all text-left select-none",
                  reveal && isAns
                    ? "border-emerald-600 dark:border-emerald-400 bg-emerald-500/15 text-emerald-950 dark:text-emerald-100 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.9)]"
                    : reveal && picked
                      ? "border-destructive bg-destructive/15 text-destructive line-through shadow-[1px_1px_0px_0px_rgba(239,68,68,0.7)]"
                      : "border-foreground bg-card text-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
                )}
              >
                <span
                  className={cn(
                    "w-6 h-6 rounded-md font-mono font-bold text-xs flex items-center justify-center shrink-0 border transition-all duration-150",
                    reveal && isAns
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : reveal && picked
                        ? "bg-destructive text-white border-destructive shadow-sm"
                        : "bg-muted text-foreground/80 border-foreground/20 group-hover:bg-foreground group-hover:text-background",
                  )}
                >
                  {reveal && isAns ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : reveal && picked ? <X className="w-3.5 h-3.5 stroke-[3]" /> : keyLetter}
                </span>
                <span className="truncate flex-1 font-semibold text-sm sm:text-base leading-snug">{opt.name}</span>
              </button>
            );
          })}
        </div>
      </div>
      {chosen && (
        <div className="mt-4 text-center" role="status" aria-live="polite">
          <p className="text-sm font-medium mb-3">
            {chosen === flag.code
              ? <span className="text-forest">Correct! +10 XP</span>
              : <span className="text-destructive">Answer: {flag.name}</span>}
          </p>
          <button
            type="button"
            onClick={next}
            className="px-5 h-10 rounded-md bg-forest text-primary-foreground text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {idx + 1 >= sessionDeck.length ? "Finish" : "Next card"}
          </button>
        </div>
      )}
    </ModeShell>
  );
}
