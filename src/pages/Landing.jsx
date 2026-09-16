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
  Users,
} from "lucide-react";
import FlagImage from "@/components/FlagImage";
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
  },
  {
    path: "/play/speed",
    label: "Speed Run",
    badge: "45s Blitz",
    desc: "Rapid-fire reflex test. Answer as many flags as possible before the clock expires.",
    icon: Zap,
  },
  {
    path: "/play/fragments",
    label: "Fragments",
    badge: "Visual Puzzle",
    desc: "The flag starts heavily blurred. Identify it before your misses run out.",
    icon: Sparkles,
  },
  {
    path: "/play/recall",
    label: "Recall",
    badge: "Memory",
    desc: "Picture the flag in your mind from the country name, then reveal and self-grade.",
    icon: Eye,
  },
  {
    path: "/play/builder",
    label: "Flag Builder",
    badge: "Creative",
    desc: "Reconstruct national flags stripe-by-stripe by selecting the right colors in order.",
    icon: Palette,
  },
  {
    path: "/battle",
    label: "1v1 Battle",
    badge: "Multiplayer",
    desc: "Real-time flag duel. Share a room code with a friend and race to 10 points.",
    icon: Swords,
  },
];

const STEPS = [
  { step: "01", label: "GUESS" },
  { step: "02", label: "LEARN" },
  { step: "03", label: "COLOR THE MAP" },
  { step: "04", label: "COLLECT STAMPS" },
];

export default function Landing() {
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
    <div className="w-full overflow-x-hidden">
      {/* ── HERO SECTION (Two-Column Editorial Atlas Layout) ── */}
      <section className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-16 pb-12 sm:pb-16 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center">
          
          {/* LEFT: Headline, Differentiator & Dominant Primary CTA */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            {/* Tag badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 border-2 border-foreground bg-gold/20 text-[11px] font-extrabold uppercase tracking-wider text-foreground shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-terra">★</span> WORLD GEOGRAPHY & FLAG MASTERY
            </div>

            {/* Fluid Responsive Headline */}
            <h1 className="font-display font-black text-foreground tracking-tight leading-[1.06] text-[clamp(1.85rem,4.5vw,3.25rem)] max-w-xl">
              LEARN EVERY FLAG. <br />
              <span className="text-terra">
                CONQUER THE MAP.
              </span> <br />
              NEVER FORGET.
            </h1>

            {/* Punchy description */}
            <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-lg leading-relaxed">
              FlagAtlas turns world geography into an addictive, fast-paced game. 
              Powered by spaced repetition, it predicts memory decay and brings flags 
              back right before you forget them.
            </p>

            {/* Credibility Indicators: 2 quiet value points */}
            <div className="flex items-center gap-3.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground pt-1">
              <span className="flex items-center gap-1.5 text-foreground">
                <span className="w-2 h-2 rounded-full bg-terra shrink-0" />
                197 Countries
              </span>
              <span className="text-muted-foreground/40">•</span>
              <span className="flex items-center gap-1.5 text-foreground">
                <span className="w-2 h-2 rounded-full bg-forest shrink-0" />
                Spaced Repetition
              </span>
            </div>

            {/* Clear Primary & Secondary CTA Action Bar */}
            <div className="pt-2 sm:pt-3 space-y-3 max-w-lg">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* DOMINANT PRIMARY CTA */}
                <Link
                  to="/play/go-berserk"
                  className="h-11 sm:h-12 px-6 sm:px-8 border-2 border-foreground bg-foreground text-background flex items-center justify-center gap-2 font-black text-xs sm:text-sm uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 transition-transform"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Play Go Berserk
                </Link>

                {/* SECONDARY CTA */}
                <Link
                  to="/atlas"
                  className="h-11 sm:h-12 px-5 sm:px-6 border-2 border-foreground bg-card hover:bg-muted text-foreground flex items-center justify-center gap-2 font-bold text-xs sm:text-sm uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 transition-transform"
                >
                  <Compass className="w-4 h-4 text-forest" /> Explore World Atlas
                </Link>
              </div>

              {/* Quiet Tertiary Footnote: No signup required + subtle Battle link */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground pt-1">
                <span className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  No signup or install required
                </span>
                <a
                  href="#multiplayer"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("multiplayer")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="font-bold text-muted-foreground hover:text-terra inline-flex items-center gap-1 underline underline-offset-2 transition-colors cursor-pointer"
                >
                  Play with friends →
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT: Live Interactive Board Showcase */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div className="border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden w-full max-w-[300px] xs:max-w-[320px] sm:max-w-[350px] md:max-w-[370px]">
              {/* Board Header */}
              <div className="px-3 py-2 bg-foreground text-background flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                  <span className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                    Interactive Demo
                  </span>
                </div>
                <span className="font-mono text-[10px] sm:text-[11px] text-gold font-bold">
                  XP: {demoScore}
                </span>
              </div>

              {/* Board Body */}
              <div className="p-3 sm:p-3.5 space-y-2.5">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                  <span>Flag {demoIdx + 1} of {DEMO_FLAGS.length}</span>
                  <span className="text-terra">{currentFlag.region}</span>
                </div>

                {/* Flag Image Display */}
                <div className="mx-auto w-full max-w-[160px] xs:max-w-[185px] sm:max-w-[210px] aspect-[3/2] border-2 border-foreground bg-muted overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] relative rounded-xs">
                  <FlagImage
                    code={currentFlag.code}
                    alt={currentFlag.name}
                    className="w-full h-full object-cover"
                  />
                  {demoFeedback && (
                    <div className="absolute inset-0 bg-background/90 backdrop-blur-xs flex items-center justify-center p-1">
                      <span className="font-display text-xs font-black text-foreground border-2 border-foreground bg-gold px-2.5 py-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] animate-bounce text-center">
                        {demoFeedback}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-center font-display font-bold text-xs sm:text-[13px] text-foreground">
                  Which nation's flag is this?
                </p>

                {/* 4 Compact Choices */}
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
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
                        className={`h-7.5 sm:h-8.5 px-2 border-2 font-bold text-[10px] sm:text-[11px] uppercase tracking-tight text-left flex items-center justify-between transition-transform active:scale-95 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${btnStyle}`}
                      >
                        <span className="truncate">{option}</span>
                        {demoChosen !== null && isCorrect && (
                          <CheckCircle2 className="w-3 h-3 shrink-0 ml-1" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-1.5 flex items-center justify-between text-[10px] text-muted-foreground font-semibold border-t border-foreground/15">
                  <span className="truncate mr-1">Capital: {currentFlag.capital}</span>
                  <button
                    onClick={() => {
                      setDemoIdx((prev) => (prev + 1) % DEMO_FLAGS.length);
                      setDemoChosen(null);
                      setDemoFeedback(null);
                    }}
                    className="inline-flex items-center gap-1 text-foreground hover:text-terra font-bold shrink-0"
                  >
                    Next <RotateCcw className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── PROCESS EXPLANATION: HOW FLAGATLAS WORKS (Quiet & Airy Divider) ── */}
      <section className="w-full border-y-2 border-foreground bg-muted/30 py-5 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-6">
          <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
            How FlagAtlas Works
          </span>
          <div className="flex flex-wrap items-center gap-x-6 sm:gap-x-8 gap-y-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-foreground">
            {STEPS.map((step, i) => (
              <div key={step.step} className="flex items-center gap-2">
                <span className="text-terra font-mono font-black">{step.step}</span>
                <span>{step.label}</span>
                {i < STEPS.length - 1 && (
                  <span className="text-muted-foreground/40 ml-2 hidden sm:inline">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLAY WITH FRIENDS (Spacious Editorial Callout) ── */}
      <section id="multiplayer" className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16 scroll-mt-6">
        <div className="border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-12">
          {/* Left: Eyebrow, Heading, Supporting Description */}
          <div className="lg:max-w-xl xl:max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-terra mb-2 sm:mb-2.5">
              <Swords className="w-3.5 h-3.5" /> Play With Friends
            </div>
            <h2 className="font-display font-black text-foreground tracking-tight text-[clamp(1.35rem,3.2vw,2rem)] leading-tight mb-2.5 sm:mb-3">
              PLAY WITH FRIENDS.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed max-w-lg">
              Challenge friends to a real-time flag duel. Share a 4-letter room code,
              race head-to-head through national flags, and find out who has the fastest recall.
            </p>
          </div>

          {/* Right: Un-squeezed Action Panel */}
          <div className="shrink-0 flex flex-col items-start lg:items-end justify-center gap-2.5 w-full lg:w-auto">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <Link
                to="/battle?action=create"
                className="h-11 sm:h-12 px-6 border-2 border-foreground bg-foreground text-background flex items-center justify-center gap-2 font-black text-xs sm:text-sm uppercase tracking-wider shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 transition-transform whitespace-nowrap"
              >
                <Users className="w-4 h-4" /> Create a Room
              </Link>
              <Link
                to="/battle?action=join"
                className="h-11 sm:h-12 px-6 border-2 border-foreground bg-card hover:bg-muted text-foreground flex items-center justify-center gap-2 font-bold text-xs sm:text-sm uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 transition-transform whitespace-nowrap"
              >
                <Swords className="w-4 h-4 text-terra" /> Join a Room
              </Link>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>No signup required · 1v1 real-time</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6 GAME MODES (Open Editorial Section Directly on Page Background) ── */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-terra mb-2">
            <Trophy className="w-3.5 h-3.5" /> 6 Ways to Train
          </div>
          <h2 className="font-display font-black text-foreground tracking-tight text-[clamp(1.5rem,3.6vw,2.25rem)]">
            MULTIPLE WAYS TO PLAY.
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-2 max-w-md mx-auto">
            Once you're inside, choose the training mode that fits your focus.
          </p>
        </div>

        {/* 3 columns × 2 rows Grid with Uniform Dimensions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {MODES_LIST.map((mode) => {
            const Icon = mode.icon;
            return (
              <div
                key={mode.path}
                className="p-5 sm:p-6 border-2 border-foreground bg-card shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between h-full group hover:-translate-y-1 transition-transform"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-9 h-9 border-2 border-foreground rounded-lg flex items-center justify-center bg-card shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-6 transition-transform">
                      <Icon className="w-4 h-4 text-foreground" />
                    </span>
                    <span className="text-[10.5px] font-bold uppercase tracking-wider px-2.5 py-0.5 border border-foreground/30 rounded bg-muted text-foreground">
                      {mode.badge}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-foreground mb-2">
                    {mode.label}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {mode.desc}
                  </p>
                </div>

                <div className="pt-5 mt-auto">
                  <Link
                    to={mode.path}
                    className="inline-flex items-center justify-between w-full h-9 px-3.5 border-2 border-foreground bg-card hover:bg-foreground hover:text-background text-xs font-bold uppercase tracking-tight shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] transition-colors"
                  >
                    <span>Play Mode</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── THE SCIENCE OF MEMORY (Contained Feature Callout) ── */}
      <section className="w-full border-t-2 border-foreground bg-muted/20 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            <div className="lg:col-span-8 space-y-2.5">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-terra flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 shrink-0" /> The Science of Memory
              </span>
              <h3 className="font-display font-black text-lg sm:text-2xl text-foreground leading-snug">
                How FlagAtlas turns short-term memory into permanent recall.
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl pt-0.5">
                Most trivia apps quiz you once and move on. FlagAtlas runs an adapted 
                spaced repetition algorithm: every nation has an ease score. 
                Correct answers extend intervals, while misses reappear tomorrow. 
                Three consecutive reviews unlock permanent mastery.
              </p>
            </div>
            <div className="lg:col-span-4 text-center p-5 sm:p-6 border-2 border-foreground bg-muted/40 rounded-xl space-y-1.5">
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-foreground">
                197
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Flags to Master
              </div>
              <div className="pt-1.5">
                <Link
                  to="/review"
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-tight text-terra hover:underline"
                >
                  <Layers className="w-3.5 h-3.5" /> Review Deck →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CALL TO ACTION (Clean, Open, Direct) ── */}
      <section className="w-full py-16 sm:py-20 lg:py-24 px-4 text-center">
        <div className="max-w-xl mx-auto space-y-4">
          <h2 className="font-display font-black text-foreground tracking-tight text-[clamp(1.5rem,4vw,2.25rem)]">
            READY TO HUMBLE YOUR GEOGRAPHY?
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-md mx-auto">
            Jump in right now — no signup or install required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/play/go-berserk"
              className="inline-flex items-center justify-center gap-2 border-2 border-foreground bg-foreground text-background px-7 h-11 sm:h-12 w-full sm:w-auto font-black text-xs sm:text-sm uppercase tracking-wider shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Play Go Berserk
            </Link>
            <Link
              to="/atlas"
              className="inline-flex items-center justify-center gap-2 border-2 border-foreground bg-card hover:bg-muted text-foreground px-6 h-11 sm:h-12 w-full sm:w-auto font-bold text-xs sm:text-sm uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform"
            >
              <MapPin className="w-3.5 h-3.5" /> Explore World Atlas
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

