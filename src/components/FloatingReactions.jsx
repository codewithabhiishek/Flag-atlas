import { AnimatePresence, motion } from "framer-motion";
import { playUiSound } from "@/lib/sounds";

export const BATTLE_REACTIONS = [
  { emoji: "🔥", label: "Fire" },
  { emoji: "💀", label: "Skull" },
  { emoji: "🤯", label: "Mind blown" },
  { emoji: "👑", label: "Crown" },
  { emoji: "⚡", label: "Lightning fast" },
];

/**
 * GPU-composited floating emoji reactions overlay rendered over the Battle arena.
 */
export function FloatingReactions({ reactions = [] }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
    >
      <AnimatePresence>
        {reactions.map((r) => (
          <motion.div
            key={r.id}
            initial={{
              opacity: 0,
              scale: 0.4,
              y: 0,
              x: 0,
            }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.4, 1.25, 1.05, 0.9],
              y: -260,
              x: r.drift || 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.0, ease: "easeOut" }}
            style={{
              left: `${r.x ?? 50}%`,
              bottom: "14%",
            }}
            className="absolute -translate-x-1/2 flex flex-col items-center select-none will-change-transform"
          >
            <span className="text-3xl sm:text-4xl drop-shadow-[0_3px_6px_rgba(0,0,0,0.28)]">
              {r.emoji}
            </span>
            <span className="mt-0.5 px-1.5 py-0.5 border border-foreground bg-card/95 text-foreground text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap">
              {r.playerName}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/**
 * Compact reaction bar for firing live emoji bursts during Battle.
 */
export function ReactionBar({ onReact, className = "" }) {
  return (
    <div
      className={`inline-flex items-center gap-1 sm:gap-1.5 border-2 border-foreground bg-background/95 px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${className}`}
    >
      <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground pr-1 hidden sm:inline">
        React
      </span>
      {BATTLE_REACTIONS.map(({ emoji, label }) => (
        <button
          key={emoji}
          type="button"
          onClick={() => {
            playUiSound("tap");
            onReact?.(emoji);
          }}
          aria-label={`React with ${label}`}
          title={`Send ${emoji} reaction`}
          className="w-8 h-8 sm:w-9 sm:h-9 inline-flex items-center justify-center text-base sm:text-lg rounded hover:bg-muted active:scale-90 transition-transform cursor-pointer"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
