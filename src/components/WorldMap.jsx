import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { byCode } from "@/data/countries";
import { codeForGeo } from "@/data/geoMap";
import { flagStatus } from "@/lib/derive";
import FlagImage from "@/components/FlagImage";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const FILL = {
  mastered: "hsl(var(--forest))",
  learning: "hsl(var(--terra))",
  locked: "hsl(var(--land))",
  neutral: "hsl(var(--land))",
};

function statusLabel(s) {
  return s === "mastered"
    ? "Mastered"
    : s === "learning"
      ? "In progress"
      : "Not yet learned";
}

export default function WorldMap({ flags }) {
  const navigate = useNavigate();
  const [hoverInfo, setHoverInfo] = useState(null);
  const [hoverGeo, setHoverGeo] = useState(null);
  const tooltipRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });

  function tooltipTransform(x, y) {
    const ttW = 250,
      ttH = 64,
      pad = 14;
    let tx = x + pad;
    let ty = y + pad;
    if (typeof window !== "undefined") {
      if (tx + ttW > window.innerWidth - pad) tx = x - ttW - pad;
      if (ty + ttH > window.innerHeight - pad) ty = y - ttH - pad;
      if (tx < pad) tx = pad;
      if (ty < pad) ty = pad;
    }
    return `translate(${tx}px, ${ty}px)`;
  }

  function place(x, y) {
    pos.current = { x, y };
    if (tooltipRef.current) {
      tooltipRef.current.style.transform = tooltipTransform(x, y);
    }
  }

  useEffect(() => {
    if (hoverInfo && tooltipRef.current) {
      tooltipRef.current.style.transform = tooltipTransform(
        pos.current.x,
        pos.current.y,
      );
    }
  }, [hoverInfo]);

  function fillFor(geo) {
    const code = codeForGeo(geo);
    if (!code) return FILL.neutral;
    return FILL[flagStatus(flags, code)];
  }

  return (
    <div className="relative">
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{ scale: 128 }}
        width={800}
        height={420}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <rect x={0} y={0} width={800} height={420} fill="hsl(var(--ocean))" />
        <Geographies geography={GEO_URL}>
          {({ geographies }) => (
            <>
              {geographies.map((geo) => {
                const code = codeForGeo(geo);
                const name = byCode(code)?.name || geo.properties?.name;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillFor(geo)}
                    stroke="hsl(var(--border))"
                    strokeWidth={0.6}
                    style={{
                      default: {
                        outline: "none",
                        vectorEffect: "non-scaling-stroke",
                      },
                      hover: {
                        outline: "none",
                        vectorEffect: "non-scaling-stroke",
                      },
                      pressed: {
                        outline: "none",
                        vectorEffect: "non-scaling-stroke",
                      },
                    }}
                    className="cursor-pointer"
                    onMouseEnter={(e) => {
                      setHoverGeo(geo);
                      setHoverInfo({ code, name });
                      place(e.clientX, e.clientY);
                    }}
                    onMouseMove={(e) => place(e.clientX, e.clientY)}
                    onMouseLeave={() => {
                      setHoverGeo(null);
                      setHoverInfo(null);
                    }}
                    onClick={() => {
                      if (!code) return;
                      navigate(
                        `/play/fragments?region=${encodeURIComponent(byCode(code).region)}`,
                      );
                    }}
                  />
                );
              })}
              {hoverGeo && (
                <Geography
                  key="__highlight"
                  geography={hoverGeo}
                  fill="none"
                  stroke="hsl(var(--gold))"
                  strokeWidth={2.2}
                  style={{
                    default: {
                      outline: "none",
                      pointerEvents: "none",
                      vectorEffect: "non-scaling-stroke",
                    },
                  }}
                />
              )}
            </>
          )}
        </Geographies>
      </ComposableMap>

      {hoverInfo && (
        <div
          ref={tooltipRef}
          className="fixed top-0 left-0 z-50 pointer-events-none"
          style={{ transform: "translate(0,0)" }}
        >
          <div className="flex items-center gap-2.5 border-2 border-foreground bg-popover px-3 py-2 brutal-shadow">
            {hoverInfo.code && (
              <div className="w-11 h-8 overflow-hidden border border-border shrink-0">
                <FlagImage code={hoverInfo.code} className="w-full h-full" />
              </div>
            )}
            <div className="leading-tight">
              <div className="text-sm font-bold text-foreground">
                {hoverInfo.name}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {hoverInfo.code
                  ? statusLabel(flagStatus(flags, hoverInfo.code))
                  : "Not in atlas"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
