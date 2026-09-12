import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function ModeShell({ title, region, children }) {
  return (
    <div className="mx-auto max-w-3xl px-3 sm:px-4 py-5 sm:py-6">
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 border-2 border-foreground bg-card px-3 h-9 text-sm font-bold uppercase tracking-tight hover:bg-muted"
        >
          <ArrowLeft className="w-4 h-4" /> Map
        </Link>
        <div className="text-xs font-bold uppercase tracking-tight text-muted-foreground">
          {region ? `${region} · ` : ""}
          {title}
        </div>
      </div>
      {children}
    </div>
  );
}
