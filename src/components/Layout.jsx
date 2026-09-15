import React, { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Moon, Sun, Compass, BarChart3, Layers, Swords, Flame, Sparkles } from "lucide-react";
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
  const lp = levelProgress(state.xp);
  const rank = rankFromMastered(masteredCount(state.flags));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem("flagatlas.theme", dark ? "dark" : "light");
    } catch (e) {}
  }, [dark]);

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
      <header className="sticky top-0 z-30 border-b-2 border-foreground bg-background/90 backdrop-blur-md transition-colors duration-300">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-2.5 sm:gap-3">
          <NavLink
            to="/"
            className="group flex items-center gap-2 font-display font-extrabold text-base sm:text-lg text-foreground tracking-tight"
          >
            <motion.span
              whileHover={{ rotate: 90, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="inline-flex w-7 h-7 items-center justify-center border-2 border-foreground bg-terra text-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]"
            >
              <Compass className="w-4 h-4 text-white" />
            </motion.span>
            <span className="group-hover:tracking-wider transition-all duration-300">
              FLAG<span className="text-terra">ATLAS</span>
            </span>
          </NavLink>

          <nav className="ml-auto flex items-center gap-1.5">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "relative px-2.5 sm:px-3 h-9 inline-flex items-center gap-1.5 border-2 text-sm font-bold uppercase tracking-tight transition-all duration-200",
                    isActive
                      ? "border-foreground bg-foreground text-background shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)]"
                      : "border-transparent text-foreground hover:border-foreground hover:bg-muted/80 hover:-translate-y-0.5",
                  )
                }
              >
                <n.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span className="hidden md:inline">{n.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3 pl-3 ml-2 border-l-2 border-foreground">
            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={triggerStreakConfetti}
              className="text-right leading-tight cursor-pointer select-none group"
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
              className="w-9 h-9 border-2 border-foreground inline-flex items-center justify-center hover:bg-muted shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)] transition-colors"
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
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-4 h-4 text-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          <FeedbackButton className="h-9 px-2.5 sm:px-3 inline-flex items-center gap-1.5 border-2 border-transparent text-foreground hover:border-foreground hover:bg-muted/80 transition-all text-sm font-bold uppercase tracking-tight" />

          <button
            onClick={() => setDark((d) => !d)}
            className="lg:hidden w-9 h-9 border-2 border-foreground inline-flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]"
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        <div className="w-full px-4 pb-2 sm:px-6 lg:px-8" aria-hidden="true">
          <div className="h-2 border-2 border-foreground bg-background overflow-hidden relative">
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
      <footer className="border-t-2 border-foreground bg-background/80 px-5 py-5 text-center backdrop-blur sm:px-8 sm:py-6">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-2 text-muted-foreground">
          <p className="text-xs font-bold uppercase leading-relaxed tracking-[0.14em] sm:tracking-widest">
            FlagAtlas · explore the world, master every flag
          </p>
          <p className="text-[11px] font-bold uppercase leading-relaxed tracking-[0.14em] sm:tracking-widest">
            🌍 197 countries to master
          </p>
          <p className="pt-1 text-xs font-medium normal-case leading-relaxed">
            <a
              href="https://abhiishek.is-a.dev/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-foreground underline decoration-terra/70 underline-offset-4 transition-colors hover:text-terra focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Built by Abhishek
            </a>{" "}
            · To humble your geography.
          </p>
        </div>
      </footer>
    </div>
  );
}
