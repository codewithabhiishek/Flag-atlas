import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Zap,
  Eye,
  Palette,
  ArrowRight,
  Swords,
  Flame,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  Compass,
  BarChart2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
import { COUNTRIES } from "@/data/countries";
import WorldMap from "@/components/WorldMap";
import MasteryMeter from "@/components/MasteryMeter";
import PassportStamps from "@/components/PassportStamps";
import FlagImage from "@/components/FlagImage";
import { cn } from "@/lib/utils";

const MODES = [
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

function LegendDot({ className, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-tight text-[11px]">
      <span className={cn("w-3 h-3 border-2 border-foreground rounded-sm", className)} />
      {label}
    </span>
  );
}

// ── Quick-fire quiz widget ──────────────────────────────────────────────────
function QuickFlagSpotlight({ onCorrectAnswer }) {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * COUNTRIES.length));
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);

  const currentCountry = COUNTRIES[index];

  const choices = useMemo(() => {
    const distractors = COUNTRIES.filter((c) => c.code !== currentCountry.code)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    return [currentCountry, ...distractors].sort(() => 0.5 - Math.random());
  }, [currentCountry]);

  const handleChoice = (c) => {
    if (answered) return;
    setSelected(c.code);
    setAnswered(true);
    if (c.code === currentCountry.code) {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 }, colors: ["#10B981", "#F59E0B", "#3B82F6", "#EC4899"] });
      if (onCorrectAnswer) onCorrectAnswer(currentCountry.code);
    }
  };

  const nextQuestion = () => {
    setSelected(null);
    setAnswered(false);
    setIndex((prev) => (prev + 7) % COUNTRIES.length);
  };

  return (
    <div className="atlas-card p-5 sm:p-6 border-2 border-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.3)]">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="font-display font-bold text-base sm:text-lg text-foreground leading-tight">
            Daily Challenge
          </h2>
          <p className="text-xs text-muted-foreground">Guess the flag · earn bonus XP</p>
        </div>
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

      {/* Flag + choices */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        <motion.div
          key={currentCountry.code}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-28 h-20 sm:w-36 sm:h-24 border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)] overflow-hidden shrink-0 bg-muted/30 rounded"
        >
          <FlagImage code={currentCountry.code} className="w-full h-full object-contain" fittingType="contain" />
        </motion.div>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
          {choices.map((c) => {
            const isTarget = c.code === currentCountry.code;
            const isUserChoice = selected === c.code;
            let style = "border-2 border-foreground bg-card hover:bg-muted/70 text-foreground";
            if (answered) {
              if (isTarget) style = "border-2 border-emerald-600 bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 font-bold";
              else if (isUserChoice) style = "border-2 border-destructive bg-destructive/20 text-destructive line-through opacity-70";
              else style = "border-2 border-border/50 opacity-40";
            }
            return (
              <motion.button
                key={c.code}
                whileHover={!answered ? { scale: 1.02, y: -1 } : {}}
                whileTap={!answered ? { scale: 0.98 } : {}}
                onClick={() => handleChoice(c)}
                disabled={answered}
                className={cn("px-3.5 py-2.5 text-left text-sm font-semibold tracking-tight transition-all flex items-center justify-between rounded-lg", style)}
              >
                <span className="truncate">{c.name}</span>
                {answered && isTarget && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-1.5" />}
                {answered && isUserChoice && !isTarget && <XCircle className="w-4 h-4 text-destructive shrink-0 ml-1.5" />}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* After-answer reveal */}
      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs"
          >
            <span className="text-muted-foreground">
              Region: <strong className="text-foreground">{currentCountry.region}</strong>
              {" · "}Capital: <strong className="text-foreground">{currentCountry.capital}</strong>
            </span>
            <button
              onClick={nextQuestion}
              className="px-3 py-1 font-bold uppercase tracking-wider bg-foreground text-background border border-foreground rounded hover:opacity-90 text-xs"
            >
              Next →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Home ───────────────────────────────────────────────────────────────
export default function Home() {
  const { state, record } = useProgress();
  const lp = levelProgress(state.xp);
  const rank = rankFromMastered(masteredCount(state.flags));
  const mastered = masteredCount(state.flags);
  const acc = state.stats.answered
    ? Math.round((state.stats.correct / state.stats.answered) * 100)
    : 0;

  const handleQuickQuizCorrect = (code) => {
    record(code, { correct: true, quality: 5, xpGain: 15 });
  };

  const triggerCelebration = () => {
    confetti({ particleCount: 60, spread: 80, origin: { y: 0.3 }, colors: ["#F59E0B", "#10B981", "#3B82F6", "#EF4444"] });
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8">

      {/* ── 1. Hero: rank + XP + quick stats ── */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="atlas-card grid-paper p-5 sm:p-7 border-2 border-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.4)]"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          {/* Rank + stats */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-foreground/30 bg-muted/70 text-xs uppercase tracking-[0.2em] font-bold text-foreground">
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
                className="p-2 border-2 border-foreground bg-gold rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-foreground"
                title="Celebrate!"
              >
                <Trophy className="w-5 h-5" />
              </motion.button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-card border border-border rounded-md">
                🎯 <strong className="text-foreground">{mastered}</strong> mastered
              </span>
              <span
                onClick={triggerCelebration}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 rounded-md cursor-pointer hover:bg-amber-500/20 transition-colors"
              >
                <Flame className="w-4 h-4 animate-bounce" />
                <strong>{state.streak}</strong>-day streak
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-card border border-border rounded-md">
                ⚡ <strong className="text-foreground">{acc}%</strong> accuracy
              </span>
            </div>
          </div>

          {/* XP progress + CTAs */}
          <div className="w-full sm:max-w-xs space-y-3">
            <div className="p-4 bg-card/80 backdrop-blur-sm border-2 border-foreground rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)]">
              <div className="flex justify-between text-xs mb-2 font-bold uppercase">
                <span className="text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                  Level {lp.level}
                </span>
                <span className="text-muted-foreground">{lp.into}/{lp.span} XP · {lp.pct}%</span>
              </div>
              <div className="h-3 border-2 border-foreground bg-background rounded-sm overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${lp.pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-forest relative overflow-hidden"
                >
                  <div className="absolute inset-0 shimmer-progress" />
                </motion.div>
              </div>
            </div>
            {/* Primary CTAs */}
            <div className="flex gap-2">
              <motion.div whileHover={{ y: -2 }} whileTap={{ y: 1 }} className="flex-1">
                <Link
                  to="/play/fragments"
                  className="flex items-center justify-center gap-1.5 border-2 border-foreground bg-foreground text-background h-10 font-bold uppercase text-xs tracking-tight shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:opacity-90 transition-opacity rounded w-full"
                >
                  Play Now <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} whileTap={{ y: 1 }}>
                <Link
                  to="/dashboard"
                  className="flex items-center justify-center gap-1.5 border-2 border-foreground bg-card text-foreground h-10 px-3 font-bold uppercase text-xs tracking-tight shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-muted transition-colors rounded"
                  title="Stats"
                >
                  <BarChart2 className="w-4 h-4" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} whileTap={{ y: 1 }}>
                <Link
                  to="/battle"
                  className="flex items-center justify-center gap-1.5 border-2 border-foreground bg-gold text-foreground h-10 px-3 font-bold uppercase text-xs tracking-tight shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-amber-400 transition-colors rounded"
                  title="Battle"
                >
                  <Swords className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── 2. Daily Challenge (quick quiz) ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.07 }}
      >
        <QuickFlagSpotlight onCorrectAnswer={handleQuickQuizCorrect} />
      </motion.div>

      {/* ── 3. The World Atlas Map ── */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.12 }}
        className="atlas-card border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b-2 border-foreground bg-card/60 backdrop-blur">
          <div>
            <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
              <Compass className="w-5 h-5 text-terra" /> World Atlas
            </h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              Tap a country to play that region
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <LegendDot className="bg-land" label="Locked" />
            <LegendDot className="bg-terra" label="Learning" />
            <LegendDot className="bg-forest" label="Mastered" />
          </div>
        </div>
        <div className="bg-ocean relative">
          <WorldMap flags={state.flags} />
        </div>
      </motion.section>

      {/* ── 4. Game Modes — single clean row, no per-region duplication ── */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.17 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl font-bold text-foreground">Game Modes</h2>
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Pick your style</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                  <md.icon className="w-4.5 h-4.5 text-foreground" />
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
      </motion.section>

      {/* ── 5. Regional Progress — compact, no repeated mode buttons ── */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.22 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl font-bold text-foreground">Progress by Region</h2>
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
                className="atlas-card px-4 py-3.5 border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] flex items-center gap-4 group cursor-pointer"
                onClick={() => {}}
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
                <Link
                  to={`/play/fragments?region=${encodeURIComponent(r.id)}`}
                  className="shrink-0 border-2 border-foreground bg-card px-2.5 py-1.5 text-xs font-bold uppercase tracking-tight hover:bg-terra hover:text-white transition-all rounded shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] opacity-0 group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  Play →
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ── 6. Passport Stamps ── */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.27 }}
        className="atlas-card p-5 border-2 border-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)]"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-foreground">Explorer Passport</h2>
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            Earned at mastery
          </span>
        </div>
        <PassportStamps flags={state.flags} />
      </motion.section>

    </div>
  );
}
