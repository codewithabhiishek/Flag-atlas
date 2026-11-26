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
 * Matches Word Rush's RoomChat UX while using FlagAtlas's neo-brutalist theme.
 */
export default function BattleChat({ messages = [], players = [], mySeat, onSendMessage }) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const lastMsgCountRef = useRef(messages.length);

  const me = players.find((p) => p.seat === mySeat);

  // Track unread messages & play subtle audio cue when a peer sends a message
  useEffect(() => {
    const currentCount = messages.length;
    const prevCount = lastMsgCountRef.current;

    if (currentCount > prevCount) {
      const latest = messages[messages.length - 1];
      if (latest && latest.seat !== mySeat) {
        playUiSound("message");
        if (!isOpen) {
          setUnreadCount((c) => c + (currentCount - prevCount));
        }
      }
    }
    lastMsgCountRef.current = currentCount;
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
      {/* 1. Floating Toggle Button (Bottom-right corner) */}
      <div className="fixed bottom-3 sm:bottom-4 right-3 sm:right-4 z-40 pointer-events-none">
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
              className="pointer-events-auto relative inline-flex items-center gap-1.5 border-2 border-foreground bg-gold text-foreground px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform cursor-pointer"
              aria-label="Open Chat"
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
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

      {/* 2. Responsive Chat Drawer (Bottom-sheet on mobile, floating card on desktop) */}
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
              transition={{ duration: 0.2 }}
              onClick={() => {
                playUiSound("tap");
                setIsOpen(false);
              }}
              className="fixed inset-0 bg-foreground/45 backdrop-blur-[2px] pointer-events-auto"
            />

            {/* Chat Box Container */}
            <motion.div
              initial={{ y: "100%", opacity: 0.6 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 340 }}
              className="pointer-events-auto relative w-full sm:w-[360px] max-w-full sm:max-w-[360px] h-[65vh] sm:h-[440px] max-h-[85vh] sm:max-h-[520px] bg-card border-t-2 border-x-2 sm:border-2 border-foreground rounded-t-2xl sm:rounded-none shadow-[0_-8px_28px_rgba(0,0,0,0.35)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:sm:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] flex flex-col overflow-hidden z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Drag Indicator */}
              <div className="w-10 h-1 rounded-full bg-foreground/25 mx-auto mt-2 mb-1 sm:hidden shrink-0" />

              {/* Header */}
              <div className="bg-background border-b-2 border-foreground px-4 py-2.5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex w-7 h-7 border-2 border-foreground bg-gold items-center justify-center text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    💬
                  </span>
                  <div>
                    <p className="font-display font-bold text-sm text-foreground tracking-tight m-0 leading-none">
                      Room Chat
                    </p>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground m-0 mt-1">
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
                  className="w-8 h-8 border-2 border-foreground bg-card text-foreground hover:bg-muted flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close Chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-3 sm:p-3.5 overflow-y-auto space-y-2.5 text-left overscroll-contain bg-card">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
                    <Smile className="w-7 h-7 mb-2 text-gold" />
                    <p className="font-display text-sm font-bold text-foreground m-0">
                      No messages yet
                    </p>
                    <p className="text-xs text-muted-foreground m-0 mt-1">
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
                          <div className="flex items-center gap-1.5 mb-0.5 ml-1">
                            <span className="text-[11px] font-black uppercase tracking-tight text-terra">
                              {m.playerName}
                            </span>
                            <span className="font-mono text-[9px] text-muted-foreground">
                              {formatTime(m.timestamp)}
                            </span>
                          </div>
                        )}

                        <div
                          className={cn(
                            "max-w-[85%] px-3 py-1.5 text-xs break-words border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)]",
                            isMe
                              ? "bg-forest text-primary-foreground font-semibold"
                              : "bg-background text-foreground",
                          )}
                        >
                          <p className="m-0 leading-relaxed">{m.text}</p>
                          {isMe && (
                            <span className="block text-right font-mono text-[9px] opacity-75 mt-0.5">
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
              <div className="bg-background/90 border-t-2 border-foreground px-2.5 py-1.5 flex items-center justify-between gap-1 overflow-x-auto shrink-0">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleSend(emoji)}
                    className="p-1.5 sm:p-1 rounded hover:bg-muted transition-transform active:scale-90 text-base sm:text-sm cursor-pointer shrink-0"
                    title={`Send ${emoji}`}
                    aria-label={`Send ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <div className="p-2.5 sm:p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-background border-t-2 border-foreground flex items-center gap-2 shrink-0">
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
                  className="flex-1 h-10 border-2 border-foreground bg-card px-3 text-base sm:text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                />
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!text.trim()}
                  className="w-10 h-10 border-2 border-foreground bg-terra text-foreground flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
