import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail } from "lucide-react";
import { FeedbackModal } from "./FeedbackModal";

/**
 * FeedbackLauncher — a small floating pill pinned to the bottom-right corner
 * (bottom-center on mobile) that opens the FeedbackModal. Rendered once in
 * the Layout so it is available on every page without intruding on gameplay.
 */
export function FeedbackLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 320, damping: 26 }}
            onClick={() => setOpen(true)}
            aria-label="Send a postcard to the developer"
            title="Notes, ideas, or map corrections — mail a postcard to Abhishek"
            className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-40 inline-flex items-center gap-1.5 rounded-full border-2 border-foreground bg-card px-3 h-9 text-[10px] sm:text-[11px] font-bold uppercase tracking-tight text-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none transition-all select-none"
          >
            <Mail className="w-3.5 h-3.5 text-terra" aria-hidden="true" />
            Postcard
          </motion.button>
        )}
      </AnimatePresence>
      <FeedbackModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}

/**
 * FeedbackInvite — the end-of-game invitation strip (Word Rush's
 * "Have suggestions, ideas, or spotted a bug?" banner). Drop it into any
 * result screen; it manages its own modal.
 */
export function FeedbackInvite() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, type: "spring", stiffness: 350, damping: 26 }}
        className="mt-2 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border-2 border-foreground bg-card p-3.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] w-full"
      >
        <div className="flex items-center gap-3 text-center sm:text-left">
          <span className="w-9 h-9 rounded-xl border-2 border-foreground bg-gold/25 inline-flex items-center justify-center text-base shrink-0">
            📮
          </span>
          <div>
            <div className="text-xs font-bold text-foreground">
              Spotted a beetle on the map, or have an idea?
            </div>
            <div className="text-[10px] text-muted-foreground">
              Mail a postcard to the Cartographer — every note gets read.
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border-2 border-foreground bg-gold px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-foreground hover:-translate-y-0.5 active:translate-y-0 transition-all"
        >
          <span>Write a postcard</span>
          <Mail aria-hidden="true" className="w-3.5 h-3.5" />
        </button>
      </motion.div>
      <FeedbackModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
