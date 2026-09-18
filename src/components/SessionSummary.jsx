import { Link } from "react-router-dom";
import { Trophy } from "lucide-react";
import ModeShell from "@/components/ModeShell";
import { FeedbackInvite } from "@/components/FeedbackLauncher";
import { formatElapsedTime } from "@/hooks/use-elapsed-timer";

export default function SessionSummary({ correct, total, xp, timeMs, onAgain, extra = null }) {
  return (
    <ModeShell title="Summary">
      <div className="atlas-card grid-paper p-8 text-center">
        <div className="inline-flex w-14 h-14 border-2 border-foreground bg-gold items-center justify-center mb-4 brutal-shadow">
          <Trophy className="w-7 h-7 text-foreground" />
        </div>
        <h2 className="font-display text-3xl sm:text-4xl text-foreground">
          Round complete
        </h2>
        <p className="text-muted-foreground mt-2 font-medium">
          {correct} / {total} correct · +{xp} XP
        </p>
        {typeof timeMs === "number" && (
          <p className="mt-1 text-sm font-semibold text-terra">Time · {formatElapsedTime(timeMs)}</p>
        )}
        {extra}
        <div className="flex flex-wrap gap-2 justify-center mt-6">
          <Link
            to="/atlas"
            className="inline-flex items-center border-2 border-foreground bg-card px-4 h-10 text-sm font-bold uppercase tracking-tight hover:bg-muted shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]"
          >
            Back to Atlas
          </Link>
          <button
            onClick={onAgain}
            className="inline-flex items-center border-2 border-foreground bg-foreground text-background px-4 h-10 text-sm font-bold uppercase tracking-tight hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform"
          >
            Play again
          </button>
        </div>
      </div>

      {/* End-of-session feedback invitation — same pattern as Word Rush */}
      <div className="mt-4 max-w-md mx-auto">
        <FeedbackInvite />
      </div>
    </ModeShell>
  );
}
