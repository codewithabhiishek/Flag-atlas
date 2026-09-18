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
  Brain,
  Layers,
  MapPin,
  Play,
  Users,
  Repeat,
  Flame,
  Award,
  BookOpen,
} from "lucide-react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import FlagImage from "@/components/FlagImage";
import confetti from "canvas-confetti";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

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
      <section className="relative w-full py-8 md:py-12 border-b-2 border-foreground/15">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Core Narrative & Primary CTAs */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              
              {/* Cartographic Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-foreground bg-gold/20 text-xs font-black uppercase tracking-wider text-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.25)] mb-4 sm:mb-5">
                <span className="text-terra">★</span>
                <span>SPACED REPETITION FLAG ATLAS</span>
              </div>

              {/* Dominant Hero Headline */}
              <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-[52px] text-foreground tracking-tight leading-[1.08] mb-4 sm:mb-5">
                LEARN EVERY FLAG. <br />
                <span className="text-terra">CONQUER THE MAP.</span> <br />
                NEVER FORGET.
              </h1>

              {/* Concise Explanation */}
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground font-medium leading-relaxed max-w-[56ch] mb-6 sm:mb-7">
                FlagAtlas turns global geography into an intuitive, systematic trainer.
                Powered by adaptive spaced repetition, it predicts memory decay and tests
                flags at the exact moment before you forget them.
              </p>

              {/* Primary CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mb-3">
                <Link
                  to="/play"
                  className="h-11 sm:h-12 px-6 sm:px-7 border-2 border-foreground bg-foreground text-background font-bold text-xs sm:text-sm uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-transform inline-flex items-center justify-center gap-2.5"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play Solo</span>
                </Link>

                <Link
                  to="/battle"
                  className="h-11 sm:h-12 px-6 sm:px-7 border-2 border-foreground bg-card hover:bg-muted text-foreground font-bold text-xs sm:text-sm uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:translate-y-0 transition-transform inline-flex items-center justify-center gap-2.5"
                >
                  <Swords className="w-4 h-4 text-terra" />
                  <span>Play with Friends</span>
                </Link>
              </div>

              {/* Tertiary Explore CTA */}
              <div className="mb-5">
                <Link
                  to="/atlas"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <Compass className="w-3.5 h-3.5 text-forest shrink-0" />
                  <span>Explore the World Atlas</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* Assurance Subtitle */}
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Zero friction · Free forever · No account required to play</span>
              </div>

            </div>

            {/* Right Column: Supporting Interactive Demo */}
            <div className="lg:col-span-5 flex justify-center w-full">
              <div className="w-full max-w-[320px] sm:max-w-[360px] border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.25)] overflow-hidden">
                
                {/* Board Top Header */}
                <div className="h-9 px-3.5 bg-foreground text-background flex items-center justify-between">
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
                <div className="p-3.5 sm:p-4 space-y-3">
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
                      <div
                        className={`absolute inset-0 flex items-center justify-center font-black text-xs sm:text-sm tracking-wider uppercase border-2 ${
                          demoFeedback.includes("CORRECT")
                            ? "bg-emerald-600/95 text-white border-emerald-800"
                            : "bg-destructive/95 text-white border-destructive"
                        }`}
                      >
                        {demoFeedback}
                      </div>
                    )}
                  </div>

                  {/* 4-Option Multiple Choice Grid */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Identify this flag:
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {currentFlag.options.map((opt, i) => {
                        let btnStyle = "border-foreground bg-card hover:bg-muted text-foreground";
                        if (demoChosen !== null) {
                          if (i === currentFlag.correct) {
                            btnStyle = "border-emerald-600 bg-emerald-500 text-white font-black";
                          } else if (i === demoChosen) {
                            btnStyle = "border-destructive bg-destructive text-white";
                          } else {
                            btnStyle = "border-foreground/30 opacity-40";
                          }
                        }

                        return (
                          <button
                            key={opt}
                            disabled={demoChosen !== null}
                            onClick={() => handleDemoPick(i)}
                            className={`h-8 sm:h-9 px-2.5 border-2 font-bold text-xs uppercase tracking-tight text-left flex items-center justify-between transition-transform active:scale-95 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[1.5px_1.5px_0px_0px_rgba(255,255,255,0.15)] ${btnStyle}`}
                          >
                            <span className="truncate">{opt}</span>
                            <span className="font-mono text-[10px] opacity-70 ml-1 shrink-0">
                              {i + 1}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Demo Quick Controls */}
                  <div className="pt-2 border-t border-foreground/15 flex items-center justify-between text-xs text-muted-foreground font-semibold">
                    <span>Capital: <strong className="text-foreground">{currentFlag.capital}</strong></span>
                    <button
                      onClick={() => {
                        setDemoIdx((prev) => (prev + 1) % DEMO_FLAGS.length);
                        setDemoChosen(null);
                        setDemoFeedback(null);
                      }}
                      className="hover:text-foreground text-terra underline text-[11px] font-bold uppercase tracking-wider"
                    >
                      Skip Flag →
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. WHERE DO YOU WANT TO GO?
          Three equal entry points: Play Solo / Play With Friends / Explore
      ───────────────────────────────────────────────────────────── */}
      <section id="multiplayer" className="w-full py-8 md:py-12 bg-muted/25 border-b-2 border-foreground/15 scroll-mt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-6 md:mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-terra mb-1.5">
              <Compass className="w-4 h-4" />
              <span>WHERE DO YOU WANT TO GO?</span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-foreground tracking-tight leading-tight">
              CHOOSE YOUR PATH
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium mt-1.5">
              Train solo, challenge a friend head-to-head, or enter the full FlagAtlas experience.
            </p>
          </div>

          {/* Three-Card Decision Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 items-stretch">

            {/* Card 1: Play Solo */}
            <div className="border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.25)] p-4 sm:p-5 lg:p-6 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 border border-forest/30 bg-forest/15 text-forest">
                    Solo Training
                  </span>
                  <Play className="w-4 h-4 text-forest fill-forest" />
                </div>

                <h3 className="font-display font-black text-xl sm:text-2xl text-foreground mb-2">
                  Play Solo
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                  Explore 197 sovereign nations with spaced repetition. Learn capitals, regions,
                  and coat-of-arms details as each correct recall colors your map.
                </p>

                <div className="space-y-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-5">
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>5 game modes — Go Berserk, Speed Run, Fragments</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Adaptive spaced repetition review queue</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>XP, levels &amp; streak tracking</span>
                  </div>
                </div>
              </div>

              <div className="pt-3.5 border-t border-foreground/15 mt-auto">
                <Link
                  to="/play"
                  className="h-10 w-full px-4 border-2 border-foreground bg-foreground text-background font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:translate-y-0 transition-transform inline-flex items-center justify-center gap-2"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Launch Solo Modes</span>
                </Link>
              </div>
            </div>

            {/* Card 2: Play with Friends */}
            <div className="border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.25)] p-4 sm:p-5 lg:p-6 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 border border-terra/30 bg-terra/15 text-terra">
                    Live 1v1 Multiplayer
                  </span>
                  <Swords className="w-4 h-4 text-terra" />
                </div>

                <h3 className="font-display font-black text-xl sm:text-2xl text-foreground mb-2">
                  Play with Friends
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-3.5">
                  Synchronized head-to-head flag duel. Share a 4-letter room code and race to 10 points in real time. Zero signup required.
                </p>

                {/* Direct Room Entry Box */}
                <div className="bg-background border-2 border-foreground p-3 sm:p-4 mb-3.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)]">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2.5 flex items-center justify-between">
                    <span>Instant Room Entry</span>
                    <span className="text-terra">1v1 Synchronized</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2.5">
                    <Link
                      to="/battle?action=create"
                      className="h-10 px-3 border-2 border-foreground bg-foreground text-background font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:translate-y-0 transition-transform inline-flex items-center justify-center gap-1.5 text-center"
                    >
                      <Users className="w-3 h-3" />
                      <span>Create →</span>
                    </Link>

                    <Link
                      to="/battle?action=join"
                      className="h-10 px-3 border-2 border-foreground bg-card hover:bg-muted text-foreground font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:translate-y-0 transition-transform inline-flex items-center justify-center gap-1.5 text-center"
                    >
                      <Swords className="w-3 h-3 text-terra" />
                      <span>Join</span>
                    </Link>
                  </div>

                  <form onSubmit={handleJoinByCode} className="flex gap-2">
                    <input
                      type="text"
                      maxLength={4}
                      value={roomCodeInput}
                      onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                      placeholder="ENTER 4-LETTER CODE"
                      aria-label="Enter 4-letter room code"
                      className="h-9 px-2.5 bg-card border-2 border-foreground font-mono text-[11px] font-bold uppercase tracking-wider text-foreground placeholder:text-muted-foreground/60 flex-1 min-w-0 focus:outline-none focus:ring-2 focus:ring-terra"
                    />
                    <button
                      type="submit"
                      className="h-9 px-3 border-2 border-foreground bg-terra text-white font-bold text-xs uppercase tracking-wider shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 transition-transform shrink-0 whitespace-nowrap"
                    >
                      Enter
                    </button>
                  </form>
                </div>
              </div>

              {/* Step Indicator */}
              <div className="pt-2.5 border-t border-foreground/15 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground gap-1">
                <span className="flex items-center gap-1 shrink-0">
                  <span className="font-mono text-terra">01</span> Create / Join
                </span>
                <span className="shrink-0 opacity-50">→</span>
                <span className="flex items-center gap-1 shrink-0">
                  <span className="font-mono text-terra">02</span> Room Code
                </span>
                <span className="shrink-0 opacity-50">→</span>
                <span className="flex items-center gap-1 shrink-0">
                  <span className="font-mono text-terra">03</span> Race to 10
                </span>
              </div>
            </div>



          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. HOW FLAGATLAS WORKS
          Progressive 4-step cognitive loop — tight, editorial presentation
      ───────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="w-full py-8 md:py-12 bg-muted/20 border-b-2 border-foreground/15 scroll-mt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-6 md:mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-terra mb-1.5">
              <Sparkles className="w-4 h-4" />
              <span>THE LEARNING LOOP</span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-foreground tracking-tight leading-tight">
              HOW FLAGATLAS WORKS
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium mt-1.5">
              A 4-stage cognitive cycle converting visual recognition into permanent geographic memory.
            </p>
          </div>

          {/* 4 Steps Tight Editorial Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {HOW_IT_WORKS.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="border-2 border-foreground bg-card shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] p-4 sm:p-5 flex flex-col justify-between h-full"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="font-mono font-black text-base text-terra">
                        {step.step}
                      </span>
                      <div className="w-8 h-8 border-2 border-foreground flex items-center justify-center bg-card shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[1.5px_1.5px_0px_0px_rgba(255,255,255,0.15)]">
                        <Icon className="w-3.5 h-3.5 text-forest" />
                      </div>
                    </div>
                    <h3 className="font-display font-bold text-base text-foreground mb-1">
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
          4. ATLAS PREVIEW TEASER
          Static world map silhouette — communicates the core product concept
          without duplicating the full /atlas page
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full py-8 md:py-12 border-b-2 border-foreground/15">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Two-column: text left, map right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* Left: Narrative */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-terra mb-2">
                <Compass className="w-4 h-4" />
                <span>THE WORLD ATLAS</span>
              </div>
              <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-foreground tracking-tight leading-tight mb-4">
                YOUR TERRITORY<br />EXPANDS WITH<br />
                <span className="text-terra">EVERY FLAG MASTERED</span>
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed mb-6">
                As you master each nation's flag, its territory permanently lights up on
                your personal world map. 197 countries. Every one a milestone.
                The Atlas is the visual record of your geographic knowledge.
              </p>

              {/* Colour legend */}
              <div className="flex flex-col gap-2 mb-7 text-xs font-bold uppercase tracking-wider">
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 shrink-0 border-2 border-foreground bg-[hsl(var(--forest))]" />
                  <span className="text-foreground">Mastered</span>
                  <span className="text-muted-foreground font-normal normal-case">— permanently colored</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 shrink-0 border-2 border-foreground bg-[hsl(var(--terra))]" />
                  <span className="text-foreground">Learning</span>
                  <span className="text-muted-foreground font-normal normal-case">— in progress</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 shrink-0 border-2 border-foreground bg-muted" />
                  <span className="text-foreground">Unexplored</span>
                  <span className="text-muted-foreground font-normal normal-case">— not studied yet</span>
                </div>
              </div>

              <Link
                to="/atlas"
                className="self-start h-10 px-5 border-2 border-foreground bg-foreground text-background font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:translate-y-0 transition-transform inline-flex items-center gap-2"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Explore the Atlas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Right: Static map preview */}
            <div className="lg:col-span-7">
              <div className="border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.25)] overflow-hidden">
                {/* Map header bar */}
                <div className="h-8 px-3.5 bg-foreground text-background flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="w-3 h-3 text-gold" />
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider">
                      World Atlas
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                    197 nations
                  </span>
                </div>
                {/* Map body */}
                <div className="relative w-full" style={{ aspectRatio: "1.8 / 1" }}>
                  <ComposableMap
                    projection="geoNaturalEarth1"
                    style={{ width: "100%", height: "100%" }}
                    projectionConfig={{ scale: 145, center: [0, 10] }}
                  >
                    <Geographies geography={GEO_URL}>
                      {({ geographies }) =>
                        geographies.map((geo) => (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            style={{
                              default: {
                                fill: "hsl(var(--land, 220 14% 80%))",
                                stroke: "hsl(var(--background))",
                                strokeWidth: 0.4,
                                outline: "none",
                              },
                              hover: {
                                fill: "hsl(var(--terra))",
                                stroke: "hsl(var(--background))",
                                strokeWidth: 0.4,
                                outline: "none",
                              },
                              pressed: { outline: "none" },
                            }}
                          />
                        ))
                      }
                    </Geographies>
                  </ComposableMap>
                  {/* Overlay: subtle teaser message */}
                  <div className="absolute bottom-0 left-0 right-0 px-3.5 py-2.5 bg-gradient-to-t from-card/90 to-transparent flex items-end justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Your atlas fills up as you learn
                    </span>
                    <Link
                      to="/atlas"
                      className="text-[10px] font-black uppercase tracking-wider text-terra hover:text-foreground transition-colors inline-flex items-center gap-1"
                    >
                      Open Atlas <ArrowRight className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. MEMORY / LEARNING DIFFERENTIATION
          Factual spaced repetition mechanics, no unbacked stats
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full py-8 md:py-12 border-b-2 border-foreground/15">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-7">
            <div className="max-w-2xl space-y-1.5">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-terra">
                <Brain className="w-4 h-4" />
                <span>SPACED REPETITION MECHANICS</span>
              </div>
              <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-foreground tracking-tight leading-tight">
                THE SCIENCE OF RETENTION
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium leading-relaxed">
                Standard trivia tests you once and forgets about you. FlagAtlas adapts the SuperMemo
                SM-2 interval curve: every nation maintains a personalized ease factor. Correct
                recalls progressively extend review intervals, while misses return immediately
                to your active queue until permanent mastery is verified.
              </p>
            </div>

            <div className="shrink-0">
              <Link
                to="/review"
                className="h-9 px-4 border-2 border-foreground bg-card hover:bg-muted text-foreground font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:translate-y-0 transition-transform inline-flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-terra" />
                <span>Open Review Deck</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 4 Factual Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {MEMORY_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.label}
                  className="border-2 border-foreground bg-card shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] p-4 sm:p-4.5 flex flex-col justify-between h-full"
                >
                  <div className="flex items-center justify-between mb-2.5">
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
          Single, high-impact closing section — all three entry points
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full py-8 md:py-12 bg-muted/15">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-terra mb-2">
            <Flame className="w-4 h-4" />
            <span>START NOW</span>
          </div>

          <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-foreground tracking-tight leading-tight mb-2.5">
            READY TO HUMBLE YOUR GEOGRAPHY?
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium max-w-[50ch] mx-auto mb-5 sm:mb-6 leading-relaxed">
            Jump in right now. Pick a solo discipline, color your map, or challenge a friend in a live 1v1 battle.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/play"
              className="h-11 sm:h-12 px-7 sm:px-8 w-full sm:w-auto border-2 border-foreground bg-foreground text-background font-bold text-xs sm:text-sm uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-transform inline-flex items-center justify-center gap-2.5"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play Solo</span>
            </Link>

            <Link
              to="/battle"
              className="h-11 sm:h-12 px-7 sm:px-8 w-full sm:w-auto border-2 border-foreground bg-card hover:bg-muted text-foreground font-bold text-xs sm:text-sm uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:translate-y-0 transition-transform inline-flex items-center justify-center gap-2.5"
            >
              <Swords className="w-4 h-4 text-terra" />
              <span>Play with Friends</span>
            </Link>

            <Link
              to="/atlas"
              className="h-11 sm:h-12 px-7 sm:px-8 w-full sm:w-auto border-2 border-foreground/40 bg-card hover:bg-muted text-foreground font-bold text-xs sm:text-sm uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,0.4)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:-translate-y-0.5 active:translate-y-0 transition-transform inline-flex items-center justify-center gap-2.5"
            >
              <Compass className="w-4 h-4 text-forest" />
              <span>Explore Atlas</span>
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
