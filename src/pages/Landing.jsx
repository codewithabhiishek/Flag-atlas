import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Compass,
  Globe2,
  Sparkles,
  Zap,
  Eye,
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
    desc: "Test flag recognition across 197 sovereign nations. Immediate feedback anchors visual symbols into memory.",
    icon: Eye,
  },
  {
    step: "02",
    title: "Capital & Context",
    desc: "Every answer reveals vital geopolitical context: national capitals, geographic subregions, and crest details.",
    icon: BookOpen,
  },
  {
    step: "03",
    title: "Color the Atlas",
    desc: "Mastered countries permanently light up on your interactive world map as your geographic territory expands.",
    icon: MapPin,
  },
  {
    step: "04",
    title: "Spaced Repetition",
    desc: "Interval decay algorithms calculate review timing, resurfacing flags right before memory fades for lasting retention.",
    icon: Repeat,
  },
];

// Factual product mechanics (no fabricated empirical claims)
const MEMORY_PILLARS = [
  {
    value: "197",
    label: "Sovereign Nations",
    detail: "Every UN member state and territory mapped and cataloged.",
    icon: Globe2,
  },
  {
    value: "SM-2",
    label: "Adaptive Interval",
    detail: "Review spacing dynamically scales based on answer accuracy.",
    icon: Brain,
  },
  {
    value: "3x",
    label: "Mastery Lock",
    detail: "Three verified spaced recalls promote a nation to Mastered.",
    icon: Award,
  },
  {
    value: "0s",
    label: "Instant Play",
    detail: "Local browser persistence — zero mandatory signup or barrier.",
    icon: Zap,
  },
];

export default function Landing() {
  const navigate = useNavigate();

  // Interactive Live Hero Board State
  const [demoIdx, setDemoIdx] = useState(0);
  const [demoChosen, setDemoChosen] = useState(null);
  const [demoScore, setDemoScore] = useState(140);
  const [demoFeedback, setDemoFeedback] = useState(null);

  // Quick Room Code Input State
  const [roomCodeInput, setRoomCodeInput] = useState("");

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

    setTimeout(() => {
      setDemoIdx((prev) => (prev + 1) % DEMO_FLAGS.length);
      setDemoChosen(null);
      setDemoFeedback(null);
    }, 1600);
  };

  const handleJoinByCode = (e) => {
    e.preventDefault();
    const cleanCode = roomCodeInput.trim().toUpperCase();
    if (cleanCode.length > 0) {
      navigate(`/battle?room=${cleanCode}`);
    } else {
      navigate(`/battle?action=join`);
    }
  };

  return (
    <div className="w-full overflow-x-hidden bg-background text-foreground font-body">

      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION
          Dominant headline, concise explanation, clear dual CTA, supporting demo
      ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full py-10 md:py-20 border-b-2 border-foreground/15">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Core Narrative & Primary CTAs */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              
              {/* Cartographic Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-foreground bg-gold/20 text-xs font-black uppercase tracking-wider text-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.25)] mb-5">
                <span className="text-terra">★</span>
                <span>SPACED REPETITION FLAG ATLAS</span>
              </div>

              {/* Dominant Hero Headline */}
              <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-[54px] text-foreground tracking-tight leading-[1.08] mb-5">
                LEARN EVERY FLAG. <br />
                <span className="text-terra">CONQUER THE MAP.</span> <br />
                NEVER FORGET.
              </h1>

              {/* Concise Explanation */}
              <p className="text-base sm:text-lg text-muted-foreground font-medium leading-relaxed max-w-[56ch] mb-7">
                FlagAtlas turns global geography into an intuitive, systematic trainer.
                Powered by adaptive spaced repetition, it predicts memory decay and tests
                flags at the exact moment before you forget them.
              </p>

              {/* Clear Decision CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mb-5">
                <Link
                  to="/play"
                  className="h-12 px-7 border-2 border-foreground bg-foreground text-background font-bold text-sm uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-transform inline-flex items-center justify-center gap-2.5"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play Solo</span>
                </Link>

                <a
                  href="#multiplayer"
                  className="h-12 px-7 border-2 border-foreground bg-card hover:bg-muted text-foreground font-bold text-sm uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:translate-y-0 transition-transform inline-flex items-center justify-center gap-2.5"
                >
                  <Swords className="w-4 h-4 text-terra" />
                  <span>Play with Friends</span>
                </a>
              </div>

              {/* Assurance Subtitle */}
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Zero friction · Free forever · No account required to play</span>
              </div>

            </div>

            {/* Right Column: Supporting Interactive Demo */}
            <div className="lg:col-span-5 flex justify-center w-full">
              <div className="w-full max-w-[370px] border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.25)] overflow-hidden">
                
                {/* Board Top Header */}
                <div className="h-9 px-4 bg-foreground text-background flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider">
                      Interactive Demo
                    </span>
                  </div>
                  <span className="font-mono text-xs text-gold font-bold">
                    Score: {demoScore}
                  </span>
                </div>

                {/* Board Body */}
                <div className="p-4 sm:p-5 space-y-3.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-bold uppercase tracking-wider">
                    <span>Card {demoIdx + 1} of {DEMO_FLAGS.length}</span>
                    <span className="text-terra font-semibold">{currentFlag.region}</span>
                  </div>

                  {/* Flag Image Box */}
                  <div className="mx-auto w-full aspect-[3/2] border-2 border-foreground bg-muted overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)] relative">
                    <FlagImage
                      code={currentFlag.code}
                      alt={currentFlag.name}
                      className="w-full h-full object-cover"
                    />
                    {demoFeedback && (
                      <div className="absolute inset-0 bg-background/90 backdrop-blur-xs flex items-center justify-center p-2">
                        <span className={`font-display text-xs sm:text-sm font-black px-3 py-1 border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                          demoFeedback.includes("CORRECT") ? "bg-emerald-400 text-foreground" : "bg-destructive text-destructive-foreground"
                        }`}>
                          {demoFeedback}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-center font-display font-bold text-xs sm:text-sm text-foreground">
                    Which nation does this flag belong to?
                  </p>

                  {/* 4 Answer Options */}
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

                  {/* Footer metadata */}
                  <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground font-semibold border-t border-foreground/15">
                    <span className="truncate">Capital: {currentFlag.capital}</span>
                    <button
                      onClick={() => {
                        setDemoIdx((prev) => (prev + 1) % DEMO_FLAGS.length);
                        setDemoChosen(null);
                        setDemoFeedback(null);
                      }}
                      className="inline-flex items-center gap-1 text-foreground hover:text-terra font-bold shrink-0 transition-colors"
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
          2. PLAY CHOICE / MULTIPLAYER ENTRY
          High priority near top: Solo vs Live Multiplayer decision
          Explicit Create Room & Join Room UX flow (FlagAtlas aesthetic)
      ───────────────────────────────────────────────────────────── */}
      <section id="multiplayer" className="w-full py-12 md:py-18 bg-muted/25 border-b-2 border-foreground/15 scroll-mt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-terra mb-2">
              <Swords className="w-4 h-4" />
              <span>HOW DO YOU WANT TO PLAY?</span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-foreground tracking-tight leading-tight">
              CHOOSE YOUR ARENA
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground font-medium mt-2">
              Learn countries and test memory decay solo, or duel a friend in real time.
            </p>
          </div>

          {/* Dual Decision Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            
            {/* Solo Experience Card */}
            <div className="lg:col-span-5 border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.25)] p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 border border-forest/30 bg-forest/15 text-forest">
                    Solo Learning
                  </span>
                  <Compass className="w-5 h-5 text-forest" />
                </div>

                <h3 className="font-display font-black text-2xl text-foreground mb-3">
                  Play Solo
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Explore 197 sovereign nations, learn capitals and regions, and train your
                  memory with 5 distinct training modes. Every correct recall colors your map.
                </p>

                <div className="space-y-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-6">
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>5 Game Modes (Go Berserk, Speed Run, Fragments)</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Interactive World Atlas territorial coloring</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Personalized spaced repetition review queue</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-foreground/15 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/play"
                  className="h-11 px-5 border-2 border-foreground bg-foreground text-background font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:translate-y-0 transition-transform inline-flex items-center justify-center gap-2 flex-1 text-center"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Launch Solo Modes</span>
                </Link>
                <Link
                  to="/atlas"
                  className="h-11 px-4 border-2 border-foreground bg-card hover:bg-muted text-foreground font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:translate-y-0 transition-transform inline-flex items-center justify-center gap-2"
                >
                  <Compass className="w-3.5 h-3.5 text-forest" />
                  <span>Atlas</span>
                </Link>
              </div>
            </div>

            {/* Multiplayer Battle Card */}
            <div className="lg:col-span-7 border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.25)] p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 border border-terra/30 bg-terra/15 text-terra">
                    Live 1v1 Multiplayer
                  </span>
                  <Swords className="w-5 h-5 text-terra" />
                </div>

                <h3 className="font-display font-black text-2xl text-foreground mb-3">
                  Play with Friends
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Challenge a friend in a live head-to-head flag duel. Synchronized rounds,
                  real-time score racing to 10 points. Zero signup, zero downloads.
                </p>

                {/* Direct Room Entry Flow */}
                <div className="bg-background border-2 border-foreground p-4 mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)]">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center justify-between">
                    <span>Instant Room Entry</span>
                    <span className="text-terra">1v1 Synchronized</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <Link
                      to="/battle?action=create"
                      className="h-11 px-4 border-2 border-foreground bg-foreground text-background font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:translate-y-0 transition-transform inline-flex items-center justify-center gap-2 text-center"
                    >
                      <Users className="w-4 h-4" />
                      <span>Create a Room →</span>
                    </Link>

                    <Link
                      to="/battle?action=join"
                      className="h-11 px-4 border-2 border-foreground bg-card hover:bg-muted text-foreground font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:translate-y-0 transition-transform inline-flex items-center justify-center gap-2 text-center"
                    >
                      <Swords className="w-4 h-4 text-terra" />
                      <span>Join a Room</span>
                    </Link>
                  </div>

                  {/* Inline Room Code Form */}
                  <form onSubmit={handleJoinByCode} className="flex gap-2">
                    <input
                      type="text"
                      maxLength={4}
                      value={roomCodeInput}
                      onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                      placeholder="ENTER 4-LETTER CODE"
                      aria-label="Enter 4-letter room code"
                      className="h-10 px-3 bg-card border-2 border-foreground font-mono text-xs font-bold uppercase tracking-wider text-foreground placeholder:text-muted-foreground/60 flex-1 focus:outline-none focus:ring-2 focus:ring-terra"
                    />
                    <button
                      type="submit"
                      className="h-10 px-4 border-2 border-foreground bg-terra text-white font-bold text-xs uppercase tracking-wider shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 transition-transform shrink-0"
                    >
                      Enter Room
                    </button>
                  </form>
                </div>
              </div>

              {/* 3-Step Micro Flow */}
              <div className="pt-3 border-t border-foreground/15 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="font-mono text-terra">01</span> Create / Join
                </span>
                <span>→</span>
                <span className="flex items-center gap-1">
                  <span className="font-mono text-terra">02</span> Room Code
                </span>
                <span>→</span>
                <span className="flex items-center gap-1">
                  <span className="font-mono text-terra">03</span> Race to 10 Pts
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. CHOOSE YOUR EXPERIENCE
          Structured hierarchy: World Atlas, Game Modes, 1v1 Battle
      ───────────────────────────────────────────────────────────── */}
      <section id="experiences" className="w-full py-12 md:py-20 border-b-2 border-foreground/15 scroll-mt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-terra mb-2">
              <Trophy className="w-4 h-4" />
              <span>THE ECOSYSTEM</span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-foreground tracking-tight leading-tight">
              CHOOSE YOUR EXPERIENCE
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground font-medium mt-2">
              Explore territories, drill memory across 5 flag disciplines, or battle friends in real-time.
            </p>
          </div>

          {/* Primary FlagAtlas Experiences Grid (3 Core Experiences) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Experience 1: World Atlas */}
            <div className="border-2 border-foreground bg-card shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] p-6 flex flex-col justify-between h-full group hover:-translate-y-1 transition-transform">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 border-2 border-foreground flex items-center justify-center bg-card shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[1.5px_1.5px_0px_0px_rgba(255,255,255,0.15)] group-hover:rotate-6 transition-transform">
                    <Compass className="w-5 h-5 text-forest" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 border border-forest/30 bg-forest/15 text-forest">
                    Explore
                  </span>
                </div>
                <h3 className="font-display font-bold text-xl text-foreground mb-2">
                  World Atlas
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Interactive global territory map. Inspect capitals, national flags, and regional groupings as each mastered nation permanently illuminates your territory.
                </p>
              </div>
              <div className="pt-6 mt-auto">
                <Link
                  to="/atlas"
                  className="h-10 w-full border-2 border-foreground bg-card hover:bg-foreground hover:text-background text-foreground font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] inline-flex items-center justify-between px-4 transition-colors"
                >
                  <span>Explore World Atlas</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Experience 2: Flag Games */}
            <div className="border-2 border-foreground bg-card shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] p-6 flex flex-col justify-between h-full group hover:-translate-y-1 transition-transform">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 border-2 border-foreground flex items-center justify-center bg-card shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[1.5px_1.5px_0px_0px_rgba(255,255,255,0.15)] group-hover:rotate-6 transition-transform">
                    <Sparkles className="w-5 h-5 text-forest" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 border border-foreground/30 bg-gold/20 text-foreground">
                    Play
                  </span>
                </div>
                <h3 className="font-display font-bold text-xl text-foreground mb-2">
                  Flag Games
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  5 specialized training disciplines: Go Berserk 197-nation marathon, 45-second blitz Speed Run, obscured Fragments puzzle, Pure Recall, and Flag Builder.
                </p>
              </div>
              <div className="pt-6 mt-auto">
                <Link
                  to="/play"
                  className="h-10 w-full border-2 border-foreground bg-card hover:bg-foreground hover:text-background text-foreground font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] inline-flex items-center justify-between px-4 transition-colors"
                >
                  <span>Choose Game Mode</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Experience 3: 1v1 Battle */}
            <div className="border-2 border-foreground bg-card shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] p-6 flex flex-col justify-between h-full group hover:-translate-y-1 transition-transform">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 border-2 border-foreground flex items-center justify-center bg-card shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[1.5px_1.5px_0px_0px_rgba(255,255,255,0.15)] group-hover:rotate-6 transition-transform">
                    <Swords className="w-5 h-5 text-terra" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 border border-terra/30 bg-terra/15 text-terra">
                    Battle
                  </span>
                </div>
                <h3 className="font-display font-bold text-xl text-foreground mb-2">
                  1v1 Battle
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Head-to-head live multiplayer. Synchronized flag questions, 4-letter room codes, instant peer connectivity, and a live race to 10 points.
                </p>
              </div>
              <div className="pt-6 mt-auto">
                <Link
                  to="/battle"
                  className="h-10 w-full border-2 border-foreground bg-card hover:bg-foreground hover:text-background text-foreground font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] inline-flex items-center justify-between px-4 transition-colors"
                >
                  <span>Battle Arena</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. HOW FLAGATLAS WORKS
          Progressive 4-step cognitive loop — tight, editorial presentation
      ───────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="w-full py-12 md:py-20 bg-muted/20 border-b-2 border-foreground/15 scroll-mt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-terra mb-2">
              <Sparkles className="w-4 h-4" />
              <span>THE LEARNING LOOP</span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-foreground tracking-tight leading-tight">
              HOW FLAGATLAS WORKS
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground font-medium mt-2">
              A 4-stage cognitive cycle converting visual recognition into permanent geographic memory.
            </p>
          </div>

          {/* 4 Steps Tight Editorial Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOW_IT_WORKS.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="border-2 border-foreground bg-card shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] p-5 flex flex-col justify-between h-full"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono font-black text-base text-terra">
                        {step.step}
                      </span>
                      <div className="w-8 h-8 border-2 border-foreground flex items-center justify-center bg-card shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[1.5px_1.5px_0px_0px_rgba(255,255,255,0.15)]">
                        <Icon className="w-3.5 h-3.5 text-forest" />
                      </div>
                    </div>
                    <h3 className="font-display font-bold text-base text-foreground mb-1.5">
                      {step.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
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
          5. MEMORY / LEARNING DIFFERENTIATION
          Factual spaced repetition mechanics, no unbacked stats
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full py-12 md:py-20 border-b-2 border-foreground/15">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-10">
            
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-terra">
                <Brain className="w-4 h-4" />
                <span>SPACED REPETITION MECHANICS</span>
              </div>
              <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-foreground tracking-tight leading-tight">
                THE SCIENCE OF RETENTION
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed max-w-[62ch]">
                Standard trivia tests you once and forgets about you. FlagAtlas adapts the SuperMemo
                SM-2 interval curve: every nation maintains a personalized ease factor. Correct
                recalls progressively extend review intervals, while misses return immediately
                to your active queue until permanent mastery is verified.
              </p>
            </div>

            <div className="lg:col-span-4 flex lg:justify-end">
              <Link
                to="/review"
                className="h-11 px-5 border-2 border-foreground bg-card hover:bg-muted text-foreground font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:translate-y-0 transition-transform inline-flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-terra" />
                <span>Open Review Deck</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

          {/* 4 Factual Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {MEMORY_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.label}
                  className="border-2 border-foreground bg-card shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] p-5 flex flex-col justify-between h-full"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-display font-black text-2xl sm:text-3xl text-foreground">
                      {pillar.value}
                    </span>
                    <div className="w-8 h-8 border-2 border-foreground flex items-center justify-center bg-card shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[1.5px_1.5px_0px_0px_rgba(255,255,255,0.15)]">
                      <Icon className="w-4 h-4 text-forest" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-foreground mb-1">
                      {pillar.label}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {pillar.detail}
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
          Single, high-impact closing section
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full py-16 md:py-22 bg-muted/15">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-terra mb-3">
            <Flame className="w-4 h-4" />
            <span>START PLAYING NOW</span>
          </div>

          <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-foreground tracking-tight leading-tight mb-4">
            READY TO HUMBLE YOUR GEOGRAPHY?
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground font-medium max-w-[50ch] mx-auto mb-8 leading-relaxed">
            Jump in right now. Pick a solo discipline, color your map, or challenge a friend in a live 1v1 battle.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/play"
              className="h-12 px-8 w-full sm:w-auto border-2 border-foreground bg-foreground text-background font-bold text-sm uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-transform inline-flex items-center justify-center gap-2.5"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play Solo</span>
            </Link>

            <Link
              to="/battle"
              className="h-12 px-8 w-full sm:w-auto border-2 border-foreground bg-card hover:bg-muted text-foreground font-bold text-sm uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:translate-y-0 transition-transform inline-flex items-center justify-center gap-2.5"
            >
              <Swords className="w-4 h-4 text-terra" />
              <span>Play with Friends</span>
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
