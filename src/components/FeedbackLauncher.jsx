import { useState } from "react";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { FeedbackModal } from "./FeedbackModal";

/**
 * FeedbackButton — a single, stationary button for the header nav. One fixed
 * place on every page (no floating pill, nothing overlapping the footer on
 * small screens). Opens the postcard modal on click.
 */
export function FeedbackButton({ className = "" }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Send a suggestion to the developer"
        title="Suggestions, ideas, or map corrections — send them to Abhishek"
        className={className}
      >
        <Mail className="w-4 h-4" aria-hidden="true" />
        <span className="hidden md:inline">Suggest</span>
      </button>
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
