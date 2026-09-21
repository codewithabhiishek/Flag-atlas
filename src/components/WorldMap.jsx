import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { byCode } from "@/data/countries";
import { codeForGeo } from "@/data/geoMap";
import { flagStatus } from "@/lib/derive";
import { computeWorldMapLayout } from "@/lib/worldMapProjection";
import { playUiSound } from "@/lib/sounds";
import { useSize } from "@/hooks/use-size";
import FlagImage from "@/components/FlagImage";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

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
      ? "Learning"
      : "Not studied";
}

function statusColor(s) {
  return s === "mastered"
    ? "text-emerald-600 dark:text-emerald-400"
    : s === "learning"
      ? "text-amber-600 dark:text-amber-400"
      : "text-muted-foreground";
}

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

function getTooltipPosition(clientX, clientY) {
  if (typeof window === "undefined") return { left: -9999, top: -9999 };
  const pad = 16;
  const tipWidth = 245;
  const tipHeight = 92;

  let left = clientX + 16;
  let top = clientY - 14;

  if (left + tipWidth > window.innerWidth - pad) {
    left = clientX - tipWidth - 16;
  }
  if (top + tipHeight > window.innerHeight - pad) {
    top = clientY - tipHeight - 10;
  }
  left = Math.max(pad, left);
  top = Math.max(pad, top);

  return { left, top };
}

export default function WorldMap({ flags, onSelectRegion }) {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const containerSize = useSize(containerRef);
  const [geoData, setGeoData] = useState(null);
  const [mapLoadFailed, setMapLoadFailed] = useState(false);

  const [hoverInfo, setHoverInfo] = useState(null);
  const [hoverGeo, setHoverGeo] = useState(null);
  const [tapInfo, setTapInfo] = useState(null);
  const [tapGeo, setTapGeo] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState(null);

  const tooltipRef = useRef(null);
  const isTouch = useRef(isTouchDevice());

  // High-performance pointer tracking via rAF — updates DOM directly without re-rendering the 170+ SVG countries
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId = null;
    const handlePointerMove = (e) => {
      if (isTouch.current || !tooltipRef.current) return;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (!tooltipRef.current) return;
        const pos = getTooltipPosition(e.clientX, e.clientY);
        tooltipRef.current.style.left = `${pos.left}px`;
        tooltipRef.current.style.top = `${pos.top}px`;
      });
    };

    container.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      container.removeEventListener("pointermove", handlePointerMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(GEO_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Map data request failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setGeoData(data);
      })
      .catch(() => {
        if (!cancelled) setMapLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const layout = useMemo(() => {
    if (!containerSize?.width || !geoData) return null;
    const available = containerSize.width;
    const padding = available < 400 ? 12 : available < 768 ? 14 : 18;
    const width = available < 640 ? available : Math.min(available, 860);
    return computeWorldMapLayout(width, geoData, padding);
  }, [containerSize?.width, geoData]);

  function fillFor(geo) {
    const code = codeForGeo(geo);
    if (!code) return FILL.neutral;
    return FILL[flagStatus(flags, code)];
  }

  const activeGeo = hoverGeo || tapGeo;

  const navigateToCountry = useCallback(
    (code) => {
      if (!code) return;
      const country = byCode(code);
      if (!country) return;
      playUiSound("navigate");
      if (onSelectRegion) {
        onSelectRegion(country.region);
        return;
      }
      navigate(`/play/fragments?region=${encodeURIComponent(country.region)}`);
    },
    [navigate, onSelectRegion],
  );

  function handleTap(geo, code, name, region, capital, status) {
    playUiSound("tap");
    setTapGeo(geo);
    setTapInfo({ code, name, region, capital, status });
  }

  return (
    <div
      ref={containerRef}
      onMouseLeave={() => {
        if (isTouch.current) return;
        setHoverGeo(null);
        setHoverInfo(null);
      }}
      className="relative w-full overflow-hidden flex flex-col items-center justify-center bg-ocean px-2 sm:px-3 py-1.5 sm:py-2 select-none"
    >
      {layout ? (
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{
            scale: layout.scale,
            center: layout.center,
          }}
          width={layout.width}
          height={layout.height}
          style={{
            width: "100%",
            maxWidth: layout.width,
            height: "auto",
            display: "block",
            margin: "0 auto",
          }}
        >
          {/* Clean flat ocean background */}
          <rect
            x={0}
            y={0}
            width={layout.width}
            height={layout.height}
            fill="hsl(var(--ocean))"
          />

          <Geographies geography={geoData}>
            {({ geographies }) => (
              <>
                {geographies.map((geo) => {
                  const code = codeForGeo(geo);
                  const country = code ? byCode(code) : null;
                  const name = country?.name || geo.properties?.name;
                  const region = country?.region || "";
                  const capital = country?.capital || "";
                  const status = code ? flagStatus(flags, code) : null;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fillFor(geo)}
                      stroke="hsl(var(--border))"
                      strokeWidth={0.6}
                      style={{
                        outline: "none",
                        vectorEffect: "non-scaling-stroke",
                      }}
                      className="cursor-pointer transition-colors duration-150"
                      tabIndex={code ? 0 : -1}
                      aria-label={code ? `${name}, ${statusLabel(status)}` : name}
                      onMouseEnter={(e) => {
                        if (isTouch.current) return;
                        setHoverGeo(geo);
                        setHoverInfo({ code, name, region, capital, status });
                        setTooltipPosition(getTooltipPosition(e.clientX, e.clientY));
                      }}
                      onMouseLeave={() => {
                        if (isTouch.current) return;
                        setHoverGeo(null);
                        setHoverInfo(null);
                      }}
                      onFocus={(e) => {
                        if (isTouch.current) return;
                        const bounds = e.currentTarget.getBoundingClientRect();
                        setHoverGeo(geo);
                        setHoverInfo({ code, name, region, capital, status });
                        setTooltipPosition(getTooltipPosition(bounds.left + bounds.width / 2, bounds.top));
                      }}
                      onBlur={() => {
                        if (!isTouch.current) {
                          setHoverGeo(null);
                          setHoverInfo(null);
                        }
                      }}
                      onKeyDown={(e) => {
                        if ((e.key === "Enter" || e.key === " ") && code) {
                          e.preventDefault();
                          navigateToCountry(code);
                        }
                      }}
                      onClick={() => {
                        if (isTouch.current) return;
                        navigateToCountry(code);
                      }}
                      onTouchStart={(e) => {
                        isTouch.current = true;
                        e.stopPropagation();
                        handleTap(geo, code, name, region, capital, status);
                      }}
                    />
                  );
                })}

                {/* Clean golden highlight outline on hovered/tapped country */}
                {activeGeo && (
                  <Geography
                    key="__highlight"
                    geography={activeGeo}
                    fill="none"
                    stroke="hsl(var(--gold))"
                    strokeWidth={2.4}
                    style={{
                      outline: "none",
                      pointerEvents: "none",
                      vectorEffect: "non-scaling-stroke",
                    }}
                  />
                )}
              </>
            )}
          </Geographies>
        </ComposableMap>
      ) : (
        <div
          className="w-full flex items-center justify-center rounded-sm"
          style={{ aspectRatio: "2.05 / 1", maxHeight: 220 }}
        >
          {mapLoadFailed ? (
            <p className="max-w-xs px-4 text-center text-xs font-semibold text-white/80">
              The map could not be loaded. Please check your connection and refresh.
            </p>
          ) : (
            <div className="w-full h-full bg-ocean/80 animate-pulse" aria-hidden />
          )}
        </div>
      )}

      {/* ── Tooltip follows cursor smoothly ── */}
      {hoverInfo && typeof document !== "undefined" && createPortal(
        <div
          ref={tooltipRef}
          className="fixed z-[100] pointer-events-none transition-transform duration-75 ease-out"
          style={{
            left: tooltipPosition?.left ?? -9999,
            top: tooltipPosition?.top ?? -9999,
            visibility: tooltipPosition ? "visible" : "hidden",
          }}
        >
          <div className="flex items-start gap-3 border-2 border-foreground bg-card/95 backdrop-blur-md px-3.5 py-2.5 rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.4)] max-w-xs">
            {hoverInfo.code ? (
              <div className="w-11 h-8 overflow-hidden border-2 border-foreground shrink-0 rounded shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] mt-0.5">
                <FlagImage code={hoverInfo.code} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-8 h-8 flex items-center justify-center border-2 border-foreground bg-muted text-muted-foreground shrink-0 rounded mt-0.5">
                <Compass className="w-4 h-4" />
              </div>
            )}
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-extrabold text-foreground leading-tight truncate">
                  {hoverInfo.name}
                </span>
                {hoverInfo.code && (
                  <span className="text-[10px] uppercase font-mono px-1 py-0.5 border border-foreground/30 bg-muted/60 text-muted-foreground rounded font-bold">
                    {hoverInfo.code.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Capital & Region Details */}
              {hoverInfo.capital && (
                <div className="text-[11px] font-medium text-foreground/90 flex items-center gap-1">
                  <span className="text-muted-foreground font-normal">Capital:</span>
                  <span className="font-semibold">{hoverInfo.capital}</span>
                </div>
              )}
              {hoverInfo.region && (
                <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                  <span>Region:</span>
                  <span className="font-semibold text-foreground/80">{hoverInfo.region}</span>
                </div>
              )}

              {/* Status pill + CTA */}
              <div className="flex items-center gap-2 pt-0.5">
                {hoverInfo.code ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border",
                      hoverInfo.status === "mastered"
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
                        : hoverInfo.status === "learning"
                          ? "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-400"
                          : "bg-muted border-foreground/20 text-muted-foreground"
                    )}
                  >
                    {statusLabel(hoverInfo.status)}
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                    Territory
                  </span>
                )}
                {hoverInfo.code && (
                  <span className="text-[10px] font-bold text-terra uppercase tracking-tight">
                    Click to play →
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {/* ── Mobile Touch Sheet ── */}
      <AnimatePresence>
        {tapInfo && (
          <motion.div
            key="tap-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="w-full sm:hidden pt-2"
          >
            <div className="flex items-center gap-3 border-2 border-foreground bg-card px-3.5 py-3 rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              {tapInfo.code ? (
                <div className="w-12 h-8.5 overflow-hidden border-2 border-foreground shrink-0 rounded shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                  <FlagImage code={tapInfo.code} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-8 h-8 flex items-center justify-center border-2 border-foreground bg-muted text-muted-foreground shrink-0 rounded">
                  <Compass className="w-4 h-4" />
                </div>
              )}
              <div className="flex-1 leading-tight min-w-0">
                <div className="text-sm font-bold text-foreground truncate">
                  {tapInfo.name}
                </div>
                <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                  {tapInfo.capital ? `Capital: ${tapInfo.capital} · ` : ""}{tapInfo.region || ""}
                </div>
                <div
                  className={`text-[10px] font-bold uppercase mt-1 ${tapInfo.code ? statusColor(tapInfo.status) : "text-muted-foreground"}`}
                >
                  {tapInfo.code ? statusLabel(tapInfo.status) : "Territory"}
                </div>
              </div>
              {tapInfo.code && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigateToCountry(tapInfo.code);
                    setTapInfo(null);
                    setTapGeo(null);
                  }}
                  className="flex items-center gap-1 border-2 border-foreground bg-foreground text-background text-xs font-bold px-3 py-1.5 rounded shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] shrink-0"
                >
                  Play <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  playUiSound("click");
                  setTapInfo(null);
                  setTapGeo(null);
                }}
                className="p-1 text-muted-foreground hover:text-foreground"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-center text-[10px] text-muted-foreground mt-1 opacity-70">
              Tap another country to inspect it, or press Play to start this region
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
