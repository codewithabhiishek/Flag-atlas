import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, X } from "lucide-react";
import ModeShell from "@/components/ModeShell";
import SessionSummary from "@/components/SessionSummary";
import FlagImage from "@/components/FlagImage";
import { flagsByRegion, shuffle, pickOptions } from "@/data/countries";
import { useProgress } from "@/lib/ProgressContext";
import { cn } from "@/lib/utils";

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
  const [session, setSession] = useState({ correct: 0, wrong: 0, xp: 0 });
  const flag = queue[idx];
  const options = useMemo(() => pickOptions(flag.code, region, 4), [idx, seed]);

  useEffect(() => {
    touchStreak();
  }, [touchStreak]);

  if (outcome === "done") {
    return (
      <SessionSummary
        correct={session.correct}
        total={queue.length}
        xp={session.xp}
        onAgain={() => {
          setSeed((s) => s + 1);
          setIdx(0);
          setChosen([]);
          setOutcome(null);
          setSession({ correct: 0, wrong: 0, xp: 0 });
        }}
      />
    );
  }

  if (!flag) return null;

  const blur = Math.max(0, 14 - chosen.length * 4);

  function pick(opt) {
    if (outcome) return;
    if (opt.code === flag.code) {
      const xp = 12 + (3 - chosen.length) * 4;
      const quality = chosen.length === 0 ? 5 : chosen.length <= 1 ? 4 : 3;
      record(flag.code, { correct: true, quality, xpGain: xp });
      setOutcome("win");
      setSession((s) => ({ ...s, correct: s.correct + 1, xp: s.xp + xp }));
    } else {
      const nc = [...chosen, opt.code];
      setChosen(nc);
      if (nc.length >= 3) {
        record(flag.code, { correct: false, quality: 2, xpGain: 0 });
        setOutcome("lose");
        setSession((s) => ({ ...s, wrong: s.wrong + 1 }));
      }
    }
  }

  function next() {
    if (idx + 1 >= queue.length) setOutcome("done");
    else {
      setIdx((i) => i + 1);
      setChosen([]);
      setOutcome(null);
    }
  }

  return (
    <ModeShell title="Flag Fragments" region={region || "World"}>
      <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
        <span>
          Flag {idx + 1} / {queue.length}
        </span>
        <span>
          Score {session.correct} · +{session.xp} XP
        </span>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mx-auto max-w-md aspect-[3/2] rounded-lg overflow-hidden bg-muted relative">
          <div style={{ filter: `blur(${blur}px)` }} className="w-full h-full">
            <FlagImage code={flag.code} className="w-full h-full" />
          </div>
          <div className="absolute top-2 left-2 text-xs px-2 py-1 rounded-full bg-background/80 text-foreground">
            {chosen.length}/3 misses · blur {blur}px
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-3">
          Which country does this flag belong to?
        </p>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {options.map((opt) => {
            const wrong = chosen.includes(opt.code);
            const showAns = outcome && opt.code === flag.code;
            return (
              <button
                key={opt.code}
                disabled={!!outcome}
                onClick={() => pick(opt)}
                className={cn(
                  "h-11 rounded-lg border px-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors",
                  showAns
                    ? "border-gold text-gold bg-gold/10"
                    : wrong
                      ? "border-destructive text-destructive bg-destructive/10 line-through"
                      : "border-border hover:border-terra",
                )}
              >
                {showAns && <Check className="w-4 h-4" />}
                {wrong && <X className="w-4 h-4" />}
                {opt.name}
              </button>
            );
          })}
        </div>
      </div>
      {outcome && (
        <div className="mt-4 text-center">
          <p
            className={cn(
              "text-sm font-medium",
              outcome === "win" ? "text-forest" : "text-destructive",
            )}
          >
            {outcome === "win"
              ? `Correct! +${12 + (3 - chosen.length) * 4} XP`
              : `Answer: ${flag.name}`}
          </p>
          <button
            onClick={next}
            className="mt-3 px-5 h-10 rounded-md bg-forest text-primary-foreground text-sm"
          >
            {idx + 1 >= queue.length ? "Finish" : "Next flag"}
          </button>
        </div>
      )}
    </ModeShell>
  );
}
