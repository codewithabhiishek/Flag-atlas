import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Eye, Globe2, Palette, Sparkles, Zap, BookOpen } from "lucide-react";
import { BUILDABLE } from "@/data/buildableFlags";
import { byCode } from "@/data/countries";
import { cn } from "@/lib/utils";

const MODES = [
  { path: "/play/fragments", label: "Fragments", description: "Guess a blurred flag before your misses run out.", icon: Sparkles, accent: "border-emerald-500/40 bg-emerald-500/10" },
  { path: "/play/speed", label: "Speed Run", description: "Answer as many flags as you can in 45 seconds.", icon: Zap, accent: "border-amber-500/40 bg-amber-500/10" },
  { path: "/play/recall", label: "Recall", description: "Picture the flag in your mind, then reveal it.", icon: Eye, accent: "border-sky-500/40 bg-sky-500/10" },
  { path: "/play/builder", label: "Builder", description: "Rebuild a flag by selecting its colours in order.", icon: Palette, accent: "border-rose-500/40 bg-rose-500/10" },
];

export default function ModePicker() {
  const [searchParams] = useSearchParams();
  const region = searchParams.get("region") || "";
  const title = region || "World";

  return (
    <main className="mx-auto w-full max-w-4xl px-3 py-3 sm:px-6 sm:py-8">
      <Link to="/atlas" className="inline-flex h-8 sm:h-10 items-center gap-1.5 sm:gap-2 border-2 border-foreground bg-card px-2.5 sm:px-3 text-xs sm:text-sm font-bold uppercase tracking-tight hover:bg-muted shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]">
        <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Back to Atlas
      </Link>
      <section className="mt-3 sm:mt-5 border-2 border-foreground bg-card p-3.5 sm:p-7 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-terra">Choose a game</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-foreground sm:text-4xl">{title}</h1>
        <p className="mt-1 max-w-xl text-xs text-muted-foreground sm:text-sm">Every question uses flags from {region || "around the world"}.</p>
        
        <Link
          to={`/learn${region ? `?region=${encodeURIComponent(region)}` : ""}`}
          className="mt-3 flex items-center justify-between gap-2.5 sm:gap-4 border-2 border-foreground bg-emerald-500/10 p-2.5 sm:p-4 transition-transform hover:-translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <span className="inline-flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center border-2 border-foreground bg-emerald-500/20 text-emerald-900 dark:text-emerald-100">
              <BookOpen className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <span className="block font-display text-sm sm:text-base font-bold text-foreground truncate">
                Study {region ? region : "All Countries"} First
              </span>
              <span className="block text-[11px] sm:text-xs text-muted-foreground line-clamp-1 sm:line-clamp-none">
                Flip through flashcards and capitals at your own pace.
              </span>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-foreground" />
        </Link>
        {!region && (
          <Link to="/play/go-berserk" className="mt-2.5 sm:mt-3.5 flex items-center justify-between gap-2.5 sm:gap-4 border-2 border-foreground bg-violet-500/10 p-2.5 sm:p-4 transition-transform hover:-translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <span className="inline-flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center border-2 border-foreground bg-violet-500/15"><Globe2 className="h-4 w-4 sm:h-5 sm:w-5" /></span>
              <div className="min-w-0">
                <span className="block font-display text-sm sm:text-xl font-bold text-foreground">Go Berserk</span>
                <span className="block text-[11px] sm:text-sm text-muted-foreground line-clamp-1 sm:line-clamp-none">All 197 countries in one randomized run.</span>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-foreground" />
          </Link>
        )}
        <div className="mt-3 sm:mt-5 grid grid-cols-2 gap-2 sm:gap-3">
          {MODES.map((mode) => {
            const unavailable = mode.label === "Builder" && region && !BUILDABLE.some((item) => byCode(item.code)?.region === region);
            const Icon = mode.icon;
            if (unavailable) {
              return <div key={mode.path} className="border-2 border-border bg-muted p-2.5 sm:p-5 opacity-65 sm:min-h-36"><Icon className="h-4 w-4 sm:h-6 sm:w-6" /><h2 className="mt-1.5 font-display text-sm sm:text-xl font-bold sm:mt-3">{mode.label}</h2><p className="mt-0.5 text-[11px] sm:text-sm leading-snug">Unavailable for this region.</p></div>;
            }
            const destination = `${mode.path}${region ? `?region=${encodeURIComponent(region)}` : ""}`;
            return <Link key={mode.path} to={destination} className={cn("group flex min-h-0 flex-col border-2 border-foreground p-2.5 sm:p-5 transition-transform hover:-translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:min-h-36", mode.accent)}>
              <div className="flex items-center justify-between">
                <Icon className="h-4 w-4 sm:h-6 sm:w-6" />
                <ArrowRight className="h-3.5 w-3.5 sm:hidden transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </div>
              <h2 className="mt-1.5 font-display text-sm sm:text-xl font-bold text-foreground sm:mt-3">{mode.label}</h2>
              <p className="mt-0.5 text-[11px] sm:text-sm text-muted-foreground leading-snug line-clamp-2 sm:line-clamp-none">{mode.description}</p>
              <ArrowRight className="hidden sm:block mt-auto pt-2 h-4 w-4 self-end transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>;
          })}
        </div>
      </section>
    </main>
  );
}
