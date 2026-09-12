import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { playUiSound } from "@/lib/sounds";
import { loadLS, saveLS } from "@/lib/utils";

/**
 * FeedbackModal — ported from Word Rush's FeedbackModal, restyled to the
 * FlagAtlas paper/brutalist theme. Sends dispatches through Web3Forms
 * (free email relay, no backend) with the same anti-spam defenses:
 * honeypot fields, speed-trap, 60s cooldown, hourly cap, duplicate check.
 */

export const FEEDBACK_CATEGORIES = [
  {
    id: "suggestion",
    icon: "💡",
    label: "Suggestion",
    badge: "IDEA & FEATURE",
    hint: "Have an idea for a new game mode, power-up, or visual improvement?",
    placeholder:
      "Tell Abhishek your idea! What would make FlagAtlas even better?",
    subjectPrefix: "💡 Suggestion",
    templates: [
      {
        label: "🚀 New Game Mode",
        text: "Hey Abhishek, it would be awesome to have a game mode where [e.g. capital-city quiz / timed region duel]!",
      },
      {
        label: "🗺️ Map Feature",
        text: "Loving the world atlas! One feature idea: [e.g. zoom into a region / territory streak bonuses].",
      },
      {
        label: "🎨 Theme / Visuals",
        text: "Loving the game aesthetic! One visual improvement idea: [e.g. flag animations / new rank badges].",
      },
    ],
  },
  {
    id: "bug",
    icon: "🐛",
    label: "Bug Report",
    badge: "GLITCH / ISSUE",
    hint: "Spotted a freeze, wrong answer counted, sound glitch, or mobile layout bug?",
    placeholder:
      "What went wrong? Describe what happened (e.g. answer miscounted, timer froze, multiplayer drop...)",
    subjectPrefix: "🐛 Bug Report",
    templates: [
      {
        label: "📱 Mobile Layout",
        text: "On mobile screen, [e.g. buttons overlap / keyboard covers the answer input / UI overflows]. Device: [iPhone / Android].",
      },
      {
        label: "🔌 Multiplayer Drop",
        text: "During a battle, the game disconnected when [e.g. switching tabs / the host left the room].",
      },
      {
        label: "❌ Wrong Answer",
        text: "I answered '[COUNTRY]' correctly but the game marked it wrong in [mode name] mode.",
      },
    ],
  },
  {
    id: "content",
    icon: "🌍",
    label: "Flag / Data",
    badge: "CONTENT",
    hint: "Is a flag rendering wrong, a capital misspelled, or a country missing?",
    placeholder:
      "Which country/flag is wrong? What did you see vs what should it be?",
    subjectPrefix: "🌍 Flag / Data Check",
    templates: [
      {
        label: "🏳️ Wrong Flag Image",
        text: "The flag for '[COUNTRY]' shows the wrong image or fails to load in [mode] mode.",
      },
      {
        label: "🏛️ Capital Wrong",
        text: "The capital of '[COUNTRY]' is listed as '[X]' but it should be '[Y]'.",
      },
      {
        label: "➕ Missing Country",
        text: "Please add '[COUNTRY]' — it's missing from the [REGION] region.",
      },
    ],
  },
  {
    id: "general",
    icon: "💬",
    label: "General",
    badge: "FEEDBACK",
    hint: "Say hello, share feedback on the game, or drop a note for Abhishek!",
    placeholder: "Drop a line, share your streak, or say hi to Abhishek...",
    subjectPrefix: "💬 General Note",
    templates: [
      {
        label: "❤️ Loving the Game",
        text: "Just hit a [X]-day streak on FlagAtlas — great work on the map and game modes!",
      },
      {
        label: "🤝 Collaboration",
        text: "Hey Abhishek, loved your work on FlagAtlas! Would love to connect regarding [collaboration / project].",
      },
    ],
  },
];

const COOLDOWN_SECONDS = 60;
const MAX_HOURLY_DISPATCHES = 5;
const DIRECT_EMAIL = "abhishek.jain.dev@outlook.com";
const FALLBACK_KEY = "8a1e06e5-be91-4200-8d77-df95f527bcd9";

function getRecentDispatchesCount() {
  const raw = loadLS("flagatlas:feedback_history", []);
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  return Array.isArray(raw) ? raw.filter((ts) => ts > oneHourAgo).length : 0;
}

function recordDispatchTimestamp() {
  const raw = loadLS("flagatlas:feedback_history", []);
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const valid = Array.isArray(raw) ? raw.filter((ts) => ts > oneHourAgo) : [];
  valid.push(Date.now());
  saveLS("flagatlas:feedback_history", valid);
}

export function FeedbackModal({ isOpen, onClose }) {
  const [category, setCategory] = useState(FEEDBACK_CATEGORIES[0].id);
  const [name, setName] = useState(() => loadLS("flagatlas:feedback_name", ""));
  const [email, setEmail] = useState(() => loadLS("flagatlas:feedback_email", ""));
  const [message, setMessage] = useState(FEEDBACK_CATEGORIES[0].templates[0].text);
  const [botcheck, setBotcheck] = useState(false);
  const [gotcha, setGotcha] = useState("");

  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [stepIndex, setStepIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const textareaRef = useRef(null);
  const isSubmittingRef = useRef(false);
  const openedAtRef = useRef(Date.now());

  useEffect(() => {
    if (!isOpen) return;
    openedAtRef.current = Date.now();
    if (!message.trim()) {
      const cat = FEEDBACK_CATEGORIES.find((c) => c.id === category) || FEEDBACK_CATEGORIES[0];
      setMessage(cat.templates[0].text);
    }
    const lastSent = Number(loadLS("flagatlas:feedback_last_ts", "0") || 0);
    const elapsed = Math.floor((Date.now() - lastSent) / 1000);
    setCooldownRemaining(lastSent && elapsed < COOLDOWN_SECONDS ? COOLDOWN_SECONDS - elapsed : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining((prev) => (prev <= 1 ? (clearInterval(timer), 0) : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape" && status !== "submitting") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, status, onClose]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(200, Math.max(90, el.scrollHeight))}px`;
  }, [message, isOpen]);

  const selectedMeta = FEEDBACK_CATEGORIES.find((c) => c.id === category) || FEEDBACK_CATEGORIES[0];

  const handleSelectCategory = (cat) => {
    playUiSound("tap");
    setCategory(cat);
    setErrorMsg("");
    const meta = FEEDBACK_CATEGORIES.find((c) => c.id === cat);
    if (meta?.templates?.[0]) setMessage(meta.templates[0].text);
    textareaRef.current?.focus();
  };

  const applyTemplate = (text) => {
    playUiSound("tap");
    setMessage(text);
    setErrorMsg("");
    textareaRef.current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingRef.current || status === "submitting") return;

    // Bot honeypot traps — silently pretend success.
    if (botcheck || gotcha) {
      setStatus("success");
      return;
    }

    // Speed-trap: a human cannot complete this form in under 1.8s.
    if (Date.now() - openedAtRef.current < 1800) {
      setErrorMsg("Dispatch submitted too quickly. Please review your message.");
      return;
    }

    if (getRecentDispatchesCount() >= MAX_HOURLY_DISPATCHES) {
      setErrorMsg(`Hourly dispatch limit reached (${MAX_HOURLY_DISPATCHES}/hour). Please try again later.`);
      return;
    }
    if (cooldownRemaining > 0) {
      setErrorMsg(`Rate limit: please wait ${cooldownRemaining}s before sending another dispatch.`);
      return;
    }

    const cleanName = name.replace(/<[^>]*>?/gm, "").trim().slice(0, 60);
    const cleanEmail = email.trim().slice(0, 100);
    const cleanMessage = message.replace(/<[^>]*>?/gm, "").trim().slice(0, 1500);

    if (!cleanName) return setErrorMsg("Please enter your name.");
    if (!cleanEmail) return setErrorMsg("Please provide your email address.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail))
      return setErrorMsg("Please enter a valid email address (e.g. name@domain.com).");
    if (!cleanMessage || cleanMessage.length < 8)
      return setErrorMsg("Please write at least a few words describing your suggestion or issue.");

    const lastSentMsg = loadLS("flagatlas:feedback_last_msg", "");
    if (lastSentMsg && lastSentMsg.trim().toLowerCase() === cleanMessage.toLowerCase())
      return setErrorMsg("Duplicate dispatch detected: you have already sent this exact message recently.");

    isSubmittingRef.current = true;
    setStatus("submitting");
    setErrorMsg("");
    setStepIndex(1);
    playUiSound("tap");
    setTimeout(() => setStepIndex(2), 650);

    const contextLines = [
      `🌍 Game: FlagAtlas (World Flag Learning Game)`,
      `🏷️ Category: ${selectedMeta.badge}`,
      `📱 Screen: ${window.innerWidth}x${window.innerHeight} (${
        /iPhone|iPad|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop"
      })`,
      `🕒 Sent At: ${new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })} IST`,
    ];

    const fullMessage = [cleanMessage, "\n────────────────────────────────────", ...contextLines].join("\n");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key:
            (typeof import.meta !== "undefined" && import.meta.env?.VITE_WEB3FORMS_ACCESS_KEY) ||
            FALLBACK_KEY,
          name: cleanName,
          email: cleanEmail,
          subject: `[FlagAtlas] ${selectedMeta.subjectPrefix}: ${cleanMessage.slice(0, 50).replace(/[\r\n]+/g, " ")}…`,
          message: fullMessage,
          from_name: "FlagAtlas Dispatch Bot",
          botcheck: "",
        }),
      });
      const result = await response.json();

      if (result.success) {
        saveLS("flagatlas:feedback_name", cleanName);
        saveLS("flagatlas:feedback_email", cleanEmail);
        saveLS("flagatlas:feedback_last_ts", String(Date.now()));
        saveLS("flagatlas:feedback_last_msg", cleanMessage);
        recordDispatchTimestamp();
        setCooldownRemaining(COOLDOWN_SECONDS);
        setStepIndex(3);
        setTimeout(() => {
          setStatus("success");
          playUiSound("success");
        }, 400);
      } else {
        setStatus("error");
        setErrorMsg(result.message || "Failed to deliver dispatch. Please copy the direct email below.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please check your connection and try again.");
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handleCopyEmail = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(DIRECT_EMAIL);
    playUiSound("tap");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  const resetForm = () => {
    const cat = FEEDBACK_CATEGORIES.find((c) => c.id === category) || FEEDBACK_CATEGORIES[0];
    setMessage(cat.templates[0].text);
    setStatus("idle");
    setStepIndex(0);
    setErrorMsg("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-title"
          onClick={() => status !== "submitting" && onClose()}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[540px] my-auto max-h-[92vh] flex flex-col overflow-hidden rounded-2xl border-2 border-foreground bg-card text-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)]"
          >
            {/* Top accent stripe — theme palette */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-forest via-gold to-terra" />

            {/* Header */}
            <div className="flex items-center justify-between gap-2.5 border-b border-border pb-3 pt-2 px-4 sm:px-5 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl border-2 border-foreground bg-gold inline-flex items-center justify-center text-lg shrink-0 select-none">
                  {selectedMeta.icon}
                </div>
                <div className="min-w-0">
                  <h3 id="feedback-title" className="font-display font-bold text-sm sm:text-base tracking-tight truncate">
                    Feedback &amp; Dispatch
                  </h3>
                  <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold tracking-[0.14em] uppercase text-terra">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-forest animate-pulse shrink-0" />
                    <span className="truncate">Direct to Abhishek // Developer</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={status === "submitting"}
                className="w-8 h-8 rounded-lg border-2 border-foreground bg-card inline-flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40 shrink-0"
                aria-label="Close feedback modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-4 sm:px-5 py-4 space-y-4">
              {status === "success" ? (
                <div className="py-6 sm:py-8 text-center space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-forest bg-forest/10 text-3xl text-forest">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-display text-xl sm:text-2xl font-bold text-foreground">Dispatch delivered!</h4>
                    <p className="mt-1 text-[10px] font-bold tracking-[0.18em] uppercase text-forest">
                      Status: transmitted to developer inbox
                    </p>
                  </div>
                  <p className="max-w-sm mx-auto rounded-xl border border-border bg-muted/60 p-3.5 text-xs text-muted-foreground leading-relaxed">
                    Thank you for helping craft FlagAtlas! Abhishek reviews every bug report and suggestion
                    directly and will follow up if you included your email.
                  </p>
                  <div className="pt-1 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-lg border-2 border-foreground bg-card px-4 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-muted transition-colors"
                    >
                      Send another
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-lg border-2 border-foreground bg-forest text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
                    >
                      Back to FlagAtlas 🌍
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  {errorMsg && (
                    <div
                      role="alert"
                      className="rounded-lg border-2 border-destructive/60 bg-destructive/10 p-2.5 text-xs font-semibold text-destructive flex items-center gap-2"
                    >
                      <span>⚠️</span>
                      <span className="flex-1">{errorMsg}</span>
                    </div>
                  )}

                  {/* 1. Category chips */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                        1. Select topic
                      </label>
                      <span className="text-[8.5px] font-bold text-terra tracking-wider">{selectedMeta.badge}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {FEEDBACK_CATEGORIES.map((c) => {
                        const active = category === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleSelectCategory(c.id)}
                            className={cn(
                              "flex items-center justify-center gap-1.5 rounded-lg border-2 px-2 py-2 text-[11px] font-bold transition-all select-none",
                              active
                                ? "border-foreground bg-gold/25 text-foreground"
                                : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                            )}
                          >
                            <span className="text-xs shrink-0">{c.icon}</span>
                            <span className="truncate">{c.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Quick starters */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[8.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                        ⚡ Quick starters (tap to auto-fill):
                      </span>
                      {message && (
                        <button
                          type="button"
                          onClick={() => setMessage("")}
                          className="text-[8.5px] text-destructive hover:underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMeta.templates.map((tpl, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => applyTemplate(tpl.text)}
                          className="rounded-md border border-border bg-muted/50 px-2.5 py-1 text-[9.5px] font-medium text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-all active:scale-95"
                        >
                          {tpl.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Name & email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <div>
                      <label className="block text-[9.5px] font-bold uppercase tracking-[0.16em] text-muted-foreground mb-1">
                        Your name <span className="text-terra">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={80}
                        placeholder="e.g. FlagMaster"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errorMsg) setErrorMsg("");
                        }}
                        className="w-full rounded-lg border-2 border-foreground/70 bg-background px-3 py-2 text-xs font-medium placeholder:text-muted-foreground/60 outline-none focus:border-foreground transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[9.5px] font-bold uppercase tracking-[0.16em] text-muted-foreground mb-1">
                        Your email <span className="text-terra">*</span>
                      </label>
                      <input
                        type="email"
                        maxLength={120}
                        placeholder="player@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errorMsg) setErrorMsg("");
                        }}
                        className="w-full rounded-lg border-2 border-foreground/70 bg-background px-3 py-2 text-xs font-medium placeholder:text-muted-foreground/60 outline-none focus:border-foreground transition-colors"
                      />
                    </div>
                  </div>

                  {/* Honeypot anti-spam (dual trap) */}
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

                  {/* 4. Message */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                        Message details <span className="text-terra">*</span>
                      </label>
                      <span className="text-[10px] text-muted-foreground font-mono">{message.length}/2000</span>
                    </div>
                    <textarea
                      ref={textareaRef}
                      maxLength={2000}
                      placeholder={selectedMeta.placeholder}
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        if (errorMsg) setErrorMsg("");
                      }}
                      className="w-full min-h-[90px] resize-none rounded-lg border-2 border-foreground/70 bg-background px-3.5 py-2.5 text-xs font-medium placeholder:text-muted-foreground/60 outline-none focus:border-foreground transition-colors leading-relaxed"
                    />
                    {selectedMeta.hint && (
                      <p className="mt-1 text-[10px] text-muted-foreground">{selectedMeta.hint}</p>
                    )}
                  </div>

                  {/* 5. Submit */}
                  <button
                    type="submit"
                    disabled={status === "submitting" || cooldownRemaining > 0}
                    className="w-full rounded-lg border-2 border-foreground bg-foreground text-background py-3 text-xs font-bold uppercase tracking-[0.14em] hover:opacity-90 active:translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none select-none"
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      {status === "submitting" ? (
                        <>
                          <span className="animate-spin inline-block">⚙️</span>
                          <span>
                            {stepIndex === 1
                              ? "Packing dispatch..."
                              : stepIndex === 2
                                ? "Transmitting to inbox..."
                                : "Delivering..."}
                          </span>
                        </>
                      ) : cooldownRemaining > 0 ? (
                        <>
                          <span>⏳</span>
                          <span>Please wait {cooldownRemaining}s cooldown</span>
                        </>
                      ) : (
                        <>
                          <span>🚀</span>
                          <span>Send dispatch to developer</span>
                        </>
                      )}
                    </span>
                  </button>

                  {/* 6. Direct email fallback */}
                  <div className="pt-2 border-t border-border flex flex-col min-[380px]:flex-row items-center justify-between gap-1.5 text-[11px] text-muted-foreground">
                    <span className="text-[10px] font-medium">Need direct email?</span>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-terra hover:underline"
                    >
                      {copiedEmail ? (
                        <>
                          <Check className="w-3 h-3" /> <span>Copied {DIRECT_EMAIL}!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> <span>Copy email directly</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
