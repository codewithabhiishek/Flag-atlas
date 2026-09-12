import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

function positionTooltip(anchorRect, tooltipRect, boundaryRect) {
  const pad = 12;
  const gap = 14;
  const width = tooltipRect.width;
  const height = tooltipRect.height;
  const boundary = {
    left: Math.max(pad, boundaryRect.left + pad),
    top: Math.max(pad, boundaryRect.top + pad),
    right: Math.min(window.innerWidth - pad, boundaryRect.right - pad),
    bottom: Math.min(window.innerHeight - pad, boundaryRect.bottom - pad),
  };
  const centerX = anchorRect.left + anchorRect.width / 2;
  const centerY = anchorRect.top + anchorRect.height / 2;
  const candidates = [
    { left: anchorRect.right + gap, top: centerY - height / 2 },
    { left: anchorRect.left - width - gap, top: centerY - height / 2 },
    { left: centerX - width / 2, top: anchorRect.bottom + gap },
    { left: centerX - width / 2, top: anchorRect.top - height - gap },
  ];
  const fits = (candidate) =>
    candidate.left >= boundary.left &&
    candidate.top >= boundary.top &&
    candidate.left + width <= boundary.right &&
    candidate.top + height <= boundary.bottom;
  const candidate = candidates.find(fits) || candidates[0];
  return {
    left: Math.min(Math.max(boundary.left, candidate.left), Math.max(boundary.left, boundary.right - width)),
    top: Math.min(Math.max(boundary.top, candidate.top), Math.max(boundary.top, boundary.bottom - height)),
  };
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
  const [hoverAnchor, setHoverAnchor] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState(null);

  const tooltipRef = useRef(null);
  const isTouch = useRef(isTouchDevice());

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

  useLayoutEffect(() => {
    if (!hoverInfo || !hoverAnchor || !tooltipRef.current) return;
    const updatePosition = () => {
      const boundary = containerRef.current?.getBoundingClientRect();
      if (boundary) {
        setTooltipPosition(positionTooltip(hoverAnchor, tooltipRef.current.getBoundingClientRect(), boundary));
      }
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [hoverInfo, hoverAnchor]);

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
    [navigate],
  );

  function handleTap(geo, code, name) {
    playUiSound("tap");
    setTapGeo(geo);
    setTapInfo({ code, name });
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden flex flex-col items-center justify-center bg-ocean px-2 sm:px-3 py-1.5 sm:py-2"
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
                      tabIndex={code ? 0 : -1}
                      aria-label={code ? `${name}, ${statusLabel(flagStatus(flags, code))}` : name}
                      onMouseEnter={(e) => {
                        if (isTouch.current) return;
                        const bounds = e.currentTarget.getBoundingClientRect();
                        setHoverGeo(geo);
                        setHoverInfo({ code, name });
                        setHoverAnchor(bounds);
                        setTooltipPosition(null);
                      }}
                      onMouseLeave={() => {
                        if (isTouch.current) return;
                        setHoverGeo(null);
                        setHoverInfo(null);
                        setHoverAnchor(null);
                      }}
                      onFocus={(e) => {
                        if (isTouch.current) return;
                        const bounds = e.currentTarget.getBoundingClientRect();
                        setHoverGeo(geo);
                        setHoverInfo({ code, name });
                        setHoverAnchor(bounds);
                        setTooltipPosition(null);
                      }}
                      onBlur={() => {
                        if (!isTouch.current) {
                          setHoverGeo(null);
                          setHoverInfo(null);
                          setHoverAnchor(null);
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
                        handleTap(geo, code, name);
                      }}
                    />
                  );
                })}
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

      {hoverInfo && typeof document !== "undefined" && createPortal(
        <div
          ref={tooltipRef}
          className="fixed z-[100] pointer-events-none"
          style={{ left: tooltipPosition?.left ?? -9999, top: tooltipPosition?.top ?? -9999, visibility: tooltipPosition ? "visible" : "hidden" }}
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
        </div>,
        document.body,
      )}

      <AnimatePresence>
        {tapInfo && (
          <motion.div
            key="tap-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="w-full sm:hidden pt-1.5"
          >
            <div className="flex items-center gap-3 border-2 border-foreground bg-popover px-3 py-2.5 brutal-shadow">
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
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigateToCountry(tapInfo.code);
                  setTapInfo(null);
                  setTapGeo(null);
                }}
                className="flex items-center gap-1 bg-foreground text-background text-xs font-bold px-2.5 py-1.5 rounded shrink-0"
              >
                Play <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  playUiSound("click");
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
              Tap another country to inspect it, or press Play to start this region
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
