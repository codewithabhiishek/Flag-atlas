import React, { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Moon, Sun, Compass, BarChart3, Layers, Swords } from "lucide-react";
import { useProgress } from "@/lib/ProgressContext";
import { levelProgress, rankFromMastered } from "@/lib/scoring";
import { masteredCount } from "@/lib/derive";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Atlas", icon: Compass },
  { to: "/battle", label: "Battle", icon: Swords },
  { to: "/dashboard", label: "Stats", icon: BarChart3 },
  { to: "/review", label: "Review", icon: Layers },
];

export default function Layout() {
  const { state } = useProgress();
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

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 border-b-2 border-foreground bg-background/90 backdrop-blur">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-2 sm:gap-3">
          <NavLink
            to="/"
            className="flex items-center gap-1.5 font-display font-extrabold text-base sm:text-lg text-foreground tracking-tight"
          >
            <span className="inline-flex w-6 h-6 items-center justify-center border-2 border-foreground bg-terra text-foreground">
              <Compass className="w-3.5 h-3.5" />
            </span>
            <span>
              FLAG<span className="text-terra">ATLAS</span>
            </span>
          </NavLink>
          <nav className="ml-auto flex items-center gap-1">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "px-2 sm:px-3 h-9 inline-flex items-center gap-1.5 border-2 text-sm font-bold uppercase tracking-tight transition-colors",
                    isActive
                      ? "border-foreground bg-foreground text-background"
                      : "border-transparent text-foreground hover:border-foreground hover:bg-muted",
                  )
                }
              >
                <n.icon className="w-4 h-4" />
                <span className="hidden md:inline">{n.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="hidden lg:flex items-center gap-3 pl-3 ml-1 border-l-2 border-foreground">
            <div className="text-right leading-tight">
              <div className="text-xs font-bold uppercase">{rank.title}</div>
              <div className="text-xs text-muted-foreground">
                Lvl {lp.level} · 🔥 {state.streak}d
              </div>
            </div>
            <button
              onClick={() => setDark((d) => !d)}
              className="w-9 h-9 border-2 border-foreground inline-flex items-center justify-center hover:bg-muted"
              aria-label="Toggle theme"
            >
              {dark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </div>
          <button
            onClick={() => setDark((d) => !d)}
            className="lg:hidden w-9 h-9 border-2 border-foreground inline-flex items-center justify-center"
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
        <div className="w-full px-4 sm:px-6 lg:px-8 pb-2 lg:hidden">
          <div className="h-2 border-2 border-foreground bg-background overflow-hidden">
            <div className="h-full bg-forest" style={{ width: `${lp.pct}%` }} />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t-2 border-foreground py-4 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
        FlagAtlas · learn the world, one flag at a time
      </footer>
    </div>
  );
}
