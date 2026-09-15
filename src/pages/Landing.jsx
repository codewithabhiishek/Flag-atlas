import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Crown,
  QrCode,
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
  const navigate = useNavigate();
  const [roomInput, setRoomInput] = useState("");
  const { state } = useProgress();
  const mastered = masteredCount(state.flags);

  // Interactive Live Hero Board State
  const [demoIdx, setDemoIdx] = useState(0);
  const [demoChosen, setDemoChosen] = useState(null);
  const [demoScore, setDemoScore] = useState(140);
  const [demoFeedback, setDemoFeedback] = useState(null);

  const currentFlag = DEMO_FLAGS[demoIdx];

  const handleJoinRoom = (e) => {
    e.preventDefault();
    const trimmed = roomInput.trim().toUpperCase();
    if (trimmed.length === 4) {
      navigate(`/battle?room=${trimmed}`);
    }
  };

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
      {/* ── TOP ANNOUNCEMENT BANNER ── */}
      <div className="w-full bg-forest text-primary-foreground text-[10px] sm:text-xs py-1.5 px-3 sm:px-4 text-center font-bold tracking-wide uppercase border-b-2 border-foreground flex items-center justify-center gap-1.5 sm:gap-2">
        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold shrink-0 animate-pulse" />
        <span className="truncate sm:overflow-visible">197 Nations · Spaced Repetition Engine · 100% Free</span>
      </div>

      {/* ── HERO SECTION (Two-Column Editorial Atlas Layout) ── */}
      <section className="relative w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-7 lg:pt-9 pb-5 sm:pb-8 lg:pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-7 lg:gap-9 items-center">
          
          {/* LEFT: Headline & Quick Play CTAs */}
          <div className="lg:col-span-7 space-y-2.5 sm:space-y-3.5">
            {/* Tag badge */}
            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 border-2 border-foreground bg-gold/20 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-foreground shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-terra">★</span> WORLD GEOGRAPHY & FLAG MASTERY
            </div>

            {/* Fluid Responsive Headline: Disciplined size on 320px-390px, bold on desktop */}
            <h1 className="font-display font-black text-foreground tracking-tight leading-[1.08] sm:leading-[1.05] text-[clamp(1.35rem,4.5vw,3rem)]">
              LEARN EVERY FLAG. <br />
              <span className="text-terra">
                CONQUER THE MAP.
              </span> <br />
              NEVER FORGET.
            </h1>

            {/* Punchy description with controlled max-width */}
            <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-md lg:max-w-lg leading-relaxed">
              FlagAtlas turns world geography into an addictive, fast-paced game. 
              Powered by SM-2 spaced repetition, it predicts memory decay 
              and brings weak flags back just before you forget them.
            </p>

            {/* Feature Pills: wrap naturally with zero horizontal overflow */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-card border-2 border-foreground text-[9.5px] sm:text-[10.5px] font-bold uppercase tracking-tight shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                ⚡ 197 Countries
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gold/25 border-2 border-foreground text-[9.5px] sm:text-[10.5px] font-bold uppercase tracking-tight shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] text-foreground">
                ⚔️ Play With Friends
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-card border-2 border-foreground text-[9.5px] sm:text-[10.5px] font-bold uppercase tracking-tight shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                🎮 6 Game Modes
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-card border-2 border-foreground text-[9.5px] sm:text-[10.5px] font-bold uppercase tracking-tight shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                🧠 Spaced Repetition
              </span>
            </div>

            {/* Quick Action Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 pt-1 max-w-lg">
              {/* Box 1: Start Playing Solo */}
              <div className="atlas-card p-2.5 sm:p-3 border-2 border-foreground bg-card shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-terra flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Solo Quiz
                    </span>
                    <span className="text-[8.5px] sm:text-[9px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold px-1.5 py-0.2 border border-emerald-500/30 rounded">
                      Quick Start
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-xs sm:text-sm text-foreground mt-0.5">
                    Play Go Berserk
                  </h3>
                  <p className="text-[10px] sm:text-[10.5px] text-muted-foreground">
                    Jump into a randomized 197-country run.
                  </p>
                </div>
                <Link
                  to="/play/go-berserk"
                  className="w-full h-8 sm:h-8.5 border-2 border-foreground bg-foreground text-background flex items-center justify-center gap-1.5 font-bold text-xs uppercase tracking-tight shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform"
                >
                  <Play className="w-3 h-3 fill-current" /> Start Quiz Now
                </Link>
              </div>

              {/* Box 2: Play With Friends / Multiplayer Battle */}
              <div className="atlas-card p-2.5 sm:p-3 border-2 border-foreground bg-card shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-terra flex items-center gap-1">
                      <Swords className="w-3 h-3" /> Multiplayer
                    </span>
                    <span className="text-[8.5px] sm:text-[9px] bg-gold/25 text-foreground font-bold px-1.5 py-0.2 border border-foreground/20 rounded">
                      Live Battle
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-xs sm:text-sm text-foreground mt-0.5">
                    Play With Friends
                  </h3>
                  <p className="text-[10px] sm:text-[10.5px] text-muted-foreground">
                    Host a private room or enter a code.
                  </p>
                </div>
                <Link
                  to="/battle"
                  className="w-full h-8 sm:h-8.5 border-2 border-foreground bg-card hover:bg-muted text-foreground flex items-center justify-center gap-1.5 font-bold text-xs uppercase tracking-tight shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform"
                >
                  <Users className="w-3 h-3 text-terra" /> Battle Friends →
                </Link>
              </div>
            </div>

            {/* Direct World Atlas Explorer link + Zero Signup Footnote */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 pt-0.5 text-[10px] sm:text-[10.5px]">
              <Link
                to="/atlas"
                className="font-bold text-foreground hover:text-terra inline-flex items-center gap-1 underline underline-offset-2"
              >
                <Compass className="w-3 h-3 text-forest dark:text-forest" /> Explore World Atlas Map {mastered > 0 ? `(${mastered} Mastered)` : ""} →
              </Link>
              <span className="text-muted-foreground font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                No signup or install required.
              </span>
            </div>
          </div>

          {/* RIGHT: Live Interactive Board Showcase (Disciplined, compact, responsive game preview) */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div className="atlas-card border-2 border-foreground bg-card shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden w-full max-w-[280px] xs:max-w-[310px] sm:max-w-[340px] md:max-w-[360px]">
              {/* Board Header */}
              <div className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-foreground text-background flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                  <span className="font-mono text-[9.5px] sm:text-[10.5px] font-bold uppercase tracking-wider">
                    Interactive Quiz Demo
                  </span>
                </div>
                <span className="font-mono text-[9.5px] sm:text-[10.5px] text-gold font-bold">
                  XP: {demoScore}
                </span>
              </div>

              {/* Board Body */}
              <div className="p-2.5 sm:p-3 space-y-2 sm:space-y-2.5">
                <div className="flex items-center justify-between text-[9.5px] sm:text-[10.5px] text-muted-foreground font-bold uppercase tracking-wider">
                  <span>Flag {demoIdx + 1} of {DEMO_FLAGS.length}</span>
                  <span className="text-terra">{currentFlag.region}</span>
                </div>

                {/* Flag Image Display: Scaled cleanly so it never dominates small screens */}
                <div className="mx-auto w-full max-w-[150px] xs:max-w-[175px] sm:max-w-[200px] aspect-[3/2] border-2 border-foreground bg-muted overflow-hidden shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] relative rounded-xs">
                  <FlagImage
                    code={currentFlag.code}
                    alt={currentFlag.name}
                    className="w-full h-full object-cover"
                  />
                  {demoFeedback && (
                    <div className="absolute inset-0 bg-background/90 backdrop-blur-xs flex items-center justify-center p-1">
                      <span className="font-display text-[10.5px] sm:text-xs font-black text-foreground border-2 border-foreground bg-gold px-2 py-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] animate-bounce text-center">
                        {demoFeedback}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-center font-display font-bold text-[10.5px] sm:text-xs text-foreground">
                  Which nation's flag is this? (Tap to guess):
                </p>

                {/* 4 Compact Choices */}
                <div className="grid grid-cols-2 gap-1.5">
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
                        className={`h-7 sm:h-8 px-1.5 border-2 font-bold text-[10px] sm:text-[11px] uppercase tracking-tight text-left flex items-center justify-between transition-transform active:scale-95 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${btnStyle}`}
                      >
                        <span className="truncate">{option}</span>
                        {demoChosen !== null && isCorrect && (
                          <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0 ml-1" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-1 flex items-center justify-between text-[9.5px] sm:text-[10px] text-muted-foreground font-semibold border-t border-foreground/15">
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

      {/* ── HOW A MATCH / MASTERY PLAYS STRIP ── */}
      <section className="w-full border-y-2 border-foreground bg-foreground text-background py-2.5 sm:py-3.5 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between sm:justify-around gap-y-1.5 gap-x-3 text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wider">
          {STEPS.map((step, i) => (
            <div key={step.step} className="flex items-center gap-1.5">
              <span className="text-gold font-mono font-black">{step.step}</span>
              <span className="text-background">{step.label}</span>
              {i < STEPS.length - 1 && (
                <span className="hidden md:inline text-muted-foreground/60 ml-2">→</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── PLAY WITH FRIENDS & 1v1 MULTIPLAYER ROOMS ── */}
      <section className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-7 sm:pt-10 lg:pt-12">
        <div className="atlas-card p-4 sm:p-7 border-2 border-foreground bg-card shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="max-w-2xl mb-4 sm:mb-6">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 border-2 border-foreground bg-gold/25 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-foreground shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] mb-2">
              <Swords className="w-3.5 h-3.5 text-terra" /> MULTIPLAYER ARENA & ROOM BATTLES
            </div>
            <h2 className="font-display font-black text-foreground tracking-tight text-[clamp(1.35rem,3.8vw,2.25rem)]">
              PLAY WITH FRIENDS IN REAL-TIME.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1 leading-relaxed">
              Challenge friends or classmates to a live flag showdown. Host a private battle room, share the 4-letter code or QR code, and race on identical flags. No signups, no downloads.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5 items-stretch">
            {/* Action 1: Create / Host a Room */}
            <div className="p-3.5 sm:p-4.5 border-2 border-foreground bg-muted/40 flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 border-2 border-foreground rounded-lg flex items-center justify-center bg-card shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] text-foreground">
                    <Crown className="w-4 h-4 text-amber-500" />
                  </span>
                  <span className="text-[9.5px] sm:text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 border border-emerald-500/30 rounded uppercase tracking-wider">
                    You're The Host
                  </span>
                </div>
                <h3 className="font-display font-bold text-sm sm:text-base text-foreground">
                  Create a Private Room
                </h3>
                <p className="text-[11.5px] sm:text-xs text-muted-foreground leading-relaxed">
                  Choose any continent or all 197 countries, set round counts, and receive a shareable 4-letter room code with an instant QR code for friends on phone or laptop.
                </p>
              </div>

              <Link
                to="/battle"
                className="w-full h-9 border-2 border-foreground bg-foreground text-background flex items-center justify-center gap-1.5 font-bold text-xs uppercase tracking-tight shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform"
              >
                <Users className="w-3.5 h-3.5" /> Host a Battle Room →
              </Link>
            </div>

            {/* Action 2: Join with Room Code */}
            <div className="p-3.5 sm:p-4.5 border-2 border-foreground bg-muted/40 flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 border-2 border-foreground rounded-lg flex items-center justify-center bg-card shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] text-foreground">
                    <QrCode className="w-4 h-4 text-forest dark:text-forest" />
                  </span>
                  <span className="text-[9.5px] sm:text-[10px] bg-gold/25 text-foreground font-bold px-2 py-0.5 border border-foreground/30 rounded uppercase tracking-wider">
                    Have A Code?
                  </span>
                </div>
                <h3 className="font-display font-bold text-sm sm:text-base text-foreground">
                  Join a Friend's Room
                </h3>
                <p className="text-[11.5px] sm:text-xs text-muted-foreground leading-relaxed">
                  Enter your friend's 4-letter battle room code to jump straight into their live lobby.
                </p>
              </div>

              <form onSubmit={handleJoinRoom} className="flex gap-2">
                <input
                  type="text"
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value.toUpperCase().slice(0, 4))}
                  placeholder="ABCD"
                  maxLength={4}
                  className="w-24 sm:w-28 h-9 border-2 border-foreground bg-card text-center font-mono font-bold text-sm tracking-[0.25em] focus:outline-none uppercase placeholder:text-muted-foreground/50 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                  aria-label="4-letter room code"
                />
                <button
                  type="submit"
                  disabled={roomInput.trim().length !== 4}
                  className="flex-1 h-9 border-2 border-foreground bg-terra text-white disabled:opacity-40 font-bold text-xs uppercase tracking-tight shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform disabled:hover:translate-y-0 flex items-center justify-center gap-1"
                >
                  Join Room →
                </button>
              </form>
            </div>
          </div>

          {/* Highlights strip */}
          <div className="mt-4 pt-3 border-t border-foreground/15 flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1 text-foreground">
              ⚡ Identical flag deals
            </span>
            <span className="flex items-center gap-1 text-foreground">
              📱 Cross-platform phone & laptop
            </span>
            <span className="flex items-center gap-1 text-foreground">
              🛡️ 100% Free & Peer-to-Peer
            </span>
          </div>
        </div>
      </section>

      {/* ── 6 GAME MODES SHOWCASE (3 cols desktop, 2 cols tablet, 1 col mobile) ── */}
      <section className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12">
        <div className="text-center max-w-2xl mx-auto mb-5 sm:mb-7">
          <div className="inline-flex items-center gap-1 text-[10.5px] sm:text-xs font-black uppercase tracking-widest text-terra mb-1">
            <Trophy className="w-3.5 h-3.5" /> 6 Unique Ways to Train
          </div>
          <h2 className="font-display font-extrabold text-foreground tracking-tight text-[clamp(1.35rem,3.8vw,2.25rem)]">
            BUILT FOR SPEED, MEMORY & COMBAT.
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1 max-w-xl mx-auto">
            Whether you have 45 seconds on the commute or want a deep spaced-repetition study session, FlagAtlas has a mode for you.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-4.5">
          {MODES_LIST.map((mode) => {
            const Icon = mode.icon;
            return (
              <div
                key={mode.path}
                className="atlas-card p-3.5 sm:p-4.5 border-2 border-foreground bg-card shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between group hover:-translate-y-0.5 transition-transform"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 border-2 border-foreground rounded-lg flex items-center justify-center bg-card shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-6 transition-transform">
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground" />
                    </span>
                    <span className="text-[10px] sm:text-[10.5px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 border border-foreground/30 rounded bg-muted">
                      {mode.badge}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-sm sm:text-base text-foreground">
                    {mode.label}
                  </h3>
                  <p className="text-[11.5px] sm:text-xs text-muted-foreground leading-relaxed">
                    {mode.desc}
                  </p>
                </div>

                <Link
                  to={mode.path}
                  className="mt-3.5 inline-flex items-center justify-between w-full border-2 border-foreground bg-card hover:bg-foreground hover:text-background px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-tight shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-colors"
                >
                  <span>Play Mode</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── THE SPACED REPETITION EXPLAINER (Why it works) ── */}
      <section className="w-full border-t-2 border-foreground bg-card/60 py-6 sm:py-10 px-3.5 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="atlas-card p-3.5 sm:p-6 border-2 border-foreground bg-card shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 items-center">
            <div className="md:col-span-2 space-y-1.5 sm:space-y-2">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-terra flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 shrink-0" /> The Science of Memory
              </span>
              <h3 className="font-display font-black text-base sm:text-xl text-foreground leading-snug">
                How FlagAtlas turns your short-term memory into permanent recall.
              </h3>
              <p className="text-[11.5px] sm:text-xs text-muted-foreground leading-relaxed">
                Most quiz games test you once and move on. FlagAtlas runs an adapted 
                <strong> SuperMemo SM-2 algorithm</strong>: every country flag has an ease factor 
                and interval. When you guess right, the interval doubles. When you miss, it resets to tomorrow. 
                3 consecutive correct reviews unlocks <strong>Permanent Mastery</strong>.
              </p>
            </div>
            <div className="text-center p-3 sm:p-3.5 border-2 border-foreground bg-muted/40 rounded-xl space-y-1">
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">
                197
              </div>
              <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Flags to Master
              </div>
              <div className="pt-0.5">
                <Link
                  to="/review"
                  className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold uppercase tracking-tight text-terra hover:underline"
                >
                  <Layers className="w-3 h-3" /> Review Deck →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CALL TO ACTION: Tightened rhythm, deliberate breathing room ── */}
      <section className="w-full py-6 sm:py-10 px-4 text-center">
        <div className="max-w-xl mx-auto space-y-2.5 sm:space-y-3.5">
          <h2 className="font-display font-black text-foreground tracking-tight text-[clamp(1.35rem,4.2vw,2.25rem)]">
            READY TO HUMBLE YOUR GEOGRAPHY?
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-md mx-auto">
            Jump in right now — no email, no password, no app install required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
            <Link
              to="/play/go-berserk"
              className="inline-flex items-center justify-center gap-2 border-2 border-foreground bg-foreground text-background px-4 h-9 sm:h-9.5 w-full sm:w-auto font-bold text-xs uppercase tracking-tight shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform"
            >
              <Play className="w-3 h-3 fill-current" /> Play Go Berserk
            </Link>
            <Link
              to="/atlas"
              className="inline-flex items-center justify-center gap-2 border-2 border-foreground bg-card hover:bg-muted text-foreground px-4 h-9 sm:h-9.5 w-full sm:w-auto font-bold text-xs uppercase tracking-tight shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform"
            >
              <MapPin className="w-3 h-3" /> Explore World Atlas
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
