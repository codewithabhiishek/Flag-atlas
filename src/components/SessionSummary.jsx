import { Link } from "react-router-dom";
import { Trophy } from "lucide-react";
import ModeShell from "@/components/ModeShell";

export default function SessionSummary({ correct, total, xp, onAgain, extra }) {
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
        {extra}
        <div className="flex flex-wrap gap-2 justify-center mt-6">
          <Link
            to="/"
            className="inline-flex items-center border-2 border-foreground bg-card px-4 h-10 text-sm font-bold uppercase tracking-tight hover:bg-muted"
          >
            Back to map
          </Link>
          <button
            onClick={onAgain}
            className="inline-flex items-center border-2 border-foreground bg-foreground text-background px-4 h-10 text-sm font-bold uppercase tracking-tight hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform"
          >
            Play again
          </button>
        </div>
      </div>
    </ModeShell>
  );
}
