import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  MailCheck,
  X,
  Lightbulb,
  Bug,
  Compass,
  Send,
  User,
  Mail,
  SendHorizontal,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { playUiSound } from "@/lib/sounds";
import { loadLS, saveLS } from "@/lib/utils";

/**
 * "Postcard to the Cartographer" — FlagAtlas's feedback system.
 *
 * Symmetrical, uniform neo-brutalist postcard modal:
 * - 4 cleanly aligned topic stamp buttons
 * - Uniform rounded-lg input boxes with matching borders and shadows
 * - Clear visual hierarchy and airmail styling
 * - Defensive spam protections: honeypots, speed trap, cooldown, duplicate detection
 */

const TOPICS = [
  {
    id: "idea",
    icon: Lightbulb,
    label: "Idea",
    prompt: "Sketch a new mode, feature, or tweak you'd love to see…",
    subject: "Idea",
  },
  {
    id: "beetle",
    icon: Bug,
    label: "Bug",
    prompt: "Something scuttled where it shouldn't? Describe the bug…",
    subject: "Bug",
  },
  {
    id: "carto",
    icon: Compass,
    label: "Map Data",
    prompt: "Wrong flag, odd capital, or missing country? Mark it on the map…",
    subject: "Map data",
  },
  {
    id: "letter",
    icon: Send,
    label: "Letter",
    prompt: "Say hi, share your streak, or tell me what you think…",
    subject: "Letter",
  },
];

const COOLDOWN_SECONDS = 60;
const DIRECT_EMAIL = "abhishek.jain.dev@outlook.com";
const LAST_SENT_KEY = "flagatlas:postcard_last_ts";
const LAST_MSG_KEY = "flagatlas:postcard_last_msg";
const FROM_NAME_KEY = "flagatlas:postcard_from_name";
const FROM_EMAIL_KEY = "flagatlas:postcard_from_email";

const ACCESS_KEY =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_WEB3FORMS_ACCESS_KEY) || "";

function roughen(text) {
  return String(text || "").replace(/<[^>]*>?/gm, "").trim();
}

export function FeedbackModal({ isOpen, onClose }) {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [note, setNote] = useState("");
  const [fromName, setFromName] = useState(() => loadLS(FROM_NAME_KEY, ""));
  const [fromEmail, setFromEmail] = useState(() => loadLS(FROM_EMAIL_KEY, ""));
  const [botcheck, setBotcheck] = useState(false);
  const [gotcha, setGotcha] = useState("");

  const [phase, setPhase] = useState("writing"); // writing | sealing | mailed
  const [sealStep, setSealStep] = useState(0);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const openedAtRef = useRef(Date.now());
  const busyRef = useRef(false);

  // Cooldown while the modal is open
  useEffect(() => {
    if (!isOpen) return;
    openedAtRef.current = Date.now();
    setPhase("writing");
    setError("");
    const last = Number(loadLS(LAST_SENT_KEY, 0)) || 0;
    const left = COOLDOWN_SECONDS - Math.floor((Date.now() - last) / 1000);
    setCooldown(left > 0 ? left : 0);
  }, [isOpen]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setInterval(() => setCooldown((c) => (c <= 1 ? (clearInterval(t), 0) : c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape" && phase !== "sealing") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, phase, onClose]);

  const noteTooShort = useMemo(() => roughen(note).length > 0 && roughen(note).length < 8, [note]);

  const copyEmail = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(DIRECT_EMAIL);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  const mailIt = async (e) => {
    e.preventDefault();
    if (busyRef.current || phase === "sealing") return;

    // Honeypots: bots fill hidden fields — pretend success and bail.
    if (botcheck || gotcha) {
      setPhase("mailed");
      return;
    }
    if (Date.now() - openedAtRef.current < 1500) {
      setError("That was fast even for an explorer — take a moment to re-read your note.");
      return;
    }
    if (cooldown > 0) {
      setError(`The mail plane just left. Next one departs in ${cooldown}s.`);
      return;
    }

    const cleanName = roughen(fromName).slice(0, 60);
    const cleanEmail = fromEmail.trim().slice(0, 100);
    const cleanNote = roughen(note).slice(0, 1200);

    if (!cleanName) return setError("Every postcard needs a sender — add your name.");
    if (!cleanEmail) return setError("Add your email so the reply can find you.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail))
      return setError("That email doesn't look deliverable (try name@domain.com).");
    if (cleanNote.length < 8) return setError("The note is a bit thin — a few more words?");
    const lastMsg = loadLS(LAST_MSG_KEY, "");
    if (lastMsg && lastMsg.toLowerCase() === cleanNote.toLowerCase())
      return setError("You've already mailed this exact note.");

    if (!ACCESS_KEY) {
      setError("The mail service isn't configured on this deployment — copy the direct email below instead.");
      return;
    }

    busyRef.current = true;
    setPhase("sealing");
    setError("");
    setSealStep(0);
    setTimeout(() => setSealStep(1), 600);

    const body = [
      cleanNote,
      "",
      "— postmarked —",
      `Topic: ${topic.subject}`,
      `Screen: ${window.innerWidth}x${window.innerHeight} (${
        /iPhone|iPad|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop"
      })`,
      `Sent: ${new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })} IST`,
    ].join("\n");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          name: cleanName,
          email: cleanEmail,
          subject: `[FlagAtlas] ${topic.subject}: ${cleanNote.slice(0, 48).replace(/[\r\n]+/g, " ")}…`,
          message: body,
          from_name: "FlagAtlas Postcard",
          botcheck: "",
        }),
      });
      const result = await res.json();
      if (result.success) {
        saveLS(FROM_NAME_KEY, cleanName);
        saveLS(FROM_EMAIL_KEY, cleanEmail);
        saveLS(LAST_SENT_KEY, String(Date.now()));
        saveLS(LAST_MSG_KEY, cleanNote);
        setCooldown(COOLDOWN_SECONDS);
        playUiSound("success");
        setPhase("mailed");
      } else {
        setError(result.message || "The postcard got lost in the mail — try the direct email below.");
        setPhase("writing");
      }
    } catch {
      setError("No signal at this outpost — check your connection and try again.");
      setPhase("writing");
    } finally {
      busyRef.current = false;
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div
        key="postcard-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="postcard-title"
        onClick={() => phase !== "sealing" && onClose()}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 14, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-[480px] my-auto max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-foreground bg-[#f8f4ea] dark:bg-card text-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)]"
        >
          {/* Classic Air Mail Edge Stripe */}
          <div
            aria-hidden="true"
            className="h-2 w-full border-b-2 border-foreground bg-[repeating-linear-gradient(45deg,#c25e40,#c25e40_12px,#f8f4ea_12px,#f8f4ea_24px,#2d5a7b_24px,#2d5a7b_36px,#f8f4ea_36px,#f8f4ea_48px)] dark:bg-[repeating-linear-gradient(45deg,#c25e40,#c25e40_12px,#1a1a1a_12px,#1a1a1a_24px,#2d5a7b_24px,#2d5a7b_36px,#1a1a1a_36px,#1a1a1a_48px)]"
          />

          {/* ── Postcard Header ── */}
          <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3.5 border-b-2 border-foreground/15">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-foreground/20 bg-muted/60 text-[9px] uppercase tracking-widest font-bold text-foreground mb-1.5">
                <Compass className="w-3 h-3 text-terra" />
                Direct Dispatch
              </div>
              <h3 id="postcard-title" className="font-display text-xl sm:text-2xl font-black text-foreground tracking-tight leading-none">
                Postcard to Cartographer
              </h3>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                Notes &amp; ideas delivered directly to Abhishek.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div
                aria-hidden="true"
                className="hidden sm:inline-flex items-center border-2 border-terra/60 bg-terra/10 text-terra px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest rotate-2 select-none"
              >
                Air Mail
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={phase === "sealing"}
                aria-label="Close postcard"
                className="w-8 h-8 rounded-lg border-2 border-foreground bg-card inline-flex items-center justify-center text-foreground hover:bg-muted shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[1.5px_1.5px_0px_0px_rgba(255,255,255,0.3)] transition-all disabled:opacity-40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {phase === "mailed" ? (
            /* ── Mailed state ── */
            <div className="px-5 py-8 text-center space-y-4">
              <motion.div
                initial={{ scale: 0.6, rotate: -8 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 16 }}
                className="mx-auto w-16 h-16 rounded-2xl border-2 border-forest bg-forest/15 inline-flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                <MailCheck className="w-8 h-8 text-forest" />
              </motion.div>
              <div>
                <h4 className="font-display text-2xl font-black text-foreground">Postcard Dispatched!</h4>
                <p className="mt-1 text-xs text-muted-foreground font-medium max-w-[280px] mx-auto leading-relaxed">
                  Your note has been mailed. Replies will be sent directly to your email.
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setNote("");
                    setPhase("writing");
                  }}
                  className="h-10 px-4 rounded-lg border-2 border-foreground bg-card text-xs font-bold uppercase tracking-tight hover:bg-muted shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  Write another
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 px-5 rounded-lg border-2 border-foreground bg-forest text-white text-xs font-bold uppercase tracking-tight hover:opacity-90 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-opacity"
                >
                  Back to the atlas
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={mailIt} noValidate className="p-5 space-y-4">
              {error && (
                <p
                  role="alert"
                  className="rounded-lg border-2 border-destructive bg-destructive/10 px-3.5 py-2 text-xs font-bold text-destructive"
                >
                  {error}
                </p>
              )}

              {/* ── 1. Stamp corner: pick a topic ── */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                  <span>1. Affix a Stamp (Topic)</span>
                  <span className="text-[9px] font-bold text-terra uppercase">
                    {topic.label} selected
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TOPICS.map((t) => {
                    const active = topic.id === t.id;
                    const Icon = t.icon;
                    return (
                      <motion.button
                        key={t.id}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.96 }}
                        type="button"
                        onClick={() => {
                          playUiSound("tap");
                          setTopic(t);
                          setError("");
                        }}
                        aria-pressed={active}
                        title={t.label}
                        className={cn(
                          "h-14 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all select-none",
                          active
                            ? "border-foreground bg-gold text-foreground font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)]"
                            : "border-foreground/30 bg-card/60 hover:bg-card hover:border-foreground text-muted-foreground hover:text-foreground shadow-none",
                        )}
                      >
                        <Icon className={cn("w-4 h-4", active ? "text-foreground" : "text-muted-foreground")} />
                        <span className="text-[10px] uppercase font-bold tracking-tight">{t.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* ── 2. Message area ── */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                  <label htmlFor="postcard-note" className="cursor-pointer">
                    2. Your Note
                  </label>
                  <span className="text-[10px] font-mono font-bold text-muted-foreground">
                    {note.length}/1200
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    id="postcard-note"
                    maxLength={1200}
                    value={note}
                    onChange={(e) => {
                      setNote(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder={topic.prompt}
                    rows={4}
                    className="w-full resize-none rounded-lg border-2 border-foreground bg-card px-3.5 py-2.5 text-xs sm:text-sm font-medium text-foreground outline-none focus:border-terra focus:ring-2 focus:ring-terra/20 transition-all placeholder:text-muted-foreground/60 leading-relaxed shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]"
                  />
                </div>
                {noteTooShort && (
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold pl-1">
                    A few more words to give your note context…
                  </p>
                )}
              </div>

              {/* Honeypots — invisible to humans */}
              <input
                type="checkbox"
                name="botcheck"
                checked={botcheck}
                onChange={(e) => setBotcheck(e.target.checked)}
                className="hidden"
                style={{ display: "none" }}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />
              <input
                type="text"
                name="_gotcha"
                value={gotcha}
                onChange={(e) => setGotcha(e.target.value)}
                className="hidden"
                style={{ display: "none" }}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              {/* ── 3. Sender lines (Uniform boxes with icons) ── */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                  3. Sender Coordinates
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label
                      htmlFor="postcard-name"
                      className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      From · Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <input
                        id="postcard-name"
                        type="text"
                        maxLength={60}
                        value={fromName}
                        onChange={(e) => {
                          setFromName(e.target.value);
                          if (error) setError("");
                        }}
                        placeholder="Explorer name"
                        className="w-full h-10 pl-9 pr-3 rounded-lg border-2 border-foreground bg-card text-foreground text-xs font-semibold placeholder:text-muted-foreground/60 outline-none focus:border-terra focus:ring-2 focus:ring-terra/20 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="postcard-email"
                      className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Reply · Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <input
                        id="postcard-email"
                        type="email"
                        maxLength={100}
                        value={fromEmail}
                        onChange={(e) => {
                          setFromEmail(e.target.value);
                          if (error) setError("");
                        }}
                        placeholder="you@example.com"
                        className="w-full h-10 pl-9 pr-3 rounded-lg border-2 border-foreground bg-card text-foreground text-xs font-semibold placeholder:text-muted-foreground/60 outline-none focus:border-terra focus:ring-2 focus:ring-terra/20 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── 4. Submit CTA Button ── */}
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ y: 1 }}
                type="submit"
                disabled={phase === "sealing" || cooldown > 0}
                className="w-full h-11 sm:h-12 rounded-lg border-2 border-foreground bg-terra hover:bg-terra/90 text-white font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 select-none"
              >
                {phase === "sealing" ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="animate-spin inline-block">📮</span>
                    {sealStep === 0 ? "Sealing envelope…" : "Dispatching…"}
                  </span>
                ) : cooldown > 0 ? (
                  `Next mail departure in ${cooldown}s`
                ) : (
                  <>
                    <span>Mail the Postcard</span>
                    <SendHorizontal className="w-4 h-4" />
                  </>
                )}
              </motion.button>

              {/* ── 5. Direct Email Fallback Footer ── */}
              <div className="pt-2.5 border-t border-foreground/15 flex items-center justify-between text-xs text-muted-foreground">
                <span className="text-[11px] truncate">
                  Direct line: <span className="font-semibold text-foreground/80">{DIRECT_EMAIL}</span>
                </span>
                <button
                  type="button"
                  onClick={copyEmail}
                  className="inline-flex items-center gap-1 font-bold text-[11px] text-terra hover:underline transition-colors ml-2 shrink-0"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy email</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  );
}
