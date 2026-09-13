import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { MailCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { playUiSound } from "@/lib/sounds";
import { loadLS, saveLS } from "@/lib/utils";

/**
 * "Postcard to the Cartographer" — FlagAtlas's feedback system.
 *
 * The form IS a postcard: pick a postage stamp (topic), write your note on
 * ruled paper, fill the From lines, and mail it. Delivered through Web3Forms
 * so there is no backend; the access key is read from the
 * VITE_WEB3FORMS_ACCESS_KEY env var (never hardcoded — configure it in your
 * hosting dashboard). Without a key, the mail button is disabled and the
 * direct-email fallback is offered instead.
 *
 * Anti-spam (invisible to humans): honeypot fields, a sub-1.5s speed trap,
 * a 60s cooldown between postcards, and duplicate-note detection.
 */

const TOPICS = [
  {
    id: "idea",
    stamp: "💡",
    label: "Idea",
    prompt: "Sketch a new mode, feature, or tweak you'd love to see…",
    subject: "Idea",
  },
  {
    id: "beetle",
    stamp: "🐞",
    label: "Beetle",
    prompt: "Something scuttled where it shouldn't? Describe the bug…",
    subject: "Bug",
  },
  {
    id: "carto",
    stamp: "🗺️",
    label: "Map data",
    prompt: "Wrong flag, odd capital, missing country? Mark it on the map…",
    subject: "Map data",
  },
  {
    id: "letter",
    stamp: "✉️",
    label: "Just writing",
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

  // NOTE: createPortal must wrap AnimatePresence, not the other way around —
  // AnimatePresence cannot track a portal element as its direct child and the
  // modal would never mount.
  if (!isOpen) return null;
  return createPortal(
    <AnimatePresence>
      <div
        key="postcard-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="postcard-title"
        onClick={() => phase !== "sealing" && onClose()}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto"
      >
          <motion.div
            initial={{ opacity: 0, y: 24, rotate: -1 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: 16, rotate: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[440px] my-auto max-h-[88vh] overflow-y-auto rounded-xl border-2 border-foreground bg-[#f7f1e3] dark:bg-card text-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)]"
          >
            {/* Postmark hint — rotated rubber-stamp, tucked left of the close button */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-12 top-4 select-none hidden lg:block"
            >
              <div className="-rotate-6 border-2 border-terra/50 rounded-md px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.18em] text-terra/60">
                air mail
              </div>
            </div>

            {/* ── Postcard header ── */}
            <div className="flex items-start justify-between gap-2 px-4 pt-4">
              <div>
                <h3 id="postcard-title" className="font-display text-lg text-foreground leading-tight">
                  Postcard to the Cartographer
                </h3>
                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                  Notes &amp; ideas — delivered to Abhishek.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={phase === "sealing"}
                aria-label="Close postcard"
                className="w-7 h-7 rounded-lg border-2 border-foreground bg-card inline-flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mx-4 mt-3 border-t-2 border-dashed border-foreground/25" />

            {phase === "mailed" ? (
              /* ── Mailed state ── */
              <div className="px-4 py-8 text-center">
                <motion.div
                  initial={{ scale: 0.6, rotate: -8 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 16 }}
                  className="mx-auto w-16 h-16 rounded-full border-2 border-forest bg-forest/10 inline-flex items-center justify-center"
                >
                  <MailCheck className="w-8 h-8 text-forest" />
                </motion.div>
                <h4 className="mt-4 font-display text-2xl text-foreground">Posted!</h4>
                <p className="mt-0.5 text-[10px] text-muted-foreground font-medium max-w-[260px] mx-auto leading-relaxed">
                  Every note gets read — replies go to your email.
                </p>
                <div className="mt-6 flex items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setNote("");
                      setPhase("writing");
                    }}
                    className="h-10 px-4 rounded-lg border-2 border-foreground bg-card text-xs font-bold uppercase tracking-tight hover:bg-muted transition-colors"
                  >
                    Write another
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="h-10 px-4 rounded-lg border-2 border-foreground bg-forest text-white text-xs font-bold uppercase tracking-tight hover:opacity-90 transition-opacity"
                  >
                    Back to the atlas
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={mailIt} noValidate className="px-4 py-4 space-y-3.5">
                {error && (
                  <p
                    role="alert"
                    className="rounded-lg border-2 border-destructive/60 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive"
                  >
                    {error}
                  </p>
                )}

                {/* ── Stamp corner: pick a topic stamp ── */}
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground mb-1.5">
                    Affix a stamp
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {TOPICS.map((t) => {
                      const active = topic.id === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            playUiSound("tap");
                            setTopic(t);
                            setError("");
                          }}
                          aria-pressed={active}
                          title={t.label}
                          className={cn(
                            "h-12 border-2 flex flex-col items-center justify-center gap-0.5 transition-all select-none",
                            active
                              ? "border-foreground bg-gold/25 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.25)]"
                              : "border-dashed border-foreground/40 bg-transparent opacity-70 hover:opacity-100 hover:border-foreground",
                          )}
                        >
                          <span className="text-sm leading-none">{t.stamp}</span>
                          <span className="text-[8px] font-bold uppercase tracking-wide">{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Ruled note area ── */}
                <div>
                  <label
                    htmlFor="postcard-note"
                    className="block text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground mb-1"
                  >
                    Your note
                  </label>
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
                    style={{
                      // Ruled letter paper: line-height must EXACTLY match the
                      // 28px rule spacing so every text row sits on a line.
                      lineHeight: "28px",
                      paddingTop: "5px",
                      backgroundImage: "repeating-linear-gradient(to bottom, transparent, transparent 27px, rgba(120, 113, 108, 0.28) 27px, rgba(120, 113, 108, 0.28) 28px)",
                    }}
                    className="w-full resize-none rounded-lg border-2 border-foreground/70 bg-[#fffdf5] dark:bg-background px-3.5 py-2.5 text-sm font-medium text-foreground outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/50"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground">
                      {noteTooShort ? "A few more words…" : " "}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">{note.length}/1200</span>
                  </div>
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

                {/* ── From lines (postcard address style) ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label
                      htmlFor="postcard-name"
                      className="block text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground mb-0.5"
                    >
                      From · name
                    </label>
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
                      className="w-full bg-transparent border-b-2 border-foreground/50 focus:border-foreground outline-none px-1 py-1 text-sm font-medium placeholder:text-muted-foreground/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="postcard-email"
                      className="block text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground mb-0.5"
                    >
                      Reply · email
                    </label>
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
                      className="w-full bg-transparent border-b-2 border-foreground/50 focus:border-foreground outline-none px-1 py-1 text-sm font-medium placeholder:text-muted-foreground/50 transition-colors"
                    />
                  </div>
                </div>

                {/* ── Mail button ── */}
                <button
                  type="submit"
                  disabled={phase === "sealing" || cooldown > 0}
                  className="w-full h-11 rounded-lg border-2 border-foreground bg-terra text-white font-bold uppercase text-xs tracking-tight hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-y-0 transition-transform disabled:opacity-50 disabled:pointer-events-none select-none"
                >
                  {phase === "sealing" ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="animate-spin inline-block">📮</span>
                      {sealStep === 0 ? "Sealing envelope…" : "On its way…"}
                    </span>
                  ) : cooldown > 0 ? (
                    `Next mail plane in ${cooldown}s`
                  ) : (
                    "Mail the postcard 📮"
                  )}
                </button>

                {/* Direct-email fallback */}
                <div className="flex items-center justify-between gap-2 border-t border-border pt-2.5 text-[10px] text-muted-foreground">
                  <span>Old school?</span>
                  <button
                    type="button"
                    onClick={copyEmail}
                    className="font-bold text-terra hover:underline truncate"
                  >
                    {copiedEmail ? "Copied!" : "Copy email"}
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
