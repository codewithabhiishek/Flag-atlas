import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Undo2 } from "lucide-react";
import ModeShell from "@/components/ModeShell";
import SessionSummary from "@/components/SessionSummary";
import FlagImage from "@/components/FlagImage";
import { BUILDABLE } from "@/data/buildableFlags";
import { byCode, shuffle } from "@/data/countries";
import { useProgress } from "@/lib/ProgressContext";
import { cn } from "@/lib/utils";

const DISTRACTORS = [
  "#000000",
  "#FFFFFF",
  "#FF0000",
  "#0033A0",
  "#009246",
  "#FFCE00",
  "#ED2939",
  "#FCD116",
  "#0000FF",
  "#009949",
  "#7F1414",
  "#0A0A0A",
];
const ROUND = 8;

export default function FlagBuilder() {
  const [sp] = useSearchParams();
  const region = sp.get("region") || "";
  const { touchStreak, record } = useProgress();
  const [seed, setSeed] = useState(0);
  const queue = useMemo(() => {
    const list = region
      ? BUILDABLE.filter((b) => byCode(b.code)?.region === region)
      : BUILDABLE;
    return shuffle(list).slice(0, ROUND);
  }, [region, seed]);
  const [idx, setIdx] = useState(0);
  const [slots, setSlots] = useState([]);
  const [outcome, setOutcome] = useState(null);
  const [session, setSession] = useState({ correct: 0, xp: 0 });
  const questionStartedAtRef = useRef(Date.now());

  const item = queue[idx];
  const target = item ? item.stripes : [];
  const palette = useMemo(() => {
    const distracts = shuffle(
      DISTRACTORS.filter((d) => !target.includes(d)),
    ).slice(0, 4);
    return shuffle([...target, ...distracts]);
  }, [idx, seed]);

  useEffect(() => {
    touchStreak();
  }, [touchStreak]);

  useEffect(() => {
    questionStartedAtRef.current = Date.now();
  }, [item?.code]);

  if (outcome === "done") {
    return (
      <SessionSummary
        correct={session.correct}
        total={queue.length}
        xp={session.xp}
        onAgain={() => {
          setSeed((s) => s + 1);
          setIdx(0);
          setSlots([]);
          setOutcome(null);
          setSession({ correct: 0, xp: 0 });
        }}
      />
    );
  }

  if (!item) {
    return (
      <ModeShell title="Flag Builder" region={region || "World"}>
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <h2 className="font-display text-2xl text-foreground">No buildable flags yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Flag Builder only includes countries with stripe-pattern data. Choose another game mode for {region || "this selection"}.
          </p>
        </div>
      </ModeShell>
    );
  }

  function place(color) {
    if (outcome || slots.length >= target.length) return;
    setSlots((s) => [...s, color]);
  }
  function removeAt(i) {
    if (outcome) return;
    setSlots((s) => s.filter((_, j) => j !== i));
  }
  function submit() {
    let correct = 0;
    target.forEach((c, i) => {
      if (slots[i] === c) correct++;
    });
    const perfect = correct === target.length;
    const xp = Math.round((10 * correct) / target.length);
    record(item.code, {
      correct: perfect,
      // A partial reconstruction is useful feedback, but it is not a
      // successful recall and therefore must not advance mastery.
      quality: perfect ? 5 : 2,
      xpGain: xp,
      timeMs: Date.now() - questionStartedAtRef.current,
    });
    setSession((s) => ({
      correct: s.correct + (perfect ? 1 : 0),
      xp: s.xp + xp,
    }));
    setOutcome({ correct, xp, perfect });
  }
  function next() {
    if (idx + 1 >= queue.length) setOutcome("done");
    else {
      setIdx((i) => i + 1);
      setSlots([]);
      setOutcome(null);
    }
  }

  const horiz = item.orientation !== "vertical";
  return (
    <ModeShell title="Flag Builder" region={region || "World"}>
      <div className="text-xs text-muted-foreground mb-4">
        {idx + 1} / {queue.length}
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground text-center">
          Reconstruct the flag of{" "}
          <b className="text-foreground">{byCode(item.code)?.name}</b> — pick
          the colors in order.
        </p>
        <div
          className={cn(
            "mx-auto mt-4 flex rounded-lg overflow-hidden border border-border",
            horiz ? "max-w-md aspect-[3/2]" : "max-w-[200px] aspect-[2/3]",
          )}
          style={{ flexDirection: horiz ? "row" : "column" }}
        >
          {Array.from({ length: target.length }).map((_, i) => (
            <div
              key={i}
              onClick={() => slots[i] && removeAt(i)}
              className={cn(
                "flex-1 flex items-center justify-center cursor-pointer transition-colors",
                !slots[i] && "bg-muted",
              )}
              style={slots[i] ? { backgroundColor: slots[i] } : {}}
            >
              {!slots[i] && (
                <span className="text-xs text-muted-foreground">
                  slot {i + 1}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-5">
          <p className="text-xs text-muted-foreground mb-2 text-center">
            Palette
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {palette.map((c, i) => (
              <button
                key={i}
                onClick={() => place(c)}
                className="w-9 h-9 rounded-md border border-border hover:scale-110 transition-transform"
                style={{ backgroundColor: c }}
                aria-label={`color ${c}`}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-2 justify-center mt-5">
          <button
            onClick={() => setSlots([])}
            className="px-3 h-10 rounded-md border border-border text-sm inline-flex items-center gap-1"
          >
            <Undo2 className="w-4 h-4" /> Clear
          </button>
          <button
            onClick={submit}
            disabled={slots.length !== target.length || !!outcome}
            className="px-4 h-10 rounded-md bg-forest text-primary-foreground text-sm disabled:opacity-50"
          >
            Submit
          </button>
        </div>
        {outcome && outcome !== "done" && (
          <div className="mt-5 text-center">
            <div className="mx-auto max-w-[200px] aspect-[3/2] rounded-lg overflow-hidden border border-border">
              <FlagImage code={item.code} className="w-full h-full" />
            </div>
            <p
              className={cn(
                "text-sm font-medium mt-3",
                outcome.perfect ? "text-forest" : "text-terra",
              )}
            >
              {outcome.perfect
                ? `Perfect! +${outcome.xp} XP`
                : `${outcome.correct}/${target.length} correct · +${outcome.xp} XP`}
            </p>
            <button
              onClick={next}
              className="mt-3 px-5 h-10 rounded-md bg-forest text-primary-foreground text-sm"
            >
              {idx + 1 >= queue.length ? "Finish" : "Next"}
            </button>
          </div>
        )}
      </div>
    </ModeShell>
  );
}
