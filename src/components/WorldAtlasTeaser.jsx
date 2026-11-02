import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Compass } from "lucide-react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function WorldAtlasTeaser() {
  return (
    <div className="border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.25)] overflow-hidden">
      {/* Map header bar */}
      <div className="h-8 px-3.5 bg-foreground text-background flex items-center gap-2">
        <Compass className="w-3 h-3 text-gold" />
        <span className="font-mono text-[11px] font-bold uppercase tracking-wider">
          World Atlas
        </span>
      </div>
      {/* Map body */}
      <div
        className="relative w-full"
        style={{ aspectRatio: "1.8 / 1" }}
      >
        <ComposableMap
          projection="geoNaturalEarth1"
          style={{ width: "100%", height: "100%" }}
          projectionConfig={{ scale: 145, center: [0, 10] }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: {
                      fill: "hsl(var(--land, 220 14% 80%))",
                      stroke: "hsl(var(--background))",
                      strokeWidth: 0.4,
                      outline: "none",
                    },
                    hover: {
                      fill: "hsl(var(--terra))",
                      stroke: "hsl(var(--background))",
                      strokeWidth: 0.4,
                      outline: "none",
                    },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>
        </ComposableMap>
        {/* Overlay: subtle teaser message */}
        <div className="absolute bottom-0 left-0 right-0 px-3.5 py-2.5 bg-gradient-to-t from-card/90 to-transparent flex items-end justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Your atlas fills up as you learn
          </span>
          <Link
            to="/atlas"
            className="text-[10px] font-black uppercase tracking-wider text-terra hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            Open Atlas <ArrowRight className="w-2.5 h-2.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
