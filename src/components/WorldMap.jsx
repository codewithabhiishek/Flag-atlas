import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { byCode } from "@/data/countries";
import { codeForGeo } from "@/data/geoMap";
import { flagStatus } from "@/lib/derive";
import FlagImage from "@/components/FlagImage";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X } from "lucide-react";

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
    ? "Mastered ✓"
    : s === "learning"
      ? "In progress"
      : "Not yet learned";
}

function statusColor(s) {
  return s === "mastered"
    ? "text-emerald-600 dark:text-emerald-400"
    : s === "learning"
      ? "text-amber-600 dark:text-amber-400"
      : "text-muted-foreground";
}

// Detect if the primary input is touch (coarse pointer = finger)
function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

export default function WorldMap({ flags }) {
  const navigate = useNavigate();
  const [hoverInfo, setHoverInfo] = useState(null);
  const [hoverGeo, setHoverGeo] = useState(null);
  // Touch-specific: tapped country panel (shown below the map on mobile)
  const [tapInfo, setTapInfo] = useState(null);
  const [tapGeo, setTapGeo] = useState(null);

  const tooltipRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const isTouch = useRef(isTouchDevice());

  function tooltipTransform(x, y) {
    const ttW = 260,
      ttH = 70,
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

  // Highlight geo: whichever is active (hover on desktop, tap on mobile)
  const activeGeo = hoverGeo || tapGeo;

  function handleTap(geo, code, name) {
    // If tapping the same country, navigate like a desktop click
    if (tapInfo && tapInfo.code === code) {
      if (!code) return;
      const country = byCode(code);
      if (!country) return;
      navigate(`/play/fragments?region=${encodeURIComponent(country.region)}`);
      setTapInfo(null);
      setTapGeo(null);
      return;
    }
    // First tap: show info panel
    setTapGeo(geo);
    setTapInfo({ code, name });
  }

  return (
    <div className="relative w-full overflow-hidden flex flex-col items-center justify-center bg-ocean py-2 sm:py-4">
      <div className="w-full max-w-4xl mx-auto px-2 sm:px-4">
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: 130 }}
          width={800}
          height={410}
          style={{
            width: "100%",
            maxHeight: "350px",
            height: "auto",
            display: "block",
            margin: "0 auto",
          }}
        >
          <rect x={0} y={0} width={800} height={410} fill="hsl(var(--ocean))" />
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
                          fill: "hsl(var(--terra))",
                        },
                      }}
                      className="cursor-pointer"
                      // ── Desktop hover ──
                      onMouseEnter={(e) => {
                        if (isTouch.current) return;
                        setHoverGeo(geo);
                        setHoverInfo({ code, name });
                        place(e.clientX, e.clientY);
                      }}
                      onMouseMove={(e) => {
                        if (isTouch.current) return;
                        place(e.clientX, e.clientY);
                      }}
                      onMouseLeave={() => {
                        if (isTouch.current) return;
                        setHoverGeo(null);
                        setHoverInfo(null);
                      }}
                      onClick={() => {
                        // Desktop: navigate immediately on click
                        if (isTouch.current) return;
                        if (!code) return;
                        const country = byCode(code);
                        if (!country) return;
                        navigate(
                          `/play/fragments?region=${encodeURIComponent(country.region)}`,
                        );
                      }}
                      // ── Mobile tap ──
                      onTouchStart={(e) => {
                        isTouch.current = true;
                        e.stopPropagation();
                        handleTap(geo, code, name);
                      }}
                    />
                  );
                })}
                {/* Highlight overlay for active country */}
                {activeGeo && (
                  <Geography
                    key="__highlight"
                    geography={activeGeo}
                    fill="none"
                    stroke="hsl(var(--gold))"
                    strokeWidth={2.4}
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
      </div>

      {/* ── Desktop tooltip (mouse hover) ── */}
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

      {/* ── Mobile tap info panel (shown below the map) ── */}
      <AnimatePresence>
        {tapInfo && (
          <motion.div
            key="tap-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="w-full max-w-4xl mx-auto px-2 sm:px-4 sm:hidden"
          >
            <div className="flex items-center gap-3 border-2 border-foreground bg-popover px-3 py-2.5 mx-2 brutal-shadow">
              {tapInfo.code && (
                <div className="w-12 h-8 overflow-hidden border border-border shrink-0 rounded-sm">
                  <FlagImage code={tapInfo.code} className="w-full h-full" />
                </div>
              )}
              <div className="flex-1 leading-tight min-w-0">
                <div className="text-sm font-bold text-foreground truncate">
                  {tapInfo.name}
                </div>
                <div
                  className={`text-[11px] font-semibold ${tapInfo.code ? statusColor(flagStatus(flags, tapInfo.code)) : "text-muted-foreground"}`}
                >
                  {tapInfo.code
                    ? statusLabel(flagStatus(flags, tapInfo.code))
                    : "Not in atlas"}
                </div>
              </div>
              {/* Tap again = navigate hint */}
              <button
                onTouchStart={(e) => {
                  e.stopPropagation();
                  if (!tapInfo.code) return;
                  const country = byCode(tapInfo.code);
                  if (!country) return;
                  navigate(
                    `/play/fragments?region=${encodeURIComponent(country.region)}`,
                  );
                  setTapInfo(null);
                  setTapGeo(null);
                }}
                className="flex items-center gap-1 bg-foreground text-background text-xs font-bold px-2.5 py-1.5 rounded shrink-0"
              >
                Play <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onTouchStart={(e) => {
                  e.stopPropagation();
                  setTapInfo(null);
                  setTapGeo(null);
                }}
                className="p-1 text-muted-foreground"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-center text-[10px] text-muted-foreground mt-1 opacity-70">
              Tap again on the map or press Play to start this region
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
