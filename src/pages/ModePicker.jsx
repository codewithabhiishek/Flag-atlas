import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Eye, Globe2, Palette, Sparkles, Zap } from "lucide-react";
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
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <Link to="/" className="inline-flex h-10 items-center gap-2 border-2 border-foreground bg-card px-3 text-sm font-bold uppercase tracking-tight hover:bg-muted">
        <ArrowLeft className="h-4 w-4" /> Back to Atlas
      </Link>
      <section className="mt-5 border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-terra">Choose a game</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">Every question in the selected game will use flags from {region || "around the world"}.</p>
        {!region && (
          <Link to="/play/world-quiz" className="mt-5 flex items-center gap-4 border-2 border-foreground bg-violet-500/10 p-4 transition-transform hover:-translate-y-1">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center border-2 border-foreground bg-violet-500/15"><Globe2 className="h-5 w-5" /></span>
            <span><span className="block font-display text-xl font-bold text-foreground">World Quiz</span><span className="mt-0.5 block text-sm text-muted-foreground">A dedicated 20-question quiz drawn randomly from all 197 countries.</span></span>
          </Link>
        )}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MODES.map((mode) => {
            const unavailable = mode.label === "Builder" && region && !BUILDABLE.some((item) => byCode(item.code)?.region === region);
            const Icon = mode.icon;
            if (unavailable) {
              return <div key={mode.path} className="border-2 border-border bg-muted p-5 opacity-65"><Icon className="h-6 w-6" /><h2 className="mt-3 font-display text-xl font-bold">{mode.label}</h2><p className="mt-1 text-sm">No stripe-pattern flags are available for this region yet.</p></div>;
            }
            const destination = `${mode.path}${region ? `?region=${encodeURIComponent(region)}` : ""}`;
            return <Link key={mode.path} to={destination} className={cn("min-h-40 border-2 border-foreground p-5 transition-transform hover:-translate-y-1", mode.accent)}>
              <Icon className="h-6 w-6" />
              <h2 className="mt-3 font-display text-xl font-bold text-foreground">{mode.label}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{mode.description}</p>
            </Link>;
          })}
        </div>
      </section>
    </main>
  );
}
