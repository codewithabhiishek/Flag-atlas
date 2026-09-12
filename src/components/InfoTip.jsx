import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * InfoTip — a small, theme-matched help tooltip.
 *
 * Works on both desktop (hover) and touch (tap to toggle). Content renders in
 * a paper card that aligns to the right edge so it never overflows the screen
 * on mobile. Keep copy short — 1–3 sentences.
 */
export default function InfoTip({ label = "More info", children, className }) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className={cn("relative inline-flex items-center", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          setOpen((o) => !o);
        }}
        onBlur={() => setOpen(false)}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-foreground/40 text-muted-foreground hover:bg-foreground hover:text-background transition-colors cursor-pointer"
      >
        <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.span
            role="tooltip"
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-7 z-50 w-64 max-w-[calc(100vw-3rem)] rounded-lg border-2 border-foreground bg-card px-3 py-2.5 text-left text-xs font-medium leading-relaxed text-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.3)]"
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
