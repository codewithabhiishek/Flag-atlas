import { Link, useLocation } from "react-router-dom";
import { Compass } from "lucide-react";

export default function PageNotFound() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="text-center max-w-sm">
        <div className="inline-flex w-16 h-16 border-2 border-foreground bg-terra items-center justify-center mb-6 brutal-shadow">
          <Compass className="w-8 h-8 text-foreground" aria-hidden="true" />
        </div>
        <h1 className="font-display text-7xl text-foreground mb-2">404</h1>
        <h2 className="font-display text-2xl text-foreground mb-3">
          Off the map
        </h2>
        <p className="text-muted-foreground font-medium mb-8">
          <span className="font-bold text-foreground">{path}</span> isn't a
          known route. Let's get you back to the atlas.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 border-2 border-foreground bg-foreground text-background px-5 h-11 font-bold uppercase text-sm tracking-tight hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Compass className="w-4 h-4" aria-hidden="true" />
          Back to Atlas
        </Link>
      </div>
    </div>
  );
}
