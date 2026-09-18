import React, { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, Link } from "react-router-dom";
import { Moon, Sun, Compass, BarChart3, Layers, Swords, Flame, Sparkles, Menu, X, Play, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useProgress } from "@/lib/ProgressContext";
import { levelProgress, rankFromMastered } from "@/lib/scoring";
import { masteredCount } from "@/lib/derive";
import { cn } from "@/lib/utils";
import { useUiClickSounds } from "@/hooks/use-ui-click-sounds";
import { useGsapScrollProgress } from "@/lib/gsapScroll";
import { FeedbackButton } from "@/components/FeedbackLauncher";

const NAV = [
  { to: "/atlas", label: "Atlas", icon: Compass },
  { to: "/play", label: "Modes", icon: Sparkles },
  { to: "/battle", label: "Battle", icon: Swords },
  { to: "/dashboard", label: "Stats", icon: BarChart3 },
  { to: "/review", label: "Review", icon: Layers },
];

export default function Layout() {
  const { state } = useProgress();
  const location = useLocation();
  const scrollProgressRef = useRef(null);
  useUiClickSounds();
  useGsapScrollProgress(scrollProgressRef, `${location.pathname}${location.search}`);
  const [dark, setDark] = useState(
    () =>
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark"),
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lp = levelProgress(state.xp);
  const rank = rankFromMastered(masteredCount(state.flags));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem("flagatlas.theme", dark ? "dark" : "light");
    } catch (e) {}
  }, [dark]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const triggerStreakConfetti = (e) => {
    e.stopPropagation();
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.15, x: 0.85 },
      colors: ["#F59E0B", "#10B981", "#3B82F6", "#EF4444"],
    });
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-gold selection:text-foreground">
      <header className="sticky top-0 z-30 border-b-2 border-foreground bg-background/95 backdrop-blur-md transition-colors duration-300">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-12 sm:h-14 flex items-center justify-between gap-2">
          {/* Brand Logo */}
          <NavLink
            to="/"
            className="group flex items-center gap-1.5 sm:gap-2 font-display font-black text-sm sm:text-base md:text-lg text-foreground tracking-tight shrink-0"
          >
            <motion.span
              whileHover={{ rotate: 90, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="inline-flex w-6 h-6 sm:w-7 sm:h-7 items-center justify-center border-2 border-foreground bg-terra text-foreground shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]"
            >
              <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </motion.span>
            <span className="tracking-tight">
              FLAG<span className="text-terra">ATLAS</span>
            </span>
          </NavLink>

          {/* Route-conditional Navigation */}
          {location.pathname === "/" ? (
            /* ─────────────────────────────────────────────────────────────
               LANDING PAGE HEADER: Minimal Marketing Navigation
               Left: Logo | Center: How It Works & Experiences | Right: Theme, Feedback, PLAY NOW
            ───────────────────────────────────────────────────────────── */
            <>
              <nav className="hidden md:flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <a
                  href="#how-it-works"
                  className="hover:text-foreground transition-colors px-1 py-1"
                >
                  How It Works
                </a>
                <a
                  href="#experiences"
                  className="hover:text-foreground transition-colors px-1 py-1"
                >
                  Experiences
                </a>
              </nav>

              {/* Landing Right Controls: Desktop */}
              <div className="hidden md:flex items-center gap-2.5">
                <motion.button
                  whileTap={{ scale: 0.9, rotate: 180 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setDark((d) => !d)}
                  className="w-9 h-9 border-2 border-foreground inline-flex items-center justify-center hover:bg-muted bg-card shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)] transition-colors shrink-0"
                  aria-label="Toggle theme"
                >
                  {dark ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-foreground" />
                  )}
                </motion.button>

                <FeedbackButton className="h-9 px-3.5 inline-flex items-center gap-1.5 border-2 border-foreground bg-card hover:bg-muted text-foreground text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)] transition-all shrink-0" />

                <Link
                  to="/play"
                  className="h-9 px-4 sm:px-5 inline-flex items-center gap-1.5 border-2 border-foreground bg-terra hover:bg-terra/90 text-white text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all shrink-0"
                >
                  <span>Play Now</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </Link>
              </div>

              {/* Landing Right Controls: Mobile (< md) */}
              <div className="flex md:hidden items-center gap-2">
                <button
                  onClick={() => setDark((d) => !d)}
                  className="w-8 h-8 border-2 border-foreground inline-flex items-center justify-center shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] bg-card shrink-0"
                  aria-label="Toggle theme"
                >
                  {dark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-foreground" />}
                </button>

                <FeedbackButton className="h-8 px-2.5 inline-flex items-center gap-1 border-2 border-foreground bg-card text-foreground text-[11px] font-bold uppercase tracking-tight shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] shrink-0" />

                <Link
                  to="/play"
                  className="h-8 px-3 border-2 border-foreground bg-terra text-white inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] shrink-0"
                >
                  <span>Play</span>
                  <ArrowRight className="w-3 h-3 ml-0.5" />
                </Link>
              </div>
            </>
          ) : (
            /* ─────────────────────────────────────────────────────────────
               APPLICATION HEADER: Application Navigation (Atlas, Modes, Battle, Stats, Review)
            ───────────────────────────────────────────────────────────── */
            <>
              {/* Desktop Navigation (>= md) */}
              <nav className="hidden md:flex items-center gap-1 sm:gap-1.5 py-0.5">
                {NAV.map((n) => (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    className={({ isActive }) =>
                      cn(
                        "px-2 sm:px-2.5 h-8 sm:h-8.5 inline-flex items-center gap-1 sm:gap-1.5 border-2 text-xs font-bold uppercase tracking-tight transition-all shrink-0",
                        isActive
                          ? "border-foreground bg-foreground text-background shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[1.5px_1.5px_0px_0px_rgba(255,255,255,0.3)]"
                          : "border-transparent text-foreground hover:border-foreground hover:bg-muted/80",
                      )
                    }
                  >
                    <n.icon className="w-3.5 h-3.5" />
                    <span>{n.label}</span>
                  </NavLink>
                ))}
              </nav>

              {/* Desktop User Level / Streak & Theme & Feedback (Harmonious group) */}
              <div className="hidden lg:flex items-center gap-2.5 pl-3 border-l-2 border-foreground">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  onClick={triggerStreakConfetti}
                  className="text-right leading-tight cursor-pointer select-none group mr-1"
                  title="Click for celebratory sparks!"
                >
                  <div className="text-xs font-bold uppercase flex items-center justify-end gap-1 group-hover:text-terra transition-colors">
                    <Sparkles className="w-3 h-3 text-gold animate-pulse" />
                    {rank.title}
                  </div>
                  <div className="text-xs text-muted-foreground font-semibold flex items-center justify-end gap-1">
                    <span>Lvl {lp.level}</span>
                    <span>·</span>
                    <span className="inline-flex items-center text-amber-600 dark:text-amber-400">
                      <Flame className="w-3 h-3 animate-bounce" />
                      {state.streak}d streak
                    </span>
                  </div>
                </motion.div>

                <motion.button
                  whileTap={{ scale: 0.9, rotate: 180 }}
                  whileHover={{ scale: 1.08 }}
                  onClick={() => setDark((d) => !d)}
                  className="w-8 h-8 sm:w-9 sm:h-9 border-2 border-foreground inline-flex items-center justify-center hover:bg-muted shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)] transition-colors"
                  aria-label="Toggle theme"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {dark ? (
                      <motion.div
                        key="sun"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Sun className="w-4 h-4 text-amber-400" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="moon"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Moon className="w-4 h-4 text-foreground" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>

                <FeedbackButton className="h-8 sm:h-9 px-2.5 inline-flex items-center gap-1.5 border-2 border-foreground bg-card hover:bg-muted text-foreground transition-all text-xs font-bold uppercase tracking-tight shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)]" />
              </div>

              {/* Mobile Right Controls (< md) */}
              <div className="flex md:hidden items-center gap-1.5">
                <Link
                  to="/play"
                  className="h-8 px-2.5 border-2 border-foreground bg-terra text-white inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-tight shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform"
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>Play</span>
                </Link>

                <button
                  onClick={() => setDark((d) => !d)}
                  className="w-8 h-8 border-2 border-foreground inline-flex items-center justify-center shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] bg-card"
                  aria-label="Toggle theme"
                >
                  {dark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-foreground" />}
                </button>

                <button
                  onClick={() => setMobileMenuOpen((o) => !o)}
                  className={cn(
                    "w-7.5 h-7.5 border-2 border-foreground inline-flex items-center justify-center shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] transition-colors",
                    mobileMenuOpen ? "bg-foreground text-background" : "bg-card text-foreground",
                  )}
                  aria-label="Open navigation menu"
                  aria-expanded={mobileMenuOpen}
                >
                  {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mobile Dropdown Panel (Only on App routes) */}
        <AnimatePresence>
          {location.pathname !== "/" && mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="md:hidden border-t-2 border-foreground bg-background px-3.5 py-3 overflow-hidden shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]"
            >
              <div className="grid grid-cols-2 gap-2">
                {NAV.map((n) => (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "h-8 px-2.5 border-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-tight transition-all",
                        isActive
                          ? "border-foreground bg-foreground text-background shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]"
                          : "border-foreground bg-card text-foreground hover:bg-muted",
                      )
                    }
                  >
                    <n.icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{n.label}</span>
                  </NavLink>
                ))}
                <div className="col-span-2 pt-1 border-t border-foreground/15 flex items-center justify-between">
                  <div className="text-[10px] text-muted-foreground font-bold uppercase">
                    Level {lp.level} · {state.streak}d streak
                  </div>
                  <FeedbackButton className="h-7 px-2 inline-flex items-center gap-1.5 border-2 border-foreground bg-card text-foreground text-[10px] font-bold uppercase tracking-tight shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full px-3 sm:px-6 lg:px-8 pb-1.5" aria-hidden="true">
          <div className="h-1.5 sm:h-2 border-2 border-foreground bg-background overflow-hidden relative">
            <div
              ref={scrollProgressRef}
              className="h-full w-full bg-forest relative overflow-hidden"
            >
              <div className="absolute inset-0 shimmer-progress" />
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t-2 border-foreground bg-background/80 px-3.5 py-4 text-center backdrop-blur sm:px-8 sm:py-5">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-1.5 text-muted-foreground">
          <p className="text-[10.5px] sm:text-xs font-bold uppercase leading-relaxed tracking-wider">
            FlagAtlas · explore the world, master every flag
          </p>
          <p className="text-[10px] sm:text-[11px] font-bold uppercase leading-relaxed tracking-wider">
            🌍 197 countries to master
          </p>
          <p className="pt-0.5 text-[10.5px] sm:text-xs font-medium normal-case leading-relaxed">
            <a
              href="https://abhiishek.is-a.dev/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-foreground underline decoration-terra/70 underline-offset-4 transition-colors hover:text-terra focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Built by Abhishek
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
