import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { byCode } from "@/data/countries";

// Flag CDN sources in priority order — SVG from flagcdn.com is primary,
// PNG fallback from flagcdn.com as secondary.
// On final error we render a small placeholder with the country's ISO code.

export default function FlagImage({
  code,
  className,
  alt = "",
  fittingType = "fill",
  priority = false,
}) {
  const [errCount, setErrCount] = useState(0);

  // Reset fallback sequence whenever the flag code changes
  useEffect(() => {
    setErrCount(0);
  }, [code]);

  const c = byCode(code);
  const label = alt || (c ? `Flag of ${c.name}` : code ? `Flag of ${code}` : "Flag placeholder");

  if (!code) {
    return <FlagPlaceholder code={code} label={label} className={className} />;
  }

  // Source priority: SVG → W800 PNG → placeholder
  const srcs = [
    `https://flagcdn.com/${code}.svg`,
    `https://flagcdn.com/w800/${code}.png`,
  ];

  if (errCount >= srcs.length) {
    return <FlagPlaceholder code={code} label={label} className={className} />;
  }

  const objectFit = fittingType === "contain" ? "object-contain" : "object-cover";

  return (
    <img
      key={`${code}-${srcs[errCount]}`} // forces remount on country or source change
      src={srcs[errCount]}
      alt={label}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className={cn("w-full h-full", objectFit, className)}
      onError={() => setErrCount((n) => n + 1)}
    />
  );
}

function FlagPlaceholder({ code, label, className }) {
  return (
    <div
      className={cn(
        "w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs font-bold uppercase tracking-widest select-none",
        className,
      )}
      aria-label={label}
      title={label}
    >
      {code?.toUpperCase() || "?"}
    </div>
  );
}
