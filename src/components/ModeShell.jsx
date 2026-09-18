import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";
import { useProgress } from "@/lib/ProgressContext";
import { masteredCount } from "@/lib/derive";

export default function ModeShell({ title, region, children }) {
  const { state } = useProgress();
  const mastered = masteredCount(state.flags);

  return (
    <div className="mx-auto max-w-3xl px-3 sm:px-4 py-5 sm:py-6">
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <Link
          to="/play"
          className="inline-flex items-center gap-1.5 border-2 border-foreground bg-card px-3 h-9 text-sm font-bold uppercase tracking-tight hover:bg-muted shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[1.5px_1.5px_0px_0px_rgba(255,255,255,0.2)] transition-transform active:translate-y-0 hover:-translate-y-0.5"
        >
          <ArrowLeft className="w-4 h-4" /> Modes
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/atlas"
            className="inline-flex items-center gap-1.5 border-2 border-foreground/30 bg-card hover:bg-muted px-2.5 h-8 text-xs font-bold uppercase tracking-tight transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.2)]"
            title="Atlas progress — view World Atlas"
          >
            <Compass className="w-3.5 h-3.5 text-forest" />
            <span className="text-[10px] text-muted-foreground hidden xs:inline">Atlas</span>
            <span>{mastered} / 197</span>
          </Link>
          <div className="text-xs font-bold uppercase tracking-tight text-muted-foreground hidden sm:block">
            {region ? `${region} · ` : ""}
            {title}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
