import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Zap,
  Eye,
  Palette,
  Layers,
  ArrowRight,
  Star,
  Swords,
  Flame,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  Compass,
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
    desc: "Reassemble flag puzzle parts",
    icon: Sparkles,
    color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-600/30",
  },
  {
    key: "speed",
    path: "/play/speed",
    label: "Speed Run",
    desc: "60-second reflex blitz",
    icon: Zap,
    color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-600/30",
  },
  {
    key: "recall",
    path: "/play/recall",
    label: "Recall",
    desc: "Test pure visual memory",
    icon: Eye,
    color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-600/30",
  },
  {
    key: "builder",
    path: "/play/builder",
    label: "Builder",
    desc: "Craft and design flags",
    icon: Palette,
    color: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-600/30",
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

// Interactive Instant Flag Challenge Widget
function QuickFlagSpotlight({ onCorrectAnswer }) {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * COUNTRIES.length));
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);

  const currentCountry = COUNTRIES[index];

  // Generate 1 correct + 3 distractor choices
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

    const isCorrect = c.code === currentCountry.code;
    if (isCorrect) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10B981", "#F59E0B", "#3B82F6", "#EC4899"],
      });
      if (onCorrectAnswer) onCorrectAnswer(currentCountry.code);
    }
  };

  const nextQuestion = () => {
    setSelected(null);
    setAnswered(false);
    setIndex((prev) => (prev + 7) % COUNTRIES.length);
  };

  return (
    <div className="atlas-card p-5 sm:p-6 bg-gradient-to-br from-card via-card to-muted/40 border-2 border-foreground relative overflow-hidden">
      <div className="flex items-center justify-between gap-2 mb-4 border-b border-border/70 pb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gold/20 text-gold border border-gold/40">
            <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </span>
          <div>
            <h3 className="font-display font-bold text-base sm:text-lg text-foreground leading-tight">
              Rapid Flag Radar
            </h3>
            <p className="text-xs text-muted-foreground">
              Instant challenge · guess the flag for bonus XP
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.3 }}
          onClick={nextQuestion}
          className="p-1.5 border border-border hover:bg-muted text-muted-foreground hover:text-foreground rounded"
          title="New Flag"
        >
          <RotateCcw className="w-4 h-4" />
        </motion.button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        <motion.div
          key={currentCountry.code}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-28 h-20 sm:w-36 sm:h-24 border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)] overflow-hidden shrink-0 bg-muted/30 rounded flex items-center justify-center p-1"
        >
          <FlagImage code={currentCountry.code} className="w-full h-full object-contain" fittingType="contain" />
        </motion.div>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {choices.map((c) => {
            const isTarget = c.code === currentCountry.code;
            const isUserChoice = selected === c.code;

            let buttonStyle = "border-2 border-foreground bg-card hover:bg-muted/70 text-foreground";
            if (answered) {
              if (isTarget) {
                buttonStyle = "border-2 border-emerald-600 bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 font-bold shadow-[0_0_12px_rgba(16,185,129,0.4)]";
              } else if (isUserChoice) {
                buttonStyle = "border-2 border-destructive bg-destructive/20 text-destructive line-through";
              } else {
                buttonStyle = "border-2 border-border/50 opacity-40";
              }
            }

            return (
              <motion.button
                key={c.code}
                whileHover={!answered ? { scale: 1.02, y: -1 } : {}}
                whileTap={!answered ? { scale: 0.98 } : {}}
                onClick={() => handleChoice(c)}
                disabled={answered}
                className={cn(
                  "px-3.5 py-2.5 text-left text-sm font-semibold tracking-tight transition-all flex items-center justify-between rounded-lg",
                  buttonStyle,
                )}
              >
                <span className="truncate">{c.name}</span>
                {answered && isTarget && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-1.5" />
                )}
                {answered && isUserChoice && !isTarget && (
                  <XCircle className="w-4 h-4 text-destructive shrink-0 ml-1.5" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {answered && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs"
        >
          <span className="text-muted-foreground">
            Region: <strong className="text-foreground">{currentCountry.region}</strong> · Capital: <strong className="text-foreground">{currentCountry.capital}</strong>
          </span>
          <button
            onClick={nextQuestion}
            className="px-3 py-1 font-bold uppercase tracking-wider bg-foreground text-background border border-foreground rounded hover:opacity-90"
          >
            Next flag →
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default function Home() {
  const { state, record } = useProgress();
  const lp = levelProgress(state.xp);
  const rank = rankFromMastered(masteredCount(state.flags));
  const mastered = masteredCount(state.flags);
  const acc = state.stats.answered
    ? Math.round((state.stats.correct / state.stats.answered) * 100)
    : 0;

  const triggerCelebration = () => {
    confetti({
      particleCount: 60,
      spread: 80,
      origin: { y: 0.3 },
      colors: ["#F59E0B", "#10B981", "#3B82F6", "#EF4444"],
    });
  };

  const handleQuickQuizCorrect = (code) => {
    record(code, { correct: true, quality: 5, xpGain: 15 });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* 1. Hero Explorer Section */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="atlas-card grid-paper p-5 sm:p-7 border-2 border-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.4)]"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-foreground/30 bg-muted/70 text-xs uppercase tracking-[0.2em] font-bold text-foreground">
              <Compass className="w-3.5 h-3.5 text-terra" />
              Explorer Rank
            </div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-foreground font-extrabold tracking-tight">
                {rank.title}
              </h1>
              <motion.button
                whileHover={{ scale: 1.2, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                onClick={triggerCelebration}
                className="p-2 border-2 border-foreground bg-gold rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-foreground"
                title="Celebrate your rank!"
              >
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
              </motion.button>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-sm font-semibold">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-card border border-border rounded-md">
                🎯 <strong className="text-foreground">{mastered}</strong> flags mastered
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

          <div className="w-full lg:max-w-md p-4 sm:p-5 bg-card/80 backdrop-blur-sm border-2 border-foreground rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.3)]">
            <div className="flex justify-between text-xs mb-2 font-bold uppercase">
              <span className="text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                Level {lp.level}
              </span>
              <span className="text-muted-foreground">
                {lp.into} / {lp.span} XP ({lp.pct}%)
              </span>
            </div>
            <div className="h-4 border-2 border-foreground bg-background rounded-sm overflow-hidden relative shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${lp.pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-forest relative overflow-hidden"
              >
                <div className="absolute inset-0 shimmer-progress" />
              </motion.div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
              <motion.div whileHover={{ y: -2 }} whileTap={{ y: 1 }}>
                <Link
                  to="/battle"
                  className="inline-flex items-center gap-2 border-2 border-foreground bg-gold text-foreground px-4 h-10 font-bold uppercase text-xs sm:text-sm tracking-tight shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-amber-400 transition-colors rounded"
                >
                  <Swords className="w-4 h-4" /> Battle a friend →
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} whileTap={{ y: 1 }}>
                <Link
                  to="/play/fragments?region=Europe"
                  className="inline-flex items-center gap-2 border-2 border-foreground bg-foreground text-background px-4 h-10 font-bold uppercase text-xs sm:text-sm tracking-tight shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)] hover:opacity-90 transition-opacity rounded"
                >
                  Start Europe →
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} whileTap={{ y: 1 }}>
                <Link
                  to="/review"
                  className="inline-flex items-center gap-2 border-2 border-foreground bg-card text-foreground px-4 h-10 font-bold uppercase text-xs sm:text-sm tracking-tight shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-muted transition-colors rounded"
                >
                  <Layers className="w-4 h-4" /> Review deck
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 2. Interactive Spotlight Quick Quiz */}
      <QuickFlagSpotlight onCorrectAnswer={handleQuickQuizCorrect} />

      {/* 3. The Interactive Atlas Map */}
      <section className="atlas-card border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b-2 border-foreground bg-card/60 backdrop-blur">
          <div>
            <h2 className="font-display font-bold text-2xl text-foreground flex items-center gap-2">
              <Compass className="w-5 h-5 text-terra" />
              The World Atlas
            </h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              Territories dynamically illuminate as you master their flags · hover to inspect
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
      </section>

      {/* 4. Game Modes Showcase Cards */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Training & Game Modes
          </h2>
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
            Select your discipline
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MODES.map((md) => (
            <motion.div
              key={md.key}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Link
                to={md.path}
                className={cn(
                  "atlas-card p-5 border-2 border-foreground block h-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.3)] transition-colors group",
                  md.color,
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 border-2 border-foreground bg-card rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform">
                    <md.icon className="w-5 h-5 text-foreground" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-foreground opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">
                  {md.label}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 font-medium leading-relaxed">
                  {md.desc}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. Regional Mastery Cards */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Regional Sectors
          </h2>
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
            Continent breakdown
          </span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {REGIONS.map((r) => {
            const m = regionMastery(state.flags, r.id);
            const done = masteredInRegion(state.flags, r.id);
            const tot = regionTotal(r.id);
            return (
              <motion.div
                key={r.id}
                whileHover={{ y: -3 }}
                className="atlas-card p-5 border-2 border-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display text-xl font-bold text-foreground">
                      {r.id}
                    </h3>
                    <span className="text-xs text-muted-foreground font-bold px-2 py-0.5 bg-muted rounded">
                      {tot === 0 ? "—" : `${done}/${tot} · ${m}%`}
                    </span>
                  </div>
                  <MasteryMeter value={m} />
                </div>

                {tot === 0 ? (
                  <p className="text-xs text-muted-foreground mt-4 italic">
                    Frozen continent — no sovereign flags.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {MODES.map((md) => (
                      <Link
                        key={md.key}
                        to={`${md.path}?region=${encodeURIComponent(r.id)}`}
                        className="group border-2 border-foreground bg-card px-2.5 py-1.5 hover:bg-terra hover:text-white transition-all rounded shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <div className="flex items-center gap-1.5">
                          <md.icon className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold uppercase tracking-tight">
                            {md.label}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 6. Battle & Dashboard Highlights */}
      <section className="grid sm:grid-cols-2 gap-4 sm:gap-5">
        <motion.div whileHover={{ y: -4, scale: 1.01 }}>
          <Link
            to="/battle"
            className="atlas-card p-6 border-2 border-foreground bg-gold text-foreground block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.4)] transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-foreground text-gold flex items-center justify-center border-2 border-foreground group-hover:rotate-12 transition-transform">
                <Swords className="w-6 h-6 text-gold" />
              </div>
              <div className="flex-1">
                <div className="font-display font-extrabold text-xl uppercase tracking-tight">
                  Multiplayer Battle
                </div>
                <div className="text-xs text-foreground/80 font-semibold mt-0.5">
                  Real-time speed showdown · outsmart your rival
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-foreground group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>
        </motion.div>

        <motion.div whileHover={{ y: -4, scale: 1.01 }}>
          <Link
            to="/dashboard"
            className="atlas-card p-6 border-2 border-foreground bg-card text-foreground block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.4)] transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-terra text-white flex items-center justify-center border-2 border-foreground group-hover:rotate-12 transition-transform">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-display font-extrabold text-xl uppercase tracking-tight">
                  Stats & Stamps
                </div>
                <div className="text-xs text-muted-foreground font-semibold mt-0.5">
                  Detailed analytics, accuracy charts, passport progress
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-foreground group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>
        </motion.div>
      </section>

      {/* 7. Passport Stamps */}
      <section className="atlas-card p-6 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-2xl font-bold text-foreground">
            Explorer Passport
          </h3>
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            Stamps earned as flags reach mastery
          </span>
        </div>
        <PassportStamps flags={state.flags} />
      </section>
    </div>
  );
}
