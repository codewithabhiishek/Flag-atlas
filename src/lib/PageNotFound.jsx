import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Compass, ArrowRight } from "lucide-react";

export default function PageNotFound() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const [secondsLeft, setSecondsLeft] = useState(4);

  useEffect(() => {
    if (secondsLeft <= 0) {
      navigate("/atlas", { replace: true });
      return;
    }
    const timer = setTimeout(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, navigate]);

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
        <p className="text-muted-foreground font-medium mb-4">
          <span className="font-bold text-foreground">{path}</span> isn't a
          known route. Taking you to the World Atlas in {secondsLeft}s...
        </p>
        <div className="flex flex-col gap-3 items-center">
          <Link
            to="/atlas"
            className="inline-flex items-center gap-2 border-2 border-foreground bg-foreground text-background px-5 h-11 font-bold uppercase text-sm tracking-tight hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]"
          >
            <Compass className="w-4 h-4 text-gold" aria-hidden="true" />
            Back to World Atlas
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>

          <Link
            to="/"
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors pt-2"
          >
            Visit Landing Page Instead →
          </Link>
        </div>
      </div>
    </div>
  );
}
