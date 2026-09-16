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
  Repeat,
  Flame,
  Award,
  BookOpen,
} from "lucide-react";
import FlagImage from "@/components/FlagImage";
import confetti from "canvas-confetti";

// Showcase flags for the interactive demo card
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

// 4-step progressive learning process
const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Active Recall",
    desc: "Test flag recognition across 197 sovereign nations. Instant scoring sharpens your initial visual cues.",
    icon: Eye,
  },
  {
    step: "02",
    title: "Capital & Context",
    desc: "Every answer reveals vital geopolitical context: capitals, geographic regions, and coat-of-arms details.",
    icon: BookOpen,
  },
  {
    step: "03",
    title: "Color the Atlas",
    desc: "Each mastered country lights up on your interactive world map as you build geographic territory.",
    icon: MapPin,
  },
  {
    step: "04",
    title: "Spaced Repetition",
    desc: "Algorithms predict memory decay, surfacing flags right before you forget them for permanent retention.",
    icon: Repeat,
  },
];

// 6 Game Modes with uniform dimensions
const GAME_MODES = [
  {
    path: "/play/go-berserk",
    label: "Go Berserk",
    badge: "Most Popular",
    desc: "The ultimate 197-nation marathon. Every country appears once in randomized order for complete mastery.",
    icon: Globe2,
    badgeColor: "bg-terra/15 text-terra border-terra/30",
  },
  {
    path: "/play/speed",
    label: "Speed Run",
    badge: "45s Blitz",
    desc: "High-adrenaline reflex test. Identify as many flags as possible before the countdown timer hits zero.",
    icon: Zap,
    badgeColor: "bg-gold/20 text-foreground border-foreground/30",
  },
  {
    path: "/play/fragments",
    label: "Fragments",
    badge: "Visual Puzzle",
    desc: "Flags start obscured or blurred. Discern subtle national emblems before your allotted misses run out.",
    icon: Sparkles,
    badgeColor: "bg-forest/15 text-forest border-forest/30",
  },
  {
    path: "/play/recall",
    label: "Pure Recall",
    badge: "Active Memory",
    desc: "Picture the national flag from country name alone, reveal the answer, and self-grade your accuracy.",
    icon: Eye,
    badgeColor: "bg-muted text-foreground border-foreground/30",
  },
  {
    path: "/play/builder",
    label: "Flag Builder",
    badge: "Creative",
    desc: "Deconstruct and rebuild flags stripe-by-stripe, selecting correct proportions, layouts, and colors.",
    icon: Palette,
    badgeColor: "bg-muted text-foreground border-foreground/30",
  },
  {
    path: "/battle",
    label: "1v1 Battle",
    badge: "Multiplayer",
    desc: "Live head-to-head multiplayer duel. Share a room code with any friend and race to 10 points.",
    icon: Swords,
    badgeColor: "bg-terra/15 text-terra border-terra/30",
  },
];

// Science stats cards
const STATS = [
  {
    value: "197",
    label: "Sovereign Nations",
    detail: "Every UN member & territory",
    icon: Globe2,
  },
  {
    value: "3x",
    label: "Review Threshold",
    detail: "Consecutive recalls lock mastery",
    icon: Award,
  },
  {
    value: "85%",
    label: "Long-term Recall",
    detail: "Empirically validated retention",
    icon: Brain,
  },
  {
    value: "0s",
    label: "Onboarding Time",
    detail: "No mandatory signups or setup",
    icon: Zap,
  },
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
      setDemoFeedback("+15 XP · CORRECT");
      try {
        confetti({
          particleCount: 28,
          spread: 50,
          origin: { y: 0.65, x: 0.75 },
          colors: ["#10B981", "#F59E0B", "#3B82F6"],
        });
      } catch (_) {}
    } else {
      setDemoFeedback("INCORRECT");
    }

    // Auto advance after 1.6s
    setTimeout(() => {
      setDemoIdx((prev) => (prev + 1) % DEMO_FLAGS.length);
      setDemoChosen(null);
      setDemoFeedback(null);
    }, 1600);
  };

  return (
    <div className="w-full overflow-x-hidden bg-background text-foreground font-body">

      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION
          Standardized 96px desktop / 48px mobile vertical rhythm
      ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full py-12 md:py-24 border-b-2 border-foreground/15">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Headline, Narrative & Primary Actions */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              
              {/* Category Pill Tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-foreground bg-gold/20 text-xs font-black uppercase tracking-wider text-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.25)] mb-6">
                <span className="text-terra">★</span>
                <span>SPACED REPETITION FLAG ATLAS</span>
              </div>

              {/* Dominant Hero Headline (H1) */}
              <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground tracking-tight leading-[1.08] mb-6">
                LEARN EVERY FLAG. <br />
                <span className="text-terra">CONQUER THE MAP.</span> <br />
                NEVER FORGET.
              </h1>

              {/* Description constrained to optimal reading line-length */}
              <p className="text-base sm:text-lg text-muted-foreground font-medium leading-relaxed max-w-[58ch] mb-8">
                FlagAtlas transforms global geography into an addictive, systematic
                trainer. Powered by adaptive spaced repetition, it predicts your memory
                decay curve and tests flags at the exact moment before you forget them.
              </p>

              {/* Value Props & Indicators */}
              <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground mb-8">
                <div className="flex items-center gap-2 text-foreground">
                  <span className="w-2.5 h-2.5 rounded-full bg-terra shrink-0" />
                  <span>197 Sovereign Nations</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <span className="w-2.5 h-2.5 rounded-full bg-forest shrink-0" />
                  <span>SM-2 Memory Decay Algorithm</span>
                </div>
              </div>

              {/* Action Buttons: Unified Component Styles */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-4">
                <Link
                  to="/play/go-berserk"
                  className="h-12 px-8 border-2 border-foreground bg-foreground text-background font-bold text-sm uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-transform inline-flex items-center justify-center gap-2.5"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play Go Berserk</span>
                </Link>

                <Link
                  to="/atlas"
                  className="h-12 px-7 border-2 border-foreground bg-card hover:bg-muted text-foreground font-bold text-sm uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:translate-y-0 transition-transform inline-flex items-center justify-center gap-2.5"
                >
                  <Compass className="w-4 h-4 text-forest" />
                  <span>Explore World Atlas</span>
                </Link>
              </div>

              {/* Footnote reassurance */}
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Zero friction · Free forever · No account required to play</span>
              </div>

            </div>

            {/* Right Column: Live Interactive Flag Quiz Board */}
            <div className="lg:col-span-5 flex justify-center w-full">
              <div className="w-full max-w-[380px] border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.25)] overflow-hidden">
                
                {/* Board Top Header */}
                <div className="h-10 px-4 bg-foreground text-background flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                    <span className="font-mono text-xs font-bold uppercase tracking-wider">
                      Interactive Demo
                    </span>
                  </div>
                  <span className="font-mono text-xs text-gold font-bold">
                    Score: {demoScore}
                  </span>
                </div>

                {/* Board Content */}
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-bold uppercase tracking-wider">
                    <span>Card {demoIdx + 1} of {DEMO_FLAGS.length}</span>
                    <span className="text-terra">{currentFlag.region}</span>
                  </div>

                  {/* Flag Viewer */}
                  <div className="mx-auto w-full aspect-[3/2] border-2 border-foreground bg-muted overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)] relative">
                    <FlagImage
                      code={currentFlag.code}
                      alt={currentFlag.name}
                      className="w-full h-full object-cover"
                    />
                    {demoFeedback && (
                      <div className="absolute inset-0 bg-background/90 backdrop-blur-xs flex items-center justify-center p-2">
                        <span className={`font-display text-sm font-black px-3 py-1.5 border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                          demoFeedback.includes("CORRECT") ? "bg-emerald-400 text-foreground" : "bg-destructive text-destructive-foreground"
                        }`}>
                          {demoFeedback}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-center font-display font-bold text-sm text-foreground">
                    Which nation does this flag belong to?
                  </p>

                  {/* 4 Choices Grid */}
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
                          className={`h-9 px-2.5 border-2 font-bold text-xs uppercase tracking-tight text-left flex items-center justify-between transition-transform active:scale-95 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[1.5px_1.5px_0px_0px_rgba(255,255,255,0.15)] ${btnStyle}`}
                        >
                          <span className="truncate">{option}</span>
                          {demoChosen !== null && isCorrect && (
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 ml-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Metadata & Next action */}
                  <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground font-semibold border-t border-foreground/15">
                    <span className="truncate">Capital: {currentFlag.capital}</span>
                    <button
                      onClick={() => {
                        setDemoIdx((prev) => (prev + 1) % DEMO_FLAGS.length);
                        setDemoChosen(null);
                        setDemoFeedback(null);
                      }}
                      className="inline-flex items-center gap-1.5 text-foreground hover:text-terra font-bold shrink-0 transition-colors"
                    >
                      <span>Skip</span>
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. HOW IT WORKS SECTION
          Consistent 4-step progressive learning system
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full py-12 md:py-24 bg-muted/20 border-b-2 border-foreground/15">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-terra mb-3">
              <Sparkles className="w-4 h-4" />
              <span>THE LEARNING ENGINE</span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-foreground tracking-tight leading-tight mb-4">
              HOW FLAGATLAS WORKS
            </h2>
            <p className="text-base text-muted-foreground font-medium max-w-[55ch] mx-auto">
              A systematic 4-step cognitive loop designed to convert short-term recognition
              into permanent geographic instinct.
            </p>
          </div>

          {/* 4 Steps Equal-Height Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="border-2 border-foreground bg-card shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] p-6 flex flex-col justify-between h-full"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono font-black text-lg text-terra">
                        {step.step}
                      </span>
                      <div className="w-9 h-9 border-2 border-foreground rounded-none flex items-center justify-center bg-card shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[1.5px_1.5px_0px_0px_rgba(255,255,255,0.15)]">
                        <Icon className="w-4 h-4 text-forest" />
                      </div>
                    </div>
                    <h3 className="font-display font-bold text-lg text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. MULTIPLE WAYS TO PLAY (6 MODES GRID)
          Uniform cards, identical widths, heights, paddings & buttons
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full py-12 md:py-24 border-b-2 border-foreground/15">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-terra mb-3">
              <Trophy className="w-4 h-4" />
              <span>TRAINING REGIMES</span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-foreground tracking-tight leading-tight mb-4">
              MULTIPLE WAYS TO PLAY
            </h2>
            <p className="text-base text-muted-foreground font-medium max-w-[55ch] mx-auto">
              From high-speed reflex drills to strategic stripe-by-stripe flag reconstruction,
              pick the discipline that suits your current goals.
            </p>
          </div>

          {/* 3 columns × 2 rows CSS Grid with Identical Heights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GAME_MODES.map((mode) => {
              const Icon = mode.icon;
              return (
                <div
                  key={mode.path}
                  className="border-2 border-foreground bg-card shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] p-6 flex flex-col justify-between h-full group hover:-translate-y-1 transition-transform"
                >
                  {/* Card Content Top */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 border-2 border-foreground flex items-center justify-center bg-card shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[1.5px_1.5px_0px_0px_rgba(255,255,255,0.15)] group-hover:rotate-6 transition-transform">
                        <Icon className="w-5 h-5 text-forest" />
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 border ${mode.badgeColor}`}>
                        {mode.badge}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-xl text-foreground mb-2">
                      {mode.label}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {mode.desc}
                    </p>
                  </div>

                  {/* Card Footer Button */}
                  <div className="pt-6 mt-auto">
                    <Link
                      to={mode.path}
                      className="h-11 w-full border-2 border-foreground bg-card hover:bg-foreground hover:text-background text-foreground font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] inline-flex items-center justify-between px-4 transition-colors"
                    >
                      <span>Launch Mode</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. PLAY WITH FRIENDS (MULTIPLAYER CALLOUT)
          Balanced wide callout panel with clear action buttons
      ───────────────────────────────────────────────────────────── */}
      <section id="multiplayer" className="w-full py-12 md:py-24 bg-muted/20 border-b-2 border-foreground/15 scroll-mt-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.25)] p-6 sm:p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Side: Callout text & details */}
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-terra">
                  <Swords className="w-4 h-4" />
                  <span>SYNCHRONOUS REAL-TIME MULTIPLAYER</span>
                </div>
                
                <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-foreground tracking-tight leading-tight">
                  PLAY WITH FRIENDS
                </h2>
                
                <p className="text-base text-muted-foreground font-medium leading-relaxed max-w-[54ch]">
                  Throw down the gauntlet in a live 1v1 flag duel. Generate a 4-letter room
                  code, share it with anyone, and race side-by-side through synchronized flag
                  rounds to 10 points. Peer-to-peer, latency-free, zero account creation.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Instant room codes
                  </span>
                  <span className="flex items-center gap-1.5 text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    First to 10 points
                  </span>
                  <span className="flex items-center gap-1.5 text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Real-time score sync
                  </span>
                </div>
              </div>

              {/* Right Side: Dual Room CTAs with preview card */}
              <div className="lg:col-span-5 flex flex-col items-stretch sm:items-center lg:items-end gap-4 w-full">
                <div className="w-full sm:w-80 space-y-3">
                  <Link
                    to="/battle?action=create"
                    className="h-12 w-full border-2 border-foreground bg-foreground text-background font-bold text-sm uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-transform inline-flex items-center justify-center gap-2.5"
                  >
                    <Users className="w-4 h-4" />
                    <span>Create a Room</span>
                  </Link>

                  <Link
                    to="/battle?action=join"
                    className="h-12 w-full border-2 border-foreground bg-card hover:bg-muted text-foreground font-bold text-sm uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:translate-y-0 transition-transform inline-flex items-center justify-center gap-2.5"
                  >
                    <Swords className="w-4 h-4 text-terra" />
                    <span>Join a Room</span>
                  </Link>
                </div>

                <div className="text-center lg:text-right w-full sm:w-80">
                  <span className="text-xs text-muted-foreground font-medium">
                    Compatible across mobile, tablet, and desktop browsers
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. THE SCIENCE OF MEMORY & RETENTION METRICS
          Evidence-based spaced repetition breakdown
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full py-12 md:py-24 border-b-2 border-foreground/15">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-12">
            
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-terra">
                <Brain className="w-4 h-4" />
                <span>SPACED REPETITION & COGNITIVE SCIENCE</span>
              </div>
              <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-foreground tracking-tight leading-tight">
                THE SCIENCE OF MEMORY
              </h2>
              <p className="text-base text-muted-foreground font-medium leading-relaxed max-w-[65ch]">
                Standard trivia tests you once and forgets about you. FlagAtlas employs an adapted
                SuperMemo algorithm: every nation maintains a personalized ease factor. Correct
                recalls exponentially extend review intervals, while misses return for immediate review.
                Three successive verified intervals unlock permanent mastery.
              </p>
            </div>

            <div className="lg:col-span-4 flex lg:justify-end">
              <Link
                to="/review"
                className="h-12 px-6 border-2 border-foreground bg-card hover:bg-muted text-foreground font-bold text-sm uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:translate-y-0 transition-transform inline-flex items-center gap-2.5"
              >
                <Layers className="w-4 h-4 text-terra" />
                <span>Open Review Deck</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>

          {/* 4 Consistent Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="border-2 border-foreground bg-card shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] p-6 flex flex-col justify-between h-full"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-display font-black text-3xl sm:text-4xl text-foreground">
                      {stat.value}
                    </span>
                    <div className="w-9 h-9 border-2 border-foreground flex items-center justify-center bg-card shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[1.5px_1.5px_0px_0px_rgba(255,255,255,0.15)]">
                      <Icon className="w-4 h-4 text-forest" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm uppercase tracking-wider text-foreground mb-1">
                      {stat.label}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {stat.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. FINAL CALL TO ACTION
          Clear, bold, symmetrical closing invite
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full py-16 md:py-24 bg-muted/15">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-terra mb-4">
            <Flame className="w-4 h-4" />
            <span>START PLAYING NOW</span>
          </div>

          <h2 className="font-display font-black text-2xl sm:text-3xl md:text-5xl text-foreground tracking-tight leading-tight mb-4">
            READY TO HUMBLE YOUR GEOGRAPHY?
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground font-medium max-w-[50ch] mx-auto mb-8 leading-relaxed">
            Jump in right now. Choose a mode, color your map, and discover how quickly
            all 197 flags become second nature.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/play/go-berserk"
              className="h-12 px-8 w-full sm:w-auto border-2 border-foreground bg-foreground text-background font-bold text-sm uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-transform inline-flex items-center justify-center gap-2.5"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play Go Berserk</span>
            </Link>

            <Link
              to="/atlas"
              className="h-12 px-7 w-full sm:w-auto border-2 border-foreground bg-card hover:bg-muted text-foreground font-bold text-sm uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:translate-y-0 transition-transform inline-flex items-center justify-center gap-2.5"
            >
              <Compass className="w-4 h-4 text-forest" />
              <span>Explore World Atlas</span>
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
