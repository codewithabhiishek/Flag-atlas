import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Compass,
  Globe2,
  Sparkles,
  Zap,
  Eye,
  Palette,
  Swords,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Trophy,
  Brain,
  Layers,
  MapPin,
  Play,
  RotateCcw,
} from "lucide-react";
import FlagImage from "@/components/FlagImage";
import { useProgress } from "@/lib/ProgressContext";
import { masteredCount } from "@/lib/derive";
import confetti from "canvas-confetti";

// Showcase flags for the interactive mock card
const DEMO_FLAGS = [
  {
    code: "cr",
    name: "Costa Rica",
    capital: "San José",
    region: "Americas",
    options: ["Belize", "Costa Rica", "Venezuela", "Austria"],
    correct: 1,
  },
  {
    code: "jp",
    name: "Japan",
    capital: "Tokyo",
    region: "Asia",
    options: ["South Korea", "Bangladesh", "Japan", "Palau"],
    correct: 2,
  },
  {
    code: "br",
    name: "Brazil",
    capital: "Brasília",
    region: "Americas",
    options: ["Brazil", "Colombia", "Jamaica", "Solomon Islands"],
    correct: 0,
  },
  {
    code: "za",
    name: "South Africa",
    capital: "Pretoria",
    region: "Africa",
    options: ["Kenya", "Vanuatu", "South Africa", "Zimbabwe"],
    correct: 2,
  },
];

const MODES_LIST = [
  {
    path: "/play/go-berserk",
    label: "Go Berserk",
    badge: "Most Popular",
    desc: "The ultimate 197-nation flag marathon. Every country appears once in random order.",
    icon: Globe2,
    color: "border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
  {
    path: "/play/speed",
    label: "Speed Run",
    badge: "45s Blitz",
    desc: "Rapid-fire reflex test. Answer as many flags as possible before the clock expires.",
    icon: Zap,
    color: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  {
    path: "/play/fragments",
    label: "Fragments",
    badge: "Visual Puzzle",
    desc: "The flag starts heavily blurred. Identify it before your misses run out.",
    icon: Sparkles,
    color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  {
    path: "/play/recall",
    label: "Recall",
    badge: "Memory",
    desc: "Picture the flag in your mind from the country name, then reveal and self-grade.",
    icon: Eye,
    color: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  },
  {
    path: "/play/builder",
    label: "Flag Builder",
    badge: "Creative",
    desc: "Reconstruct national flags stripe-by-stripe by selecting the right colors in order.",
    icon: Palette,
    color: "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-400",
  },
  {
    path: "/battle",
    label: "1v1 Battle",
    badge: "Multiplayer",
    desc: "Real-time flag duel. Share a room code with a friend and race to 10 points.",
    icon: Swords,
    color: "border-gold/60 bg-gold/15 text-foreground",
  },
];

const STEPS = [
  {
    step: "01",
    label: "GUESS",
    desc: "Pick from 4 options, solve blurred fragments, or race the 45s clock.",
  },
  {
    step: "02",
    label: "LEARN",
    desc: "SM-2 spaced repetition automatically re-tests flags before you forget.",
  },
  {
    step: "03",
    label: "COLOR THE MAP",
    desc: "Watch the world turn from parchment gray into vibrant emerald green.",
  },
  {
    step: "04",
    label: "COLLECT STAMPS",
    desc: "Master entire continents to unlock authentic passport stamps & ranks.",
  },
];

export default function Landing() {
  const { state } = useProgress();
  const mastered = masteredCount(state.flags);

  // Interactive Live Hero Board State
  const [demoIdx, setDemoIdx] = useState(0);
  const [demoChosen, setDemoChosen] = useState(null);
  const [demoScore, setDemoScore] = useState(140);
  const [demoFeedback, setDemoFeedback] = useState(null);

  const currentFlag = DEMO_FLAGS[demoIdx];

  const handleDemoPick = (index) => {
    if (demoChosen !== null) return;
    setDemoChosen(index);
    const isCorrect = index === currentFlag.correct;
    if (isCorrect) {
      setDemoScore((s) => s + 15);
      setDemoFeedback("+15 XP · MASTERED!");
      try {
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { y: 0.65, x: 0.7 },
          colors: ["#10B981", "#F59E0B", "#3B82F6"],
        });
      } catch (_) {}
    } else {
      setDemoFeedback("Incorrect");
    }

    // Auto advance after 1.8s
    setTimeout(() => {
      setDemoIdx((prev) => (prev + 1) % DEMO_FLAGS.length);
      setDemoChosen(null);
      setDemoFeedback(null);
    }, 1800);
  };

  return (
    <div className="w-full">
      {/* ── TOP ANNOUNCEMENT BANNER ── */}
      <div className="w-full bg-forest text-primary-foreground text-xs py-2 px-4 text-center font-bold tracking-wide uppercase border-b-2 border-foreground flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" />
        <span>197 Sovereign Nations · Spaced Repetition Memory Engine · 100% Free & Local</span>
      </div>

      {/* ── HERO SECTION (Two-Column Layout inspired by WordRush & Chaos Cards) ── */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-10 sm:pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          
          {/* LEFT: Headline & Quick Play CTAs */}
          <div className="lg:col-span-7 space-y-4">
            {/* Tag badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 border-2 border-foreground bg-gold/20 text-xs font-extrabold uppercase tracking-wider text-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-terra">★</span> WORLD GEOGRAPHY & FLAG MASTERY
            </div>

            {/* Balanced Headline */}
            <h1 className="font-display text-3xl sm:text-5xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-[1.05]">
              LEARN EVERY FLAG. <br />
              <span className="text-terra">
                CONQUER THE MAP.
              </span> <br />
              NEVER FORGET.
            </h1>

            {/* Punchy description */}
            <p className="text-sm sm:text-base text-muted-foreground font-medium max-w-lg leading-relaxed">
              FlagAtlas turns world geography into an addictive, fast-paced game. 
              Powered by SM-2 spaced repetition, it predicts memory decay 
              and brings weak flags back just before you forget them.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5 pb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-card border-2 border-foreground text-[11px] font-bold uppercase tracking-tight shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                ⚡ 197 Countries
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-card border-2 border-foreground text-[11px] font-bold uppercase tracking-tight shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                🎮 6 Game Modes
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-card border-2 border-foreground text-[11px] font-bold uppercase tracking-tight shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                🧠 Spaced Repetition
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-card border-2 border-foreground text-[11px] font-bold uppercase tracking-tight shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                🛡️ 100% Free & Local
              </span>
            </div>

            {/* Quick Action Boxes (like WordRush create/join room) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 max-w-lg">
              {/* Box 1: Start Playing */}
              <div className="atlas-card p-3.5 sm:p-4 border-2 border-foreground bg-card shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-2.5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-terra flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Instant Quiz
                    </span>
                    <span className="text-[9px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold px-1.5 py-0.2 border border-emerald-500/30 rounded">
                      Quick Start
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-base text-foreground mt-0.5">
                    Play Go Berserk
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Jump into a randomized 197-country run.
                  </p>
                </div>
                <Link
                  to="/play/go-berserk"
                  className="w-full h-9 border-2 border-foreground bg-foreground text-background flex items-center justify-center gap-1.5 font-bold text-xs uppercase tracking-tight shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Start Quiz Now
                </Link>
              </div>

              {/* Box 2: Open Map Dashboard */}
              <div className="atlas-card p-3.5 sm:p-4 border-2 border-foreground bg-card shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-2.5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-forest dark:text-forest flex items-center gap-1">
                      <Compass className="w-3 h-3" /> Map Explorer
                    </span>
                    {mastered > 0 && (
                      <span className="text-[9px] bg-gold/20 text-foreground font-bold px-1.5 py-0.2 border border-foreground/20 rounded">
                        {mastered} Mastered
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-bold text-base text-foreground mt-0.5">
                    World Atlas Map
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Track regions, streaks & mastery stats.
                  </p>
                </div>
                <Link
                  to="/atlas"
                  className="w-full h-9 border-2 border-foreground bg-card hover:bg-muted text-foreground flex items-center justify-center gap-1.5 font-bold text-xs uppercase tracking-tight shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform"
                >
                  <MapPin className="w-3.5 h-3.5" /> Open World Atlas →
                </Link>
              </div>
            </div>

            {/* Zero Signup Footnote */}
            <p className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              No signup or download required. Progress stays 100% on your device.
            </p>
          </div>

          {/* RIGHT: Live Interactive Board Showcase (Proportionate, not oversized) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="atlas-card border-2 border-foreground bg-card shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] overflow-hidden w-full max-w-md">
              {/* Board Header */}
              <div className="px-3.5 py-2 bg-foreground text-background flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider">
                    Interactive Quiz Demo
                  </span>
                </div>
                <span className="font-mono text-[11px] text-gold font-bold">
                  XP: {demoScore}
                </span>
              </div>

              {/* Board Body */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                  <span>Flag {demoIdx + 1} of {DEMO_FLAGS.length}</span>
                  <span className="text-terra">{currentFlag.region}</span>
                </div>

                {/* Flag Image Display: Well-proportioned max-w and aspect ratio */}
                <div className="mx-auto w-full max-w-[280px] sm:max-w-[300px] aspect-[3/2] border-2 border-foreground bg-muted overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] relative rounded-sm">
                  <FlagImage
                    code={currentFlag.code}
                    alt={currentFlag.name}
                    className="w-full h-full object-cover"
                  />
                  {demoFeedback && (
                    <div className="absolute inset-0 bg-background/90 backdrop-blur-xs flex items-center justify-center p-2">
                      <span className="font-display text-sm sm:text-base font-black text-foreground border-2 border-foreground bg-gold px-3 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-bounce">
                        {demoFeedback}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-center font-display font-bold text-xs text-foreground">
                  Which nation's flag is this? (Tap to guess):
                </p>

                {/* 4 Compact Choices */}
                <div className="grid grid-cols-2 gap-2">
                  {currentFlag.options.map((option, i) => {
                    const isChosen = demoChosen === i;
                    const isCorrect = i === currentFlag.correct;
                    let btnStyle = "border-foreground bg-card hover:bg-muted text-foreground";
                    if (demoChosen !== null) {
                      if (isCorrect) {
                        btnStyle = "border-emerald-600 bg-emerald-500 text-white font-black";
                      } else if (isChosen) {
                        btnStyle = "border-destructive bg-destructive text-white";
                      }
                    }

                    return (
                      <button
                        key={option}
                        disabled={demoChosen !== null}
                        onClick={() => handleDemoPick(i)}
                        className={`h-9 px-2.5 border-2 font-bold text-xs uppercase tracking-tight text-left flex items-center justify-between transition-transform active:scale-95 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] ${btnStyle}`}
                      >
                        <span className="truncate">{option}</span>
                        {demoChosen !== null && isCorrect && (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 ml-1" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-1.5 flex items-center justify-between text-[10px] text-muted-foreground font-semibold border-t border-foreground/15">
                  <span>Capital: {currentFlag.capital}</span>
                  <button
                    onClick={() => {
                      setDemoIdx((prev) => (prev + 1) % DEMO_FLAGS.length);
                      setDemoChosen(null);
                      setDemoFeedback(null);
                    }}
                    className="inline-flex items-center gap-1 text-foreground hover:text-terra font-bold"
                  >
                    Next Flag <RotateCcw className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── HOW A MATCH / MASTERY PLAYS STRIP (Matching Chaos Cards & WordRush) ── */}
      <section className="w-full border-y-2 border-foreground bg-foreground text-background py-5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-3 gap-x-6 text-xs sm:text-sm font-bold uppercase tracking-wider">
          {STEPS.map((step, i) => (
            <div key={step.step} className="flex items-center gap-2">
              <span className="text-gold font-mono font-black">{step.step}</span>
              <span className="text-background">{step.label}</span>
              {i < STEPS.length - 1 && (
                <span className="hidden md:inline text-muted-foreground ml-3">→</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── 6 GAME MODES SHOWCASE ── */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest text-terra mb-2">
            <Trophy className="w-4 h-4" /> 6 Unique Ways to Train
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-foreground tracking-tight">
            BUILT FOR SPEED, MEMORY & COMBAT.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium mt-2">
            Whether you have 45 seconds on the commute or want a deep spaced-repetition study session, FlagAtlas has a mode for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {MODES_LIST.map((mode) => {
            const Icon = mode.icon;
            return (
              <div
                key={mode.path}
                className={`atlas-card p-5 sm:p-6 border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between group hover:-translate-y-1 transition-transform`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-10 h-10 border-2 border-foreground rounded-lg flex items-center justify-center bg-card shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-6 transition-transform">
                      <Icon className="w-5 h-5 text-foreground" />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 border border-foreground/30 rounded bg-muted">
                      {mode.badge}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-foreground">
                    {mode.label}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {mode.desc}
                  </p>
                </div>

                <Link
                  to={mode.path}
                  className="mt-5 inline-flex items-center justify-between w-full border-2 border-foreground bg-card hover:bg-foreground hover:text-background px-3.5 py-2 text-xs font-bold uppercase tracking-tight shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors"
                >
                  <span>Play Mode</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── THE SPACED REPETITION EXPLAINER (Why it works) ── */}
      <section className="w-full border-t-2 border-foreground bg-card/60 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="atlas-card p-6 sm:p-10 border-2 border-foreground bg-card shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-terra flex items-center gap-1.5">
                <Brain className="w-4 h-4" /> The Science of Memory
              </span>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-foreground">
                How FlagAtlas turns your short-term memory into permanent recall.
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Most quiz games test you once and move on. FlagAtlas runs an adapted 
                <strong> SuperMemo SM-2 algorithm</strong>: every country flag has an ease factor 
                and interval. When you guess right, the interval doubles. When you miss, it resets to tomorrow. 
                3 consecutive correct reviews unlocks <strong>Permanent Mastery</strong>.
              </p>
            </div>
            <div className="text-center p-5 border-2 border-foreground bg-muted/40 rounded-xl space-y-2">
              <div className="font-display text-4xl font-extrabold text-foreground">
                197
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Flags to Master
              </div>
              <div className="pt-2">
                <Link
                  to="/review"
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-tight text-terra hover:underline"
                >
                  <Layers className="w-3.5 h-3.5" /> Check Review Deck →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CALL TO ACTION ── */}
      <section className="w-full py-12 sm:py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-5">
          <h2 className="font-display text-3xl sm:text-5xl font-black text-foreground tracking-tight">
            READY TO HUMBLE YOUR GEOGRAPHY?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium">
            Jump in right now — no email, no password, no app install required.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/play/go-berserk"
              className="inline-flex items-center justify-center gap-2 border-2 border-foreground bg-foreground text-background px-6 h-12 font-bold text-sm uppercase tracking-tight shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform"
            >
              <Play className="w-4 h-4 fill-current" /> Play Go Berserk
            </Link>
            <Link
              to="/atlas"
              className="inline-flex items-center justify-center gap-2 border-2 border-foreground bg-card hover:bg-muted text-foreground px-6 h-12 font-bold text-sm uppercase tracking-tight shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform"
            >
              <MapPin className="w-4 h-4" /> Explore the World Map
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
