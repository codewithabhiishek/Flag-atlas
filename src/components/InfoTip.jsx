import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { HelpCircle } from "lucide-react";

/**
 * InfoTip — a small, theme-matched help tooltip.
 *
 * Renders through a portal into document.body with `position: fixed`
 * coordinates measured from the button, so parent `overflow-hidden` cards
 * can never clip it (that clipping is exactly what broke v1). The panel
 * clamps to the viewport edges and flips above the button when there is
 * more room above. Works on desktop (hover) and touch (tap to toggle).
 */
export default function InfoTip({ label = "More info", children, className = "" }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null); // { top, left, maxWidth } in px
  const btnRef = useRef(null);

  const measure = () => {
    const btn = btnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const MARGIN = 12;
    const GAP = 10;
    const viewportW = window.innerWidth;

    // Panel width: min(260px, viewport minus margins)
    const maxWidth = Math.min(260, viewportW - MARGIN * 2);
    // Prefer opening ABOVE the button (both usages sit on top of content —
    // map, charts — so opening below covers the thing being explained).
    // Flip below only when there isn't room above.
    const spaceAbove = r.top;
    const openDown = spaceAbove < 150 && r.bottom < window.innerHeight - 150;
    const top = openDown ? r.bottom + GAP : r.top - GAP - 8;

    // Horizontal: align panel's right edge to the button's right edge,
    // then clamp inside the viewport.
    let left = r.right - maxWidth;
    left = Math.max(MARGIN, Math.min(left, viewportW - MARGIN - maxWidth));

    setPos({ top, left, maxWidth });
  };

  useLayoutEffect(() => {
    if (!open) return;
    measure();
    const onReflow = () => measure();
    window.addEventListener("resize", onReflow);
    window.addEventListener("scroll", onReflow, true);
    return () => {
      window.removeEventListener("resize", onReflow);
      window.removeEventListener("scroll", onReflow, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const panel = (
    <AnimatePresence>
      {open && pos && (
        <motion.span
          role="tooltip"
          initial={{ opacity: 0, y: 4, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.97 }}
          transition={{ duration: 0.15 }}
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            width: pos.maxWidth,
            zIndex: 60,
          }}
          className="block rounded-xl border-2 border-foreground bg-card px-3.5 py-2.5 text-left text-xs font-medium leading-relaxed text-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </motion.span>
      )}
    </AnimatePresence>
  );

  return (
    <span
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        ref={btnRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        onBlur={() => setOpen(false)}
        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-foreground/40 text-muted-foreground hover:bg-foreground hover:text-background transition-colors cursor-pointer"
      >
        <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
      {typeof document !== "undefined" && createPortal(panel, document.body)}
    </span>
  );
}
