import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  Swords,
  Copy,
  Check,
  Users,
  Play,
  RotateCcw,
  ArrowLeft,
  UserMinus,
  QrCode,
  Crown,
  Lock,
  Unlock,
  Circle,
  X,
  LogOut,
  DoorClosed,
  Timer,
  AlertCircle,
} from "lucide-react";
import { byCode } from "@/data/countries";
import { REGIONS } from "@/data/regions";
const PLAYABLE_REGIONS = REGIONS.filter((r) => r.id !== "Antarctica");
import FlagImage from "@/components/FlagImage";
import { cn } from "@/lib/utils";
import { useProgress } from "@/lib/ProgressContext";
import { formatElapsedTime, useElapsedTimer } from "@/hooks/use-elapsed-timer";
import { randomRoomCode } from "@/lib/battle/engine";
import { createPeerHostLink, tryPeerGuestLink } from "@/lib/battle/peerTransport";
import { FeedbackInvite } from "@/components/FeedbackLauncher";
import { useFlagPrefetch } from "@/hooks/use-flag-prefetch";

const MAX_PLAYERS = 5;

const ADJ = [
  "Swift",
  "Bold",
  "Keen",
  "Lucky",
  "Wily",
  "Brave",
  "Sharp",
  "Quick",
];
function randomName() {
  return `${ADJ[Math.floor(Math.random() * ADJ.length)]}-${Math.floor(100 + Math.random() * 900)}`;
}
function randomCode() {
  return randomRoomCode();
}

export default function Battle() {
  const { record } = useProgress();
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(null);
  const [name, setName] = useState(() => randomName());
  const [joinInput, setJoinInput] = useState(() =>
    (searchParams.get("room") || "").toUpperCase().slice(0, 4),
  );
  const [region, setRegion] = useState("World");
  const [rounds, setRounds] = useState(10);
  const [copied, setCopied] = useState(false);

  // Match and room state
  const [status, setStatus] = useState("lobby"); // "lobby" | "playing" | "finished"
  const [roundPhase, setRoundPhase] = useState("lobby"); // "lobby" | "question" | "reveal" | "finished"
  const [currentRound, setCurrentRound] = useState(0);
  const [roundStartedAt, setRoundStartedAt] = useState(0);
  const [roundDurationMs, setRoundDurationMs] = useState(12000);
  const [timeLeftMs, setTimeLeftMs] = useState(12000);

  const [players, setPlayers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [roomRegion, setRoomRegion] = useState("World");
  const [roomRounds, setRoomRounds] = useState(10);
  const [hostSeat, setHostSeat] = useState(1);
  const [mySeat, setMySeat] = useState(null);
  const [results, setResults] = useState(null);
  const [roomLocked, setRoomLocked] = useState(false);

  const [picked, setPicked] = useState(null);
  const [roomMode, setRoomMode] = useState(null);
  const [connectionError, setConnectionError] = useState("");
  const [connected, setConnected] = useState(false);
  const [notice, setNotice] = useState("");
  const [qrZoom, setQrZoom] = useState(false);

  const roomRef = useRef(null);
  const answerLockedRef = useRef(false);
  const joinInputRef = useRef(null);
  const createNameRef = useRef(null);

  // Prefetch upcoming flag images for zero lag
  useFlagPrefetch(questions, currentRound);
  const elapsedMs = useElapsedTimer(status === "playing", `${code || ""}-${status}`);
  const actionParam = searchParams.get("action");

  // Focus action input when arriving from landing page CTAs
  useEffect(() => {
    if (!code) {
      if (actionParam === "join") {
        joinInputRef.current?.focus();
      } else if (actionParam === "create") {
        createNameRef.current?.focus();
      }
    }
  }, [actionParam, code]);

  // Synchronized countdown timer for the active question round
  useEffect(() => {
    if (status !== "playing" || roundPhase !== "question") {
      setTimeLeftMs(0);
      return;
    }
    const updateCountdown = () => {
      const remaining = Math.max(0, roundDurationMs - (Date.now() - roundStartedAt));
      setTimeLeftMs(remaining);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 60);
    return () => clearInterval(interval);
  }, [status, roundPhase, roundStartedAt, roundDurationMs]);

  // Reset local answer pick when advancing to a new question round
  useEffect(() => {
    if (status !== "playing") return;
    setPicked(null);
    answerLockedRef.current = false;
  }, [status, currentRound]);

  // Room networking connection effect
  useEffect(() => {
    if (!code) return;
    let disposed = false;
    let link = null;
    const offMessages = [];

    const bind = (gameLink) => {
      link = gameLink;
      roomRef.current = {
        send: (message) => link.send(message),
      };
      offMessages.push(
        link.onMessage((message) => {
          if (disposed) return;
          if (message.type === "joined") {
            setMySeat(message.seat);
            setConnected(true);
            setConnectionError("");
          }
          if (message.type === "error") {
            setConnectionError(message.message);
            // If the join was rejected (room locked, full, started, or invalid),
            // cleanly exit to menu so the guest is not stranded in a phantom lobby
            setMySeat((prevSeat) => {
              if (!prevSeat) {
                setCode(null);
                setRoomMode(null);
                setConnected(false);
                link?.close();
              }
              return prevSeat;
            });
          }
          if (message.type === "kicked") {
            setConnectionError("The host removed you from this room.");
            setCode(null);
            setRoomMode(null);
            setConnected(false);
            link?.close();
          }
          if (message.type === "leftRoom") {
            setCode(null);
            setRoomMode(null);
            setConnected(false);
            link?.close();
          }
          if (message.type === "roomClosed") {
            setConnectionError("The host closed this room.");
            setCode(null);
            setRoomMode(null);
            setConnected(false);
            link?.close();
          }
          if (message.type === "notice") {
            setNotice(message.message);
            window.setTimeout(() => setNotice(""), 4000);
          }
          if (message.type === "state") {
            setStatus(message.status);
            setPlayers(message.players);
            setQuestions(message.questions);
            setRoomRegion(message.region);
            setRoomRounds(message.rounds);
            setHostSeat(message.hostSeat);
            setRoomLocked(message.locked === true);
            if (typeof message.currentRound === "number") {
              setCurrentRound(message.currentRound);
            }
            if (message.roundPhase) {
              setRoundPhase(message.roundPhase);
            }
            if (message.roundStartedAt) {
              setRoundStartedAt(message.roundStartedAt);
            }
            if (message.roundDurationMs) {
              setRoundDurationMs(message.roundDurationMs);
            }
          }
          if (message.type === "finished") {
            setResults(message.results);
          }
        }),
      );
      link.onClose = () => {
        if (!disposed) {
          setConnected(false);
          setMySeat((prev) => {
            if (prev) {
              setConnectionError("Lost connection to the room host.");
              setCode(null);
              setRoomMode(null);
            }
            return null;
          });
        }
      };
    };

    const joinMsg = {
      type: "join",
      code,
      name: name.trim().replace(/<[^>]*>?/gm, "").slice(0, 20),
      create: roomMode === "create",
      region,
      rounds,
    };

    async function connect() {
      if (roomMode === "create") {
        bind(createPeerHostLink({ code, name: joinMsg.name, region, rounds }));
        return;
      }
      try {
        const guestLink = await tryPeerGuestLink(code);
        if (disposed) {
          guestLink.close();
          return;
        }
        bind(guestLink);
        guestLink.send(joinMsg);
      } catch {
        if (!disposed) {
          setConnectionError(
            "Could not reach room host. Ensure the room code is correct and the host has the room open.",
          );
          setConnected(false);
          setCode(null);
          setRoomMode(null);
        }
      }
    }

    connect();

    return () => {
      disposed = true;
      offMessages.forEach((off) => off());
      link?.close();
      roomRef.current = null;
    };
  }, [code, name, region, rounds, roomMode]);

  function answer(opt) {
    if (
      picked ||
      answerLockedRef.current ||
      !roomRef.current ||
      !q ||
      roundPhase !== "question"
    ) {
      return;
    }
    answerLockedRef.current = true;
    setPicked(opt);
    const correct = opt === q.flag;
    record(q.flag, {
      correct,
      quality: correct ? 5 : 2,
      xpGain: correct ? 5 : 0,
      timeMs: Math.max(0, Date.now() - roundStartedAt),
    });
    roomRef.current.send({ type: "answer", choice: opt });
  }

  function copyCode() {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function inviteUrl() {
    return `${window.location.origin}/battle?room=${code}`;
  }

  function copyInviteLink() {
    navigator.clipboard?.writeText(inviteUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function openRoom(nextCode, mode) {
    setConnectionError("");
    setRoomMode(mode);
    setCode(nextCode);
  }

  // ---- Invite gate (Arriving via ?room=XXXX) ----
  const inviteCode = searchParams.get("room")?.toUpperCase().slice(0, 4) || "";
  if (!code && inviteCode) {
    return (
      <div className="mx-auto max-w-md px-3 sm:px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/battle"
            className="inline-flex items-center gap-1.5 border-2 border-foreground bg-card px-3 h-8 text-sm font-bold uppercase tracking-tight shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <span className="text-xs font-bold uppercase tracking-tight text-muted-foreground">
            Joining room
          </span>
        </div>

        <div className="atlas-card grid-paper p-5 sm:p-6 text-center">
          <div className="inline-flex w-11 h-11 border-2 border-foreground bg-terra items-center justify-center mb-2 brutal-shadow">
            <Users className="w-5 h-5 text-foreground" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">
            Room code
          </p>
          <div className="mt-1 font-display text-4xl sm:text-5xl tracking-[0.2em] text-foreground">
            {inviteCode}
          </div>

          <div className="mt-5 text-left">
            <label
              htmlFor="invite-name"
              className="text-xs font-bold uppercase tracking-tight text-muted-foreground"
            >
              Your name
            </label>
            <input
              id="invite-name"
              value={name}
              autoFocus
              maxLength={20}
              onChange={(e) => setName(e.target.value.slice(0, 20))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && name.trim()) openRoom(inviteCode, "join");
              }}
              placeholder="Your name"
              className="mt-1 mb-4 w-full h-11 border-2 border-foreground bg-card px-3 text-sm font-medium focus:outline-none"
            />
            <button
              onClick={() => name.trim() && openRoom(inviteCode, "join")}
              disabled={!name.trim()}
              className="w-full h-11 border-2 border-foreground bg-terra font-bold uppercase text-sm tracking-tight hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform disabled:opacity-40 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)]"
            >
              Join room →
            </button>
            {connectionError && (
              <div
                role="alert"
                className="mt-4 flex items-start gap-2 border-2 border-destructive bg-destructive/10 p-3 text-xs font-bold text-destructive"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{connectionError}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---- Battle Menu (Create or Join) ----
  if (!code) {
    return (
      <div className="mx-auto max-w-3xl px-3 sm:px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 border-2 border-foreground bg-card px-3 h-8 text-sm font-bold uppercase tracking-tight shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]"
          >
            <ArrowLeft className="w-4 h-4" /> Map
          </Link>
          <span className="text-xs font-bold uppercase tracking-tight text-muted-foreground">
            Synchronous Multiplayer
          </span>
        </div>

        {connectionError && (
          <div
            role="alert"
            className="mb-4 flex items-center gap-2.5 border-2 border-destructive bg-destructive/10 px-4 py-3 text-xs font-bold text-destructive shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{connectionError}</span>
          </div>
        )}

        <div className="atlas-card grid-paper p-5 sm:p-6 mb-5">
          <div className="flex items-center gap-3">
            <div className="inline-flex w-11 h-11 shrink-0 border-2 border-foreground bg-gold items-center justify-center brutal-shadow">
              <Swords className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl text-foreground">
                Flag Battle
              </h1>
              <p className="text-xs font-bold uppercase tracking-widest text-terra mt-0.5">
                Live Synchronized Multiplayer Quiz
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3 font-medium max-w-lg leading-relaxed">
            Challenge up to 5 friends in a live flag duel. Everyone receives the{" "}
            <span className="font-bold text-foreground">exact same flag at the exact same moment</span>.
            Answer fast to earn maximum speed points!
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
          {/* Create Room Card */}
          <div className="atlas-card p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-display text-lg text-foreground">Create Room</h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-forest/15 text-forest border border-forest/30">
                  Host
                </span>
              </div>
              <label className="text-xs font-bold uppercase tracking-tight text-muted-foreground">
                Your name
              </label>
              <input
                ref={createNameRef}
                value={name}
                maxLength={20}
                onChange={(e) => setName(e.target.value.slice(0, 20))}
                className="mt-1 mb-3 w-full h-10 border-2 border-foreground bg-card px-3 text-sm font-medium focus:outline-none"
              />
              <label className="text-xs font-bold uppercase tracking-tight text-muted-foreground">
                Region
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="mt-1 mb-3 w-full h-10 border-2 border-foreground bg-card px-2 text-sm font-medium focus:outline-none"
              >
                <option value="World">World · all 197 countries</option>
                {PLAYABLE_REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id}
                  </option>
                ))}
              </select>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-tight text-muted-foreground">
                <span>Rounds</span>
                <span className="text-foreground">{rounds} flags</span>
              </div>
              <input
                type="range"
                min={5}
                max={20}
                value={rounds}
                onChange={(e) => setRounds(Number(e.target.value))}
                className="w-full mt-1.5 mb-2 accent-foreground"
              />
            </div>
            <button
              onClick={() => openRoom(randomCode(), "create")}
              className="mt-4 w-full h-11 border-2 border-foreground bg-foreground text-background font-bold uppercase text-sm tracking-tight hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)]"
            >
              Create Room →
            </button>
          </div>

          {/* Join Room Card */}
          <div className="atlas-card p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-display text-lg text-foreground">Join Room</h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-terra/15 text-terra border border-terra/30">
                  Guest
                </span>
              </div>
              <label className="text-xs font-bold uppercase tracking-tight text-muted-foreground">
                4-Letter Room code
              </label>
              <input
                ref={joinInputRef}
                value={joinInput}
                maxLength={4}
                onChange={(e) =>
                  setJoinInput(e.target.value.toUpperCase().slice(0, 4))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && joinInput.length === 4 && name.trim()) {
                    openRoom(joinInput, "join");
                  }
                }}
                placeholder="ABCD"
                className="mt-1 mb-3 w-full h-11 border-2 border-foreground bg-card px-3 text-2xl font-black tracking-[0.3em] text-center focus:outline-none"
              />
              <label className="text-xs font-bold uppercase tracking-tight text-muted-foreground">
                Your name
              </label>
              <input
                value={name}
                maxLength={20}
                onChange={(e) => setName(e.target.value.slice(0, 20))}
                className="mt-1 mb-3 w-full h-10 border-2 border-foreground bg-card px-3 text-sm font-medium focus:outline-none"
              />
            </div>
            <button
              onClick={() => joinInput.length === 4 && openRoom(joinInput, "join")}
              disabled={joinInput.length !== 4 || !name.trim()}
              className="mt-4 w-full h-11 border-2 border-foreground bg-terra text-foreground font-bold uppercase text-sm tracking-tight hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform disabled:opacity-40 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)]"
            >
              Join Room →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const me = players.find((p) => p.seat === mySeat);
  const isHost = mySeat === hostSeat;
  const q = questions[currentRound];

  // ---- Finished View ----
  if (status === "finished") {
    return (
      <div className="mx-auto max-w-2xl px-3 sm:px-4 py-6">
        <div className="atlas-card grid-paper p-6 sm:p-8 text-center">
          <div className="inline-flex w-12 h-12 border-2 border-foreground bg-gold items-center justify-center mb-2 brutal-shadow">
            <Crown className="w-6 h-6 text-foreground" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-foreground">
            Battle Over
          </h1>
          <p className="mt-1 text-sm font-semibold text-terra">
            Match time · {formatElapsedTime(elapsedMs)}
          </p>

          <div className="mt-6 space-y-2.5 text-left">
            {(results || []).map((r) => (
              <div
                key={r.seat}
                className={cn(
                  "flex items-center gap-3 border-2 border-foreground px-4 py-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]",
                  r.rank === 1 ? "bg-terra font-bold text-foreground" : "bg-card",
                )}
              >
                <span className="font-display text-2xl w-8">
                  #{r.rank}
                </span>
                <span className="flex-1 font-bold uppercase tracking-tight truncate">
                  {r.name}
                  {r.seat === mySeat && " (you)"}
                </span>
                <span className="text-sm font-bold">{r.correct} correct</span>
                <span className="text-sm font-black text-foreground">
                  {r.score} pts
                </span>
                <span className="text-xs text-muted-foreground">
                  {r.averageAnswerMs
                    ? `${(r.averageAnswerMs / 1000).toFixed(1)}s avg`
                    : "—"}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 justify-center mt-7">
            <button
              onClick={() => roomRef.current?.send({ type: "rematch" })}
              className="inline-flex items-center gap-2 border-2 border-foreground bg-foreground text-background px-5 h-11 text-sm font-bold uppercase tracking-tight shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform"
            >
              <RotateCcw className="w-4 h-4" /> Rematch
            </button>
            <Link
              to="/"
              className="inline-flex items-center border-2 border-foreground bg-card px-5 h-11 text-sm font-bold uppercase tracking-tight shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform"
            >
              Back to map
            </Link>
          </div>
        </div>

        <FeedbackInvite />
      </div>
    );
  }

  // ---- Lobby View ----
  if (status === "lobby") {
    const notReadyCount = players.filter((p) => !p.ready).length;
    const allReady = notReadyCount === 0 && players.length >= 2;
    const iAmReady = Boolean(me?.ready);

    return (
      <div className="mx-auto max-w-2xl px-3 sm:px-4 py-6">
        {/* Room Code Card */}
        <div className="atlas-card p-6 sm:p-7 text-center mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">
              Room Code
            </span>
            {/* Live Room Lock Badge */}
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border-2 border-foreground",
                roomLocked
                  ? "bg-destructive text-white"
                  : "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300",
              )}
            >
              {roomLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              {roomLocked ? "Locked" : "Open"}
            </span>
          </div>

          <div className="flex items-center justify-center gap-3 mt-1">
            <span className="font-display text-5xl sm:text-6xl tracking-[0.2em] text-foreground">
              {code}
            </span>
            <button
              onClick={copyCode}
              className="border-2 border-foreground bg-terra w-11 h-11 inline-flex items-center justify-center hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              aria-label="Copy code"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>

          <p className="text-xs text-muted-foreground mt-2 font-medium">
            Share this code with friends. Up to {MAX_PLAYERS} players can join.
          </p>

          <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => setQrZoom(true)}
              title="Tap to zoom"
              aria-label="Zoom QR code"
              className="group relative bg-white p-2 border-2 border-foreground cursor-zoom-in transition-transform hover:scale-[1.03] active:scale-[0.98] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <QRCodeSVG value={inviteUrl()} size={84} level="M" includeMargin={false} />
              <span className="pointer-events-none absolute inset-0 flex items-end justify-center pb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="bg-foreground text-background text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5">
                  Zoom
                </span>
              </span>
            </button>
            <button
              onClick={copyInviteLink}
              className="inline-flex items-center justify-center gap-2 border-2 border-foreground bg-card px-4 h-10 text-xs font-bold uppercase tracking-tight shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <QrCode className="w-4 h-4" /> {copied ? "Copied!" : "Copy invite link"}
            </button>
          </div>
        </div>

        {/* Players Card */}
        <div className="atlas-card p-5 mb-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-foreground" />
              <h2 className="font-display text-lg text-foreground">
                Players ({players.length}/{MAX_PLAYERS})
              </h2>
            </div>
            {isHost && (
              <button
                type="button"
                onClick={() =>
                  roomRef.current?.send({ type: "lock", locked: !roomLocked })
                }
                disabled={!connected}
                aria-pressed={roomLocked}
                title={
                  roomLocked
                    ? "Unlock room to allow new players"
                    : "Lock the room so no one else can join"
                }
                className={cn(
                  "inline-flex items-center gap-1.5 border-2 border-foreground px-3 py-1.5 text-xs font-black uppercase tracking-tight transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                  roomLocked
                    ? "bg-destructive text-white hover:bg-destructive/90"
                    : "bg-card hover:bg-muted text-foreground",
                )}
              >
                {roomLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                {roomLocked ? "Unlock Room" : "Lock Room"}
              </button>
            )}
          </div>

          {connectionError && (
            <div className="mb-3 flex items-center gap-2 border-2 border-destructive bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{connectionError}</span>
            </div>
          )}

          <ul className="space-y-2">
            {players.map((p) => (
              <li
                key={p.seat}
                className={cn(
                  "flex items-center gap-2.5 border-2 border-foreground px-3 py-2.5 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]",
                  p.ready ? "bg-forest/10 border-l-4 border-l-forest" : "bg-card",
                )}
              >
                <span className="w-6 h-6 border-2 border-foreground bg-terra inline-flex items-center justify-center text-xs font-bold shrink-0">
                  {p.seat}
                </span>
                <span className="font-bold uppercase tracking-tight text-sm truncate">
                  {p.name || `Player ${p.seat}`}
                </span>
                {p.seat === hostSeat && (
                  <span
                    className="inline-flex items-center gap-1 border border-foreground bg-gold px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider shrink-0"
                    title="Room host"
                  >
                    <Crown className="w-3 h-3" /> Host
                  </span>
                )}
                {p.seat === mySeat && (
                  <span className="text-xs text-muted-foreground font-semibold">(you)</span>
                )}
                <span
                  className={cn(
                    "ml-auto inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider shrink-0",
                    p.ready ? "text-forest" : "text-muted-foreground",
                  )}
                >
                  {p.ready ? <Check className="w-3.5 h-3.5" /> : <Circle className="w-3 h-3" />}
                  {p.ready ? "Ready" : "Not ready"}
                </span>
                {isHost && p.seat !== mySeat && (
                  <button
                    type="button"
                    onClick={() => roomRef.current?.send({ type: "kick", seat: p.seat })}
                    className="inline-flex items-center gap-1 border border-destructive px-2 py-1 text-[10px] font-bold uppercase text-destructive hover:bg-destructive hover:text-destructive-foreground shrink-0"
                    aria-label={`Remove ${p.name}`}
                  >
                    <UserMinus className="w-3 h-3" /> Remove
                  </button>
                )}
              </li>
            ))}
            {players.length < MAX_PLAYERS && (
              <li className="text-xs text-muted-foreground font-semibold px-2 py-1">
                {roomLocked
                  ? "Room is locked — no new players can join."
                  : `${MAX_PLAYERS - players.length} more players can join with code ${code}…`}
              </li>
            )}
          </ul>

          {notice && (
            <p role="status" className="mt-3 border border-foreground/30 bg-muted px-3 py-2 text-xs font-bold text-foreground">
              {notice}
            </p>
          )}
        </div>

        {/* Setup Card */}
        <div className="atlas-card p-5 mb-5">
          <h2 className="font-display text-lg text-foreground mb-3">Setup</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-tight text-muted-foreground">
                Region
              </label>
              <select
                value={roomRegion}
                disabled={!isHost || !connected}
                onChange={(e) =>
                  roomRef.current?.send({
                    type: "configure",
                    region: e.target.value,
                    rounds: roomRounds,
                  })
                }
                className="mt-1 w-full h-10 border-2 border-foreground bg-card px-2 text-sm font-medium focus:outline-none"
              >
                <option value="World">World · all 197 countries</option>
                {PLAYABLE_REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-tight text-muted-foreground">
                <span>Rounds</span>
                <span className="text-foreground">{roomRounds} flags</span>
              </div>
              <input
                type="range"
                min={5}
                max={20}
                value={roomRounds}
                disabled={!isHost || !connected}
                onChange={(e) =>
                  roomRef.current?.send({
                    type: "configure",
                    region: roomRegion,
                    rounds: Number(e.target.value),
                  })
                }
                className="w-full mt-3 accent-foreground"
              />
            </div>
          </div>
        </div>

        {/* Start / Ready Buttons */}
        {isHost ? (
          <div className="space-y-3">
            <button
              onClick={() => roomRef.current?.send({ type: "start" })}
              disabled={!allReady || !connected}
              className="w-full h-12 border-2 border-foreground bg-foreground text-background font-bold uppercase tracking-tight hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform disabled:opacity-40 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            >
              <span className="inline-flex items-center gap-2">
                <Play className="w-4 h-4" /> Start Battle
              </span>
            </button>
            {players.length < 2 ? (
              <p className="text-xs text-muted-foreground text-center font-medium">
                Need at least 2 players to start the battle.
              </p>
            ) : !allReady ? (
              <p className="text-xs text-muted-foreground text-center font-medium">
                Waiting for {notReadyCount} player{notReadyCount > 1 ? "s" : ""} to ready up…
              </p>
            ) : (
              <p className="text-xs text-forest text-center font-bold">
                Everyone is ready — click Start Battle!
              </p>
            )}
            <button
              type="button"
              onClick={() => roomRef.current?.send({ type: "closeRoom" })}
              disabled={!connected}
              className="w-full h-10 border-2 border-destructive/70 text-destructive font-bold uppercase tracking-tight text-xs hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-40"
            >
              <span className="inline-flex items-center gap-2">
                <DoorClosed className="w-4 h-4" /> Close room for everyone
              </span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => roomRef.current?.send({ type: "ready", ready: !iAmReady })}
              disabled={!connected}
              aria-pressed={iAmReady}
              className={cn(
                "w-full h-12 border-2 border-foreground font-bold uppercase tracking-tight transition-all disabled:opacity-40 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
                iAmReady
                  ? "bg-forest text-white hover:opacity-90"
                  : "bg-gold text-foreground hover:-translate-x-0.5 hover:-translate-y-0.5",
              )}
            >
              <span className="inline-flex items-center gap-2">
                {iAmReady ? <Check className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {iAmReady ? "Ready — tap to unready" : "I'm ready"}
              </span>
            </button>
            <p className="text-xs text-muted-foreground text-center font-medium">
              {iAmReady
                ? "Waiting for host to start battle."
                : "Tap ready when prepared — the host starts the battle."}
            </p>
            <button
              type="button"
              onClick={() => roomRef.current?.send({ type: "leave" })}
              disabled={!connected}
              className="w-full h-10 border-2 border-destructive/70 text-destructive font-bold uppercase tracking-tight text-xs hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-40"
            >
              <span className="inline-flex items-center gap-2">
                <LogOut className="w-4 h-4" /> Leave room
              </span>
            </button>
          </div>
        )}

        {/* QR Zoom Overlay */}
        {qrZoom && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Room invite QR code"
            onClick={() => setQrZoom(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4 cursor-zoom-out"
          >
            <div
              className="bg-white p-4 border-2 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)] max-w-[min(90vw,380px)]"
              onClick={(e) => e.stopPropagation()}
            >
              <QRCodeSVG
                value={inviteUrl()}
                size={300}
                level="M"
                includeMargin={false}
                className="w-full h-auto"
              />
              <p className="text-center text-xs font-black uppercase tracking-wider text-foreground mt-3">
                Scan to join room {code}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setQrZoom(false)}
              aria-label="Close QR code"
              className="absolute top-4 right-4 w-10 h-10 inline-flex items-center justify-center border-2 border-foreground bg-card text-foreground hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // ---- Playing View: Synchronized Round Quiz ----
  const answeredCount = players.filter((p) => p.hasAnswered).length;
  const isReveal = roundPhase === "reveal";
  const timerPercent = Math.max(0, Math.min(100, (timeLeftMs / roundDurationMs) * 100));

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-4 py-5 sm:py-6">
      <div className="grid lg:grid-cols-[1fr_260px] gap-4 sm:gap-5">
        <div>
          {/* Header Strip */}
          <div className="flex items-center justify-between mb-3 text-xs sm:text-sm font-bold uppercase tracking-tight">
            <span className="text-muted-foreground font-black">
              Round {Math.min(currentRound + 1, questions.length)} / {questions.length}
            </span>
            <span className="text-foreground font-black">
              {me?.correct || 0} Correct · {me?.score || 0} Pts
            </span>
            <span className="text-terra font-black">
              Time · {formatElapsedTime(elapsedMs)}
            </span>
          </div>

          {/* Question & Flag Card */}
          <div className="atlas-card p-4 sm:p-6 overflow-hidden">
            {/* Round Synchronized Progress Timer Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider mb-1">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Timer className="w-3.5 h-3.5 text-terra" />
                  {isReveal ? (
                    <span className="text-forest font-black">Round Complete</span>
                  ) : (
                    <span>Time Left</span>
                  )}
                </span>
                <span className={cn(
                  "font-mono font-black",
                  timeLeftMs < 3000 ? "text-destructive animate-pulse" : "text-foreground"
                )}>
                  {isReveal ? "Next flag in 2s" : `${(timeLeftMs / 1000).toFixed(1)}s`}
                </span>
              </div>
              <div className="h-2.5 w-full border-2 border-foreground bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-100 ease-linear",
                    isReveal
                      ? "bg-forest w-full"
                      : timerPercent < 25
                        ? "bg-destructive"
                        : "bg-terra",
                  )}
                  style={{ width: isReveal ? "100%" : `${timerPercent}%` }}
                />
              </div>
            </div>

            {/* Flag Display */}
            <div className="mx-auto max-w-md aspect-[3/2] border-2 border-foreground bg-muted overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)]">
              {q ? (
                <FlagImage code={q.flag} className="w-full h-full object-cover" />
              ) : null}
            </div>

            {/* Round Status Prompts */}
            <div className="text-center mt-3 min-h-[44px] flex flex-col items-center justify-center">
              {isReveal ? (
                <div className="space-y-0.5 animate-fadeIn">
                  <div className="inline-flex items-center gap-1.5 font-display text-lg sm:text-xl text-forest font-black">
                    <Check className="w-5 h-5 stroke-[3]" />
                    <span>{byCode(q?.flag)?.name || q?.flag}</span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {me?.lastPoints > 0 ? (
                      <span className="text-forest">+{me.lastPoints} Points Earned!</span>
                    ) : (
                      <span className="text-destructive">Missed this flag</span>
                    )}
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-foreground">
                    Which country does this flag belong to?
                  </p>
                  <p className="text-xs text-muted-foreground font-semibold">
                    {picked ? (
                      <span className="text-terra font-bold">
                        Answer locked in! Waiting for other players… ({answeredCount}/{players.length})
                      </span>
                    ) : (
                      <span>Tap your answer before the timer expires</span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Synchronized 4 Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
              {q?.options.map((opt) => {
                const isPicked = picked === opt;
                const isCorrect = opt === q.flag;

                let buttonStyle = "bg-card hover:-translate-x-0.5 hover:-translate-y-0.5 text-foreground";
                if (isReveal) {
                  if (isCorrect) {
                    buttonStyle = "bg-emerald-500/25 border-emerald-600 dark:border-emerald-400 text-emerald-950 dark:text-emerald-100 font-black";
                  } else if (isPicked && !isCorrect) {
                    buttonStyle = "bg-destructive/20 border-destructive text-destructive line-through";
                  } else {
                    buttonStyle = "opacity-40 bg-card text-muted-foreground";
                  }
                } else if (isPicked) {
                  buttonStyle = "bg-terra text-foreground font-black -translate-x-0.5 -translate-y-0.5";
                }

                return (
                  <button
                    key={opt}
                    data-sound={isCorrect ? "success" : "error"}
                    disabled={isReveal || picked !== null}
                    onClick={() => answer(opt)}
                    className={cn(
                      "h-12 border-2 border-foreground px-3 text-sm font-bold uppercase tracking-tight transition-all flex items-center justify-between shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] disabled:cursor-default",
                      buttonStyle,
                    )}
                  >
                    <span className="truncate">{byCode(opt)?.name || opt}</span>
                    {isReveal && isCorrect && (
                      <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-300 shrink-0" />
                    )}
                    {isReveal && isPicked && !isCorrect && (
                      <X className="w-4 h-4 text-destructive shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Standings Sidebar */}
        <aside className="atlas-card p-4 h-fit">
          <div className="flex items-center justify-between mb-3 border-b-2 border-foreground/15 pb-2">
            <h3 className="font-display text-base text-foreground">
              Live Standings
            </h3>
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              {answeredCount}/{players.length} answered
            </span>
          </div>

          <ul className="space-y-2.5">
            {[...players]
              .sort((a, b) => b.score - a.score || b.correct - a.correct)
              .map((p, idx) => (
                <li
                  key={p.seat}
                  className={cn(
                    "border-2 border-foreground px-3 py-2.5 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                    p.seat === mySeat ? "bg-terra/15 border-terra" : "bg-card",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-foreground bg-terra inline-flex items-center justify-center text-[10px] font-black">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-tight truncate flex-1">
                      {p.name || `Player ${p.seat}`}
                      {p.seat === mySeat && " (you)"}
                    </span>
                    <span className="text-xs font-black text-foreground">
                      {p.score} pts
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1.5 text-[11px] font-bold">
                    <span className="text-muted-foreground">
                      {p.correct} correct
                    </span>
                    {isReveal ? (
                      <span
                        className={cn(
                          "text-[10px] font-black uppercase",
                          p.lastPoints > 0 ? "text-forest" : "text-destructive",
                        )}
                      >
                        {p.lastPoints > 0 ? `+${p.lastPoints} pts` : "Missed"}
                      </span>
                    ) : (
                      <span
                        className={cn(
                          "text-[10px] font-black uppercase flex items-center gap-1",
                          p.hasAnswered ? "text-forest" : "text-muted-foreground",
                        )}
                      >
                        {p.hasAnswered ? <Check className="w-3 h-3" /> : <Circle className="w-2.5 h-2.5" />}
                        {p.hasAnswered ? "Answered" : "Thinking"}
                      </span>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        </aside>
      </div>

      {notice && (
        <div
          role="status"
          className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 border-2 border-foreground bg-card px-4 py-2 text-sm font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
        >
          {notice}
        </div>
      )}
    </div>
  );
}
