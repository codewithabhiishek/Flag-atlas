import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, Send, Smile, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { playUiSound } from "@/lib/sounds";

const QUICK_EMOJIS = ["😂", "💀", "⚡", "🔥", "👏", "👑", "👀", "😱"];

function formatTime(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * Multiplayer-only room chat drawer & floating toggle button.
 * Compact on small mobile screens (uses dvh for virtual keyboard safety)
 * and uses unique seat IDs so players with identical names never mix up.
 */
export default function BattleChat({ messages = [], players = [], mySeat, onSendMessage }) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const lastMsgIdRef = useRef(messages[messages.length - 1]?.id ?? null);

  const me = players.find((p) => p.seat === mySeat);

  // Track unread messages & play subtle audio cue when a peer sends a message
  useEffect(() => {
    const latest = messages[messages.length - 1];
    const latestId = latest?.id ?? null;

    if (latestId && latestId !== lastMsgIdRef.current) {
      if (latest.seat !== mySeat) {
        playUiSound("message");
        if (!isOpen) {
          setUnreadCount((c) => Math.min(99, c + 1));
        }
      }
    }
    lastMsgIdRef.current = latestId;
  }, [messages, mySeat, isOpen]);

  // Reset unread count when opened & scroll to latest message
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, messages.length]);

  const handleSend = (msgText) => {
    const toSend = (msgText ?? text).trim();
    if (!toSend || !mySeat) return;

    playUiSound("tap");
    if (msgText === undefined) {
      setText("");
    }
    onSendMessage?.(toSend);
  };

  return (
    <>
      {/* 1. Compact Floating Toggle Button (Bottom-right corner) */}
      <div className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] right-3 sm:bottom-4 sm:right-4 z-40 pointer-events-none">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              key="flagatlas-chat-toggle"
              type="button"
              initial={{ scale: 0.75, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.75, opacity: 0 }}
              transition={{ duration: 0.15 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                playUiSound("tap");
                setIsOpen(true);
              }}
              className="pointer-events-auto relative inline-flex items-center gap-1.5 border-2 border-foreground bg-gold text-foreground px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform cursor-pointer"
              aria-label="Open Chat"
            >
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="font-display tracking-wider">CHAT</span>

              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-destructive text-white font-mono text-[10px] font-black min-w-5 h-5 px-1 rounded-full flex items-center justify-center border-2 border-foreground animate-bounce shadow-sm">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Responsive Chat Drawer (Compact bottom-sheet on mobile, floating card on desktop) */}
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center sm:justify-end pointer-events-none p-0 sm:p-4"
            onKeyDown={(e) => e.stopPropagation()}
            onKeyUp={(e) => e.stopPropagation()}
            onKeyPress={(e) => e.stopPropagation()}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => {
                playUiSound("tap");
                setIsOpen(false);
              }}
              className="fixed inset-0 bg-foreground/40 backdrop-blur-[2px] pointer-events-auto"
            />

            {/* Chat Box Container */}
            <motion.div
              initial={{ y: "100%", opacity: 0.6 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 340 }}
              className="pointer-events-auto relative w-full sm:w-[350px] max-w-full sm:max-w-[350px] h-[min(52dvh,380px)] sm:h-[420px] max-h-[75dvh] sm:max-h-[calc(100dvh-2rem)] bg-card border-t-2 border-x-2 sm:border-2 border-foreground rounded-t-2xl sm:rounded-none shadow-[0_-8px_28px_rgba(0,0,0,0.35)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:sm:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] flex flex-col overflow-hidden z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Drag Indicator */}
              <div className="w-9 h-1 rounded-full bg-foreground/25 mx-auto mt-1.5 mb-0.5 sm:hidden shrink-0" />

              {/* Header */}
              <div className="bg-background border-b-2 border-foreground px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="inline-flex w-6 h-6 sm:w-7 sm:h-7 border-2 border-foreground bg-gold items-center justify-center text-xs sm:text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
                    💬
                  </span>
                  <div className="min-w-0">
                    <p className="font-display font-bold text-xs sm:text-sm text-foreground tracking-tight m-0 leading-none">
                      Room Chat
                    </p>
                    <p className="font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground m-0 mt-0.5 truncate">
                      {players.length} {players.length === 1 ? "player" : "players"} in room
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playUiSound("tap");
                    setIsOpen(false);
                  }}
                  className="w-7 h-7 sm:w-8 sm:h-8 border-2 border-foreground bg-card text-foreground hover:bg-muted flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  aria-label="Close Chat"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-2.5 sm:p-3.5 overflow-y-auto space-y-2 text-left overscroll-contain bg-card min-h-0">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-3 text-muted-foreground">
                    <Smile className="w-6 h-6 mb-1.5 text-gold" />
                    <p className="font-display text-xs sm:text-sm font-bold text-foreground m-0">
                      No messages yet
                    </p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground m-0 mt-0.5">
                      Say hi or drop a quick emoji below!
                    </p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.seat === mySeat;
                    return (
                      <div
                        key={m.id}
                        className={cn("flex flex-col", isMe ? "items-end" : "items-start")}
                      >
                        {!isMe && (
                          <div className="flex items-center gap-1.5 mb-0.5 ml-1 max-w-[85%]">
                            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-tight text-terra truncate max-w-[150px]">
                              {m.playerName}
                            </span>
                            <span className="font-mono text-[9px] text-muted-foreground shrink-0">
                              {formatTime(m.timestamp)}
                            </span>
                          </div>
                        )}

                        <div
                          className={cn(
                            "max-w-[85%] px-2.5 py-1.5 sm:px-3 text-xs break-words [overflow-wrap:anywhere] border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)]",
                            isMe
                              ? "bg-forest text-primary-foreground font-semibold"
                              : "bg-background text-foreground",
                          )}
                        >
                          <p className="m-0 leading-snug sm:leading-relaxed">{m.text}</p>
                          {isMe && (
                            <span className="block text-right font-mono text-[8px] sm:text-[9px] opacity-75 mt-0.5">
                              {formatTime(m.timestamp)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Emoji Reaction Bar */}
              <div className="bg-background/90 border-t-2 border-foreground px-2 py-1 flex items-center justify-between gap-0.5 overflow-x-auto shrink-0">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleSend(emoji)}
                    className="p-1 rounded hover:bg-muted transition-transform active:scale-90 text-sm cursor-pointer shrink-0"
                    title={`Send ${emoji}`}
                    aria-label={`Send ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <div className="p-2 sm:p-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-background border-t-2 border-foreground flex items-center gap-1.5 sm:gap-2 shrink-0">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  onKeyUp={(e) => e.stopPropagation()}
                  onKeyPress={(e) => e.stopPropagation()}
                  placeholder={`Chat as ${me?.name || "Player"}...`}
                  maxLength={200}
                  className="flex-1 min-w-0 h-9 sm:h-10 border-2 border-foreground bg-card px-2.5 sm:px-3 text-base sm:text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                />
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!text.trim()}
                  className="w-9 h-9 sm:w-10 sm:h-10 border-2 border-foreground bg-terra text-foreground flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
