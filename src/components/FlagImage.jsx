import { useState } from "react";
import { cn } from "@/lib/utils";
import { byCode } from "@/data/countries";

// Flag CDN sources in priority order — SVG from flagcdn.com is primary,
// PNG fallback from flagcdn.com as secondary.
// On final error we render a small placeholder with the country's ISO code.

export default function FlagImage({ code, className, alt, fittingType = "fill" }) {
  const [errCount, setErrCount] = useState(0);
  const c = byCode(code);
  const label = alt || `Flag of ${c?.name || code}`;

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
      key={srcs[errCount]}          // forces remount on source change
      src={srcs[errCount]}
      alt={label}
      loading="lazy"
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
