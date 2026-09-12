import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, X, Layers } from "lucide-react";
import ModeShell from "@/components/ModeShell";
import SessionSummary from "@/components/SessionSummary";
import FlagImage from "@/components/FlagImage";
import { COUNTRIES, pickOptions } from "@/data/countries";
import { useProgress } from "@/lib/ProgressContext";
import { isDue } from "@/lib/spacedRepetition";
import { cn } from "@/lib/utils";

export default function ReviewDeck() {
  const { state, touchStreak, record } = useProgress();
  const deck = useMemo(() => {
    return COUNTRIES.filter((c) => {
      const r = state.flags[c.code];
      if (!r || r.seen === 0) return false;
      return isDue(r.sr) || r.wrong > 0;
    })
      .sort(
        (a, b) =>
          (state.flags[a.code].sr?.due || 0) -
          (state.flags[b.code].sr?.due || 0),
      )
      .slice(0, 20);
  }, [state.flags]);

  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [done, setDone] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [seed, setSeed] = useState(0);

  useEffect(() => {
    touchStreak();
  }, [touchStreak]);

  const flag = deck[idx];
  const options = useMemo(
    () => (flag ? pickOptions(flag.code, "", 4) : []),
    [idx, seed, deck.length],
  );

  if (deck.length === 0) {
    return (
      <ModeShell title="Review">
        <div className="text-center py-16">
          <Layers className="w-10 h-10 mx-auto text-terra mb-3" />
          <h2 className="font-display text-2xl text-forest">No weak flags</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Play a round to build your review deck.
          </p>
          <Link
            to="/"
            className="mt-5 inline-block px-4 h-10 leading-10 rounded-md bg-forest text-primary-foreground text-sm"
          >
            Back to map
          </Link>
        </div>
      </ModeShell>
    );
  }

  if (idx >= deck.length) {
    return (
      <SessionSummary
        correct={correct}
        total={done}
        xp={correct * 10}
        onAgain={() => {
          setIdx(0);
          setChosen(null);
          setDone(0);
          setCorrect(0);
          setSeed((s) => s + 1);
        }}
      />
    );
  }

  function pick(opt) {
    if (chosen) return;
    setChosen(opt.code);
    const ok = opt.code === flag.code;
    record(flag.code, {
      correct: ok,
      quality: ok ? 5 : 2,
      xpGain: ok ? 10 : 0,
    });
    if (ok) setCorrect((c) => c + 1);
    setDone((d) => d + 1);
  }
  function next() {
    setChosen(null);
    setIdx((i) => i + 1);
    setSeed((s) => s + 1);
  }

  return (
    <ModeShell title="Review Deck" region="Weak flags">
      <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
        <span>
          Card {Math.min(idx + 1, deck.length)} / {deck.length}
        </span>
        <span>
          {correct} correct · +{correct * 10} XP
        </span>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mx-auto max-w-md aspect-[3/2] rounded-lg overflow-hidden bg-muted">
          <FlagImage code={flag.code} className="w-full h-full" />
        </div>
        <p className="text-center text-sm text-muted-foreground mt-3">
          Which country does this flag belong to?
        </p>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {options.map((opt) => {
            const isAns = opt.code === flag.code;
            const picked = chosen === opt.code;
            const reveal = chosen && (isAns || picked);
            return (
              <button
                key={opt.code}
                disabled={!!chosen}
                onClick={() => pick(opt)}
                className={cn(
                  "h-11 rounded-lg border px-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors",
                  reveal && isAns
                    ? "border-gold text-gold bg-gold/10"
                    : reveal && picked
                      ? "border-destructive text-destructive bg-destructive/10"
                      : "border-border",
                )}
              >
                {reveal && isAns && <Check className="w-4 h-4" />}
                {reveal && picked && !isAns && <X className="w-4 h-4" />}
                {opt.name}
              </button>
            );
          })}
        </div>
      </div>
      {chosen && (
        <div className="mt-4 text-center">
          <button
            onClick={next}
            className="px-5 h-10 rounded-md bg-forest text-primary-foreground text-sm"
          >
            {idx + 1 >= deck.length ? "Finish" : "Next card"}
          </button>
        </div>
      )}
    </ModeShell>
  );
}
