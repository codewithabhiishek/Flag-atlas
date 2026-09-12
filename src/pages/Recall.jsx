import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Eye } from "lucide-react";
import ModeShell from "@/components/ModeShell";
import SessionSummary from "@/components/SessionSummary";
import FlagImage from "@/components/FlagImage";
import { flagsByRegion, shuffle } from "@/data/countries";
import { useProgress } from "@/lib/ProgressContext";
import { formatElapsedTime, useElapsedTimer } from "@/hooks/use-elapsed-timer";

const ROUND = 10;

export default function Recall() {
  const [sp] = useSearchParams();
  const region = sp.get("region") || "";
  const { touchStreak, record } = useProgress();
  const [seed, setSeed] = useState(0);
  const queue = useMemo(
    () => shuffle(flagsByRegion(region)).slice(0, ROUND),
    [region, seed],
  );
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);
  const [session, setSession] = useState({ correct: 0, xp: 0 });
  const questionStartedAtRef = useRef(Date.now());
  const elapsedMs = useElapsedTimer(!done, seed);
  const flag = queue[idx];

  useEffect(() => {
    touchStreak();
  }, [touchStreak]);

  useEffect(() => {
    questionStartedAtRef.current = Date.now();
  }, [flag?.code]);

  if (done) {
    return (
      <SessionSummary
        correct={session.correct}
        total={queue.length}
        xp={session.xp}
        timeMs={elapsedMs}
        onAgain={() => {
          setSeed((s) => s + 1);
          setIdx(0);
          setRevealed(false);
          setDone(false);
          setSession({ correct: 0, xp: 0 });
        }}
      />
    );
  }

  if (!flag) return null;

  function answer(remembered) {
    record(flag.code, {
      correct: remembered,
      quality: remembered ? 5 : 2,
      xpGain: remembered ? 8 : 0,
      timeMs: Date.now() - questionStartedAtRef.current,
    });
    setSession((s) => ({
      correct: s.correct + (remembered ? 1 : 0),
      xp: s.xp + (remembered ? 8 : 0),
    }));
    if (idx + 1 >= queue.length) setDone(true);
    else {
      setIdx((i) => i + 1);
      setRevealed(false);
    }
  }

  return (
    <ModeShell title="Recall" region={region || "World"}>
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
        <span>{idx + 1} / {queue.length}</span>
        <span className="font-semibold">Time · {formatElapsedTime(elapsedMs)}</span>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-xs uppercase tracking-widest text-terra">
          Visualize the flag of
        </p>
        <h2 className="font-display text-3xl text-forest mt-1">{flag.name}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Capital · {flag.capital}
        </p>
        <div className="mx-auto mt-5 max-w-md aspect-[3/2] rounded-lg overflow-hidden bg-muted flex items-center justify-center">
          {revealed ? (
            <FlagImage code={flag.code} className="w-full h-full" />
          ) : (
            <button
              onClick={() => setRevealed(true)}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-forest"
            >
              <Eye className="w-5 h-5" /> Reveal flag
            </button>
          )}
        </div>
        {revealed && (
          <div className="flex gap-2 justify-center mt-5">
            <button
              onClick={() => answer(false)}
              className="px-4 h-10 rounded-md border border-border text-sm"
            >
              Forgot
            </button>
            <button
              onClick={() => answer(true)}
              className="px-4 h-10 rounded-md bg-forest text-primary-foreground text-sm"
            >
              Remembered · +8 XP
            </button>
          </div>
        )}
      </div>
    </ModeShell>
  );
}
