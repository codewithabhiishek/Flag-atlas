import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGsapScrollReveal } from "@/lib/gsapScroll";
import { HomeSkeleton } from "@/components/Skeletons";
import {
  Sparkles,
  Zap,
  Eye,
  Palette,
  ArrowRight,
  Swords,
  Flame,
  Check,
  X,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  Compass,
  BarChart2,
  Globe,
  History,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import confetti from "canvas-confetti";
import { useProgress } from "@/lib/ProgressContext";
import { levelProgress, rankFromMastered } from "@/lib/scoring";
import {
  masteredCount,
  regionMastery,
  masteredInRegion,
  regionTotal,
} from "@/lib/derive";
import { REGIONS } from "@/data/regions";
import { COUNTRIES, pickOptions } from "@/data/countries";
import WorldMap from "@/components/WorldMap";
import InfoTip from "@/components/InfoTip";
import MasteryMeter from "@/components/MasteryMeter";
import PassportStamps from "@/components/PassportStamps";
import FlagImage from "@/components/FlagImage";
import { cn } from "@/lib/utils";
import { playUiSound } from "@/lib/sounds";
import { formatElapsedTime, useElapsedTimer } from "@/hooks/use-elapsed-timer";

const MODES = [
  {
    key: "world-quiz",
    path: "/play/go-berserk",
    label: "Go Berserk",
    desc: "The full 197-country flag marathon",
    icon: Globe,
    accent: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/30",
    iconBg: "bg-violet-500/15",
  },
  {
    key: "fragments",
    path: "/play/fragments",
    label: "Fragments",
    desc: "Guess the blurred flag",
    icon: Sparkles,
    accent: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    iconBg: "bg-emerald-500/15",
  },
  {
    key: "speed",
    path: "/play/speed",
    label: "Speed Run",
    desc: "45-second reflex blitz",
    icon: Zap,
    accent: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
    iconBg: "bg-amber-500/15",
  },
  {
    key: "recall",
    path: "/play/recall",
    label: "Recall",
    desc: "Pure visual memory",
    icon: Eye,
    accent: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30",
    iconBg: "bg-sky-500/15",
  },
  {
    key: "builder",
    path: "/play/builder",
    label: "Builder",
    desc: "Design your own flag",
    icon: Palette,
    accent: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30",
    iconBg: "bg-rose-500/15",
  },
];

function AtlasLegendItem({ markerClassName, label, description }) {
  return (
    <span
      className="inline-flex items-center gap-2 border-l-2 border-foreground/20 pl-2 text-left"
      title={description}
    >
      <span aria-hidden="true" className={cn("h-3 w-3 shrink-0 border-2 border-foreground", markerClassName)} />
      <span className="text-[10px] font-bold uppercase leading-none tracking-[0.12em] text-foreground sm:text-[11px]">
        {label}
      </span>
    </span>
  );
}

// ── Quick-fire quiz — records BOTH correct and wrong answers so stats are accurate ──
function QuickFlagSpotlight({ onAnswer, activityLog = [] }) {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * COUNTRIES.length));
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const readyAtRef = useRef(0);
  const questionStartedAtRef = useRef(Date.now());
  const shouldReduceMotion = useReducedMotion();

  const currentCountry = COUNTRIES[index];
  const questionElapsedMs = useElapsedTimer(!answered, currentCountry.code);

  // Guarantee clean state reset and cooldown whenever question changes
  useEffect(() => {
    setSelected(null);
    setAnswered(false);
    readyAtRef.current = Date.now() + 220; // Ignore accidental click-bleed
    questionStartedAtRef.current = Date.now();
  }, [currentCountry.code]);

  const choices = useMemo(() => {
    return pickOptions(currentCountry.code, null, 4);
  }, [currentCountry.code]);

  const handleChoice = useCallback((c) => {
    if (answered) return;
    if (Date.now() < readyAtRef.current) return;
    const isCorrect = c.code === currentCountry.code;
    setSelected(c.code);
    setAnswered(true);

    // ✅ Always record — correct OR wrong — so stats.answered stays accurate
    onAnswer(currentCountry, isCorrect, Date.now() - questionStartedAtRef.current);

    playUiSound(isCorrect ? "success" : "error");

    if (isCorrect) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10B981", "#F59E0B", "#3B82F6", "#EC4899"],
      });
    }
  }, [answered, currentCountry, onAnswer]);

  const nextQuestion = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (document.activeElement && typeof document.activeElement.blur === "function") {
      document.activeElement.blur();
    }
    setSelected(null);
    setAnswered(false);
    // Jump by a prime to get good distribution across 195 countries
    setIndex((prev) => (prev + 17) % COUNTRIES.length);
  };

  return (
    <div className="atlas-card p-5 sm:p-6 border-2 border-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.3)]">
        <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="font-display font-bold text-base sm:text-lg text-foreground leading-tight flex items-center gap-2">
            <Globe className="w-4 h-4 text-terra" /> Daily Challenge
          </h2>
          <p className="text-xs text-muted-foreground">Guess the flag · +15 XP on correct</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-terra">{formatElapsedTime(questionElapsedMs)}</span>
          <motion.button
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            onClick={nextQuestion}
            className="p-1.5 border border-border hover:bg-muted text-muted-foreground hover:text-foreground rounded"
            title="New flag"
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      <div key={currentCountry.code} className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        {/* Flag image */}
        <motion.div
          key={currentCountry.code}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="w-36 sm:w-44 aspect-[3/2] border-2 border-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.35)] overflow-hidden shrink-0 rounded-lg bg-card"
        >
          <FlagImage
            code={currentCountry.code}
            className="w-full h-full object-cover"
            fittingType="fill"
            alt={`Flag challenge — guess this country`}
          />
        </motion.div>

        {/* 4 choices */}
        <div className="w-full flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {choices.map((c, idx) => {
            const isTarget = c.code === currentCountry.code;
            const isUserChoice = selected === c.code;
            const keyLetter = ["A", "B", "C", "D"][idx] || idx + 1;

            let btnStyle = "border-2 border-foreground bg-card text-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.4)] hover:bg-muted/50 cursor-pointer";
            let badgeStyle = "bg-muted text-foreground/80 border-foreground/20 group-hover:border-foreground group-hover:bg-foreground group-hover:text-background";

            if (answered) {
              if (isTarget) {
                btnStyle = "border-2 border-emerald-600 dark:border-emerald-400 bg-emerald-500/15 dark:bg-emerald-500/25 text-emerald-950 dark:text-emerald-100 font-bold shadow-[2px_2px_0px_0px_rgba(16,185,129,0.9)] cursor-default";
                badgeStyle = "bg-emerald-600 text-white border-emerald-600 shadow-sm";
              } else if (isUserChoice) {
                btnStyle = "border-2 border-destructive bg-destructive/15 text-destructive line-through opacity-75 shadow-[1px_1px_0px_0px_rgba(239,68,68,0.7)] cursor-default";
                badgeStyle = "bg-destructive text-white border-destructive shadow-sm";
              } else {
                btnStyle = "border-2 border-border/40 bg-muted/10 text-muted-foreground/40 opacity-35 shadow-none cursor-default";
                badgeStyle = "bg-transparent text-muted-foreground/40 border-border/40";
              }
            }

            return (
              <motion.button
                key={c.code}
                type="button"
                data-sound="off"
                whileHover={!answered ? { y: -1 } : {}}
                whileTap={!answered ? { scale: 0.98, y: 1 } : {}}
                onClick={() => handleChoice(c)}
                disabled={answered}
                className={cn(
                  "group relative min-h-[44px] px-3 py-2 sm:px-3.5 sm:py-2.5 text-left transition-all duration-150 flex items-center gap-2.5 rounded-lg select-none",
                  btnStyle,
                )}
              >
                <span
                  className={cn(
                    "w-6 h-6 rounded-md text-xs font-mono font-bold flex items-center justify-center shrink-0 border transition-all duration-150",
                    badgeStyle,
                  )}
                >
                  {answered && isTarget ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : answered && isUserChoice && !isTarget ? (
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    keyLetter
                  )}
                </span>
                <span className="truncate flex-1 font-semibold text-sm sm:text-base tracking-tight leading-snug">
                  {c.name}
                </span>
                {answered && isTarget && (
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  >
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  </motion.div>
                )}
                {answered && isUserChoice && !isTarget && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  >
                    <XCircle className="w-4.5 h-4.5 text-destructive shrink-0" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* After-answer info */}
      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.18, ease: "easeOut" }}
            className="mt-4 border-t border-border pt-3"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <motion.p
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.18, ease: "easeOut" }}
                  className="text-[10px] font-bold uppercase tracking-[0.16em] text-terra"
                >
                  Country revealed
                </motion.p>
                <motion.h3
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2, delay: 0.04, ease: "easeOut" }}
                  className="mt-0.5 break-words font-display text-xl font-bold leading-tight text-foreground sm:text-2xl"
                >
                  {currentCountry.name}
                </motion.h3>
                <motion.dl
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2, delay: 0.09, ease: "easeOut" }}
                  className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-xs leading-snug"
                >
                  <div className="flex min-w-0 items-baseline gap-1.5">
                    <dt className="shrink-0 font-bold uppercase tracking-wide text-muted-foreground">Region</dt>
                    <dd className="break-words font-semibold text-foreground">{currentCountry.region}</dd>
                  </div>
                  <div className="flex min-w-0 items-baseline gap-1.5">
                    <dt className="shrink-0 font-bold uppercase tracking-wide text-muted-foreground">Capital</dt>
                    <dd className="break-words font-semibold text-foreground">{currentCountry.capital}</dd>
                  </div>
                </motion.dl>
              </div>
              <button
                type="button"
                onClick={nextQuestion}
                className="h-9 self-start shrink-0 border border-foreground bg-foreground px-3 font-bold uppercase tracking-wider text-background hover:opacity-90 sm:self-auto text-xs"
              >
                Next →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Integrated Session Progress Footer ── */}
      {activityLog && activityLog.length > 0 && (
        <div className="mt-4 pt-3.5 border-t border-border/60">
          <div className="flex items-center justify-between gap-2 mb-2 text-xs">
            <span className="font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-terra" /> Session Activity
            </span>
            <span className="font-semibold text-muted-foreground">
              {activityLog.filter((e) => e.correct).length}/{activityLog.length} correct
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-none">
            <AnimatePresence initial={false}>
              {activityLog.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 450, damping: 25 }}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold shrink-0 shadow-sm transition-all",
                    entry.correct
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200"
                      : "border-destructive/40 bg-destructive/10 text-destructive line-through opacity-85",
                  )}
                  title={`${entry.name} — ${entry.correct ? "Correct" : "Wrong"}`}
                >
                  <div className="w-5 h-3.5 overflow-hidden rounded-[2px] border border-foreground/20 shrink-0 bg-muted">
                    <FlagImage code={entry.code} className="w-full h-full object-cover" fittingType="fill" />
                  </div>
                  <span className="whitespace-nowrap">{entry.name}</span>
                  {entry.correct ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Home ────────────────────────────────────────────────────────────────
export default function Home() {
  const { state, record } = useProgress();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);

  // Show skeleton for one frame to avoid layout flash, then reveal
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 120);
    return () => clearTimeout(t);
  }, []);

  // GSAP scroll-reveal — re-runs when ready flips to true
  useGsapScrollReveal(containerRef, [ready]);

  // Derived stats — re-computed on every context update (live)
  const lp = levelProgress(state.xp);
  const rank = rankFromMastered(masteredCount(state.flags));
  const mastered = masteredCount(state.flags);
  const acc = state.stats?.answered
    ? Math.round((state.stats.correct / state.stats.answered) * 100)
    : 0;

  // Session activity log — tracks answers this page session (not persisted)
  const [activityLog, setActivityLog] = useState([]);
  const openModePicker = useCallback((region = "") => {
    navigate(`/play${region ? `?region=${encodeURIComponent(region)}` : ""}`);
  }, [navigate]);

  const handleAnswer = useCallback((country, isCorrect, timeMs) => {
    // Record to persistent store (correct + wrong both update stats.answered)
    record(country.code, {
      correct: isCorrect,
      quality: isCorrect ? 5 : 2,
      xpGain: isCorrect ? 15 : 0,
      timeMs: timeMs,
    });

    // Add to session feed
    setActivityLog((prev) => [
      { id: `${country.code}-${Date.now()}`, code: country.code, name: country.name, correct: isCorrect },
      ...prev.slice(0, 19), // keep last 20
    ]);
  }, [record]);

  const triggerCelebration = () => {
    playUiSound("success");
    confetti({ particleCount: 60, spread: 80, origin: { y: 0.3 }, colors: ["#F59E0B", "#10B981", "#3B82F6", "#EF4444"] });
  };

  if (!ready) return <HomeSkeleton />;

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6">

      {/* ── 1. Hero: rank + live stats + XP ── */}
      <motion.section
        data-reveal
        data-reveal-delay="0"
        className="atlas-card grid-paper p-5 sm:p-7 border-2 border-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.4)]"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          {/* Left: rank + stat pills */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-foreground/30 bg-muted/70 text-xs uppercase tracking-[0.18em] font-bold text-foreground">
              <Compass className="w-3.5 h-3.5 text-terra" />
              Explorer Rank
            </div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-4xl sm:text-5xl text-foreground font-extrabold tracking-tight">
                {rank.title}
              </h1>
              <motion.button
                whileHover={{ scale: 1.2, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                onClick={triggerCelebration}
                data-sound="off"
                className="p-2 border-2 border-foreground bg-gold rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                title="Celebrate!"
              >
                <Trophy className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Live stat pills — update as user plays */}
            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
              <motion.span
                key={mastered}
                initial={{ scale: 1.15 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-card border border-border rounded-md"
              >
                🎯 <strong className="text-foreground">{mastered}</strong>{" "}
                <span className="text-muted-foreground">/ {COUNTRIES.length} mastered</span>
              </motion.span>
              <span
                onClick={triggerCelebration}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 rounded-md cursor-pointer hover:bg-amber-500/20 transition-colors"
              >
                <Flame className="w-4 h-4 animate-bounce" />
                <strong>{state.streak}</strong>-day streak
              </span>
              <motion.span
                key={acc}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-card border border-border rounded-md"
                title={`${state.stats?.correct ?? 0} correct of ${state.stats?.answered ?? 0} answered`}
              >
                ⚡ <strong className="text-foreground">{acc}%</strong>
                <span className="text-muted-foreground text-xs">accuracy</span>
              </motion.span>
            </div>
          </div>

          {/* Right: XP bar + action buttons */}
          <div className="w-full sm:max-w-xs space-y-3">
            <div className="p-4 bg-card/80 backdrop-blur-sm border-2 border-foreground rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)]">
              <div className="flex justify-between text-xs mb-2 font-bold uppercase">
                <span className="text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                  Level {lp.level}
                </span>
                <span className="text-muted-foreground">{lp.into}/{lp.span} XP</span>
              </div>
              <div className="h-3 border-2 border-foreground bg-background rounded-sm overflow-hidden">
                <motion.div
                  animate={{ width: `${lp.pct}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full bg-forest relative overflow-hidden"
                >
                  <div className="absolute inset-0 shimmer-progress" />
                </motion.div>
              </div>
              <p className="text-right text-[10px] text-muted-foreground mt-1">{lp.pct}% to level {lp.level + 1}</p>
            </div>

            <div className="flex gap-2">
              <motion.div whileHover={{ y: -2 }} whileTap={{ y: 1 }} className="flex-1">
                <button
                  type="button"
                  onClick={() => openModePicker("")}
                  className="flex items-center justify-center gap-1.5 border-2 border-foreground bg-foreground text-background h-10 font-bold uppercase text-xs tracking-tight shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:opacity-90 transition-opacity rounded w-full"
                >
                  Play Now <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} whileTap={{ y: 1 }}>
                <Link
                  to="/dashboard"
                  className="flex items-center justify-center gap-1.5 border-2 border-foreground bg-card text-foreground h-10 px-3 font-bold uppercase text-xs tracking-tight shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-muted transition-colors rounded"
                  title="Your stats"
                >
                  <BarChart2 className="w-4 h-4" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} whileTap={{ y: 1 }}>
                <Link
                  to="/battle"
                  className="flex items-center justify-center gap-1.5 border-2 border-foreground bg-gold text-foreground h-10 px-3 font-bold uppercase text-xs tracking-tight shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-amber-400 transition-colors rounded"
                  title="Battle a friend"
                >
                  <Swords className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── 2. Daily Challenge with integrated session progress ── */}
      <div
        data-reveal
        data-reveal-delay="0.05"
      >
        <QuickFlagSpotlight onAnswer={handleAnswer} activityLog={activityLog} />
      </div>

      {/* ── 3. The World Atlas Map ── */}
      <section
        data-reveal
        data-reveal-delay="0.08"
        className="atlas-card border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-3.5 border-b-2 border-foreground bg-card/60 backdrop-blur">
          <div>
            <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
              <Compass className="w-5 h-5 text-terra" /> World Atlas
            </h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              Tap a country to play that region
            </p>
          </div>
          <div aria-label="Map progress legend" className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:justify-end">
            <AtlasLegendItem markerClassName="bg-land" label="Not studied" description="No answers recorded yet" />
            <AtlasLegendItem markerClassName="rounded-full bg-terra" label="Learning" description="Studied, but not mastered yet" />
            <AtlasLegendItem markerClassName="bg-forest rotate-45" label="Mastered" description="Three consecutive correct reviews" />
            <InfoTip label="About progress colors">
              <b>Learning</b> = you've seen the flag at least once. <b>Mastered</b> (green) = 3 correct answers in a row — only mastered flags count toward region progress, your rank, and passport stamps.
            </InfoTip>
          </div>
        </div>
        <div className="bg-ocean relative">
          <WorldMap flags={state.flags} onSelectRegion={openModePicker} />
        </div>
      </section>

      {/* ── 4. Game Modes ── */}
      <section data-reveal data-reveal-delay="0.04" className="-mt-1">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl font-bold text-foreground">Game Modes</h2>
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Pick your style</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {MODES.map((md, i) => (
            <motion.div
              key={md.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.18 + i * 0.05 }}
              whileHover={{ y: -3, scale: 1.02 }}
            >
              <Link
                to={md.path}
                className={cn(
                  "atlas-card p-4 border-2 border-foreground flex flex-col gap-2 h-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.25)] group transition-colors",
                  md.accent,
                )}
              >
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center border-2 border-foreground group-hover:rotate-6 transition-transform", md.iconBg)}>
                  <md.icon className="w-4 h-4 text-foreground" />
                </div>
                <div>
                  <p className="font-display text-base font-bold text-foreground leading-tight">{md.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{md.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-foreground opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all mt-auto self-end" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 5. Regional Progress — compact strips ── */}
      <section data-reveal data-reveal-delay="0.06">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            Progress by Region
            <InfoTip label="About region progress">
              Counts only <b>mastered</b> flags — 3 correct answers in a row. Flags you're still learning don't count yet; keep answering them correctly to fill the bar.
            </InfoTip>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {REGIONS.filter((r) => r.id !== "Antarctica").map((r) => {
            const done = masteredInRegion(state.flags, r.id);
            const tot = regionTotal(r.id);
            const pct = regionMastery(state.flags, r.id);
            return (
              <motion.div
                key={r.id}
                whileHover={{ y: -2 }}
                className="atlas-card px-4 py-3.5 border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] flex items-center gap-4 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-display text-sm font-bold text-foreground truncate">{r.id}</span>
                    <span className="text-xs text-muted-foreground font-bold ml-2 shrink-0">
                      {done}/{tot}
                    </span>
                  </div>
                  <MasteryMeter value={pct} />
                </div>
                <button
                  type="button"
                  onClick={() => openModePicker(r.id)}
                  className="shrink-0 border-2 border-foreground bg-card px-2.5 py-1.5 text-xs font-bold uppercase tracking-tight hover:bg-terra hover:text-white transition-all rounded shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] opacity-0 group-hover:opacity-100 sm:opacity-100"
                >
                  Play →
                </button>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── 6. Explorer Passport ── */}
      <section
        data-reveal
        data-reveal-delay="0.08"
        className="atlas-card p-5 border-2 border-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)]"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-foreground">Explorer Passport</h2>
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            Earned at mastery
          </span>
        </div>
        <PassportStamps flags={state.flags} />
      </section>

    </div>
  );
}
