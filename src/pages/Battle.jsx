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

const MAX_PLAYERS = 5;

/*
 * Multiplayer transport — Word Rush architecture, zero backend.
 *
 * The host player's browser runs the authoritative BattleEngine and announces
 * the room over PeerJS's free signaling broker; the guest connects directly to
 * the host via a WebRTC data channel. All game traffic is peer-to-peer, so
 * this works on any static host (Vercel) with no server to deploy.
 *
 * Trade-off (same as Word Rush): the host tab IS the server — if the host
 * closes the tab, the room ends.
 */

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
  const [joinInput, setJoinInput] = useState(() => (searchParams.get("room") || "").toUpperCase().slice(0, 4));
  const [region, setRegion] = useState("World");
  const [rounds, setRounds] = useState(10);
  const [copied, setCopied] = useState(false);

  const [status, setStatus] = useState("lobby");
  const [players, setPlayers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [roomRegion, setRoomRegion] = useState("World");
  const [roomRounds, setRoomRounds] = useState(10);
  const [hostSeat, setHostSeat] = useState(1);
  const [mySeat, setMySeat] = useState(null);
  const [results, setResults] = useState(null);
  const [roomLocked, setRoomLocked] = useState(false);
  const [myIndex, setMyIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [roomMode, setRoomMode] = useState(null);
  const [connectionError, setConnectionError] = useState("");
  const [connected, setConnected] = useState(false);
  const [notice, setNotice] = useState("");
  const [qrZoom, setQrZoom] = useState(false);
  const roomRef = useRef(null);
  const answerLockedRef = useRef(false);
  const questionStartedAtRef = useRef(Date.now());
  const elapsedMs = useElapsedTimer(status === "playing", `${code || ""}-${status}`);

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
          if (message.type === "error") setConnectionError(message.message);
          if (message.type === "kicked") {
            setConnectionError("The host removed you from this room.");
            setCode(null);
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
          }
          if (message.type === "finished") setResults(message.results);
        }),
      );
      link.onClose = () => {
        if (!disposed) setConnected(false);
      };
    };

    const joinMsg = {
      type: "join",
      code,
      name,
      create: roomMode === "create",
      region,
      rounds,
    };

    async function connect() {
      if (roomMode === "create") {
        // Host: engine runs in this tab; peers dial in via PeerJS.
        bind(createPeerHostLink({ code, name, region, rounds }));
        return;
      }
      // Guest: dial the host's peer id directly over WebRTC.
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
            "Could not reach the room host. Make sure they still have the room open, then try again.",
          );
          setConnected(false);
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

  useEffect(() => {
    const player = players.find((entry) => entry.seat === mySeat);
    if (player) setMyIndex(player.index);
  }, [players, mySeat]);

  useEffect(() => {
    if (status !== "playing") return;
    answerLockedRef.current = false;
    questionStartedAtRef.current = Date.now();
  }, [status, myIndex]);

  function answer(opt) {
    if (picked || answerLockedRef.current || !roomRef.current || !q) return;
    answerLockedRef.current = true;
    setPicked(opt);
    const correct = opt === q.flag;
    record(q.flag, {
      correct,
      quality: correct ? 5 : 2,
      xpGain: correct ? 5 : 0,
      timeMs: Date.now() - questionStartedAtRef.current,
    });
    roomRef.current.send({ type: "answer", choice: opt });
    setTimeout(() => setPicked(null), 350);
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

  // ---- Menu ----
  if (!code) {
    return (
      <div className="mx-auto max-w-3xl px-3 sm:px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 border-2 border-foreground bg-card px-3 h-9 text-sm font-bold uppercase tracking-tight"
          >
            <ArrowLeft className="w-4 h-4" /> Map
          </Link>
          <span className="text-xs font-bold uppercase tracking-tight text-muted-foreground">
            Multiplayer Battle
          </span>
        </div>

        <div className="atlas-card grid-paper p-6 sm:p-8 mb-5">
          <div className="inline-flex w-12 h-12 border-2 border-foreground bg-gold items-center justify-center mb-3 brutal-shadow">
            <Swords className="w-6 h-6 text-foreground" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-foreground">
            Flag Battle
          </h1>
          <p className="text-muted-foreground mt-2 font-medium max-w-md">
            Create a room, share the code with a friend, and race through flags.
            Most correct wins — ties go to the fastest finisher.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
          <div className="atlas-card p-5">
            <h2 className="font-display text-xl text-foreground mb-3">
              Create
            </h2>
            <label className="text-xs font-bold uppercase tracking-tight text-muted-foreground">
              Your name
            </label>
            <input
              value={name}
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
            <label className="text-xs font-bold uppercase tracking-tight text-muted-foreground">
              Rounds: {rounds}
            </label>
            <input
              type="range"
              min={5}
              max={20}
              value={rounds}
              onChange={(e) => setRounds(Number(e.target.value))}
              className="w-full mt-2 mb-4 accent-foreground"
            />
            <p className="-mt-2 mb-4 text-xs text-muted-foreground">World uses a random mix from all 197 countries.</p>
            <button
              onClick={() => openRoom(randomCode(), "create")}
              className="w-full h-11 border-2 border-foreground bg-foreground text-background font-bold uppercase text-sm tracking-tight hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform"
            >
              Create room →
            </button>
          </div>

          <div className="atlas-card p-5">
            <h2 className="font-display text-xl text-foreground mb-3">Join</h2>
            <label className="text-xs font-bold uppercase tracking-tight text-muted-foreground">
              Room code
            </label>
            <input
              value={joinInput}
              onChange={(e) =>
                setJoinInput(e.target.value.toUpperCase().slice(0, 4))
              }
              placeholder="ABCD"
              className="mt-1 mb-3 w-full h-12 border-2 border-foreground bg-card px-3 text-2xl font-bold tracking-[0.3em] text-center focus:outline-none"
            />
            <label className="text-xs font-bold uppercase tracking-tight text-muted-foreground">
              Your name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 20))}
              className="mt-1 mb-4 w-full h-10 border-2 border-foreground bg-card px-3 text-sm font-medium focus:outline-none"
            />
            <button
              onClick={() => joinInput.length === 4 && openRoom(joinInput, "join")}
              disabled={joinInput.length !== 4}
              className="w-full h-11 border-2 border-foreground bg-terra font-bold uppercase text-sm tracking-tight hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform disabled:opacity-40"
            >
              Join room →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const me = players.find((p) => p.seat === mySeat);
  const isHost = mySeat === hostSeat;
  const q = questions[myIndex];

  // ---- Finished ----
  if (status === "finished") {
    return (
      <div className="mx-auto max-w-2xl px-3 sm:px-4 py-6">
        <div className="atlas-card grid-paper p-6 sm:p-8 text-center">
          <h1 className="font-display text-3xl sm:text-4xl text-foreground">
            Battle over
          </h1>
          <p className="mt-2 text-sm font-semibold text-terra">Match time · {formatElapsedTime(elapsedMs)}</p>
          <div className="mt-5 space-y-2 text-left">
            {results.map((r) => (
              <div
                key={r.seat}
                className={cn(
                  "flex items-center gap-3 border-2 border-foreground px-4 py-3",
                  r.rank === 1 ? "bg-terra" : "bg-card",
                )}
              >
                <span className="font-display text-2xl text-foreground w-8">
                  #{r.rank}
                </span>
                <span className="flex-1 font-bold uppercase tracking-tight">
                  {r.name}
                </span>
                <span className="text-sm font-bold">{r.correct} correct</span>
                <span className="text-sm text-muted-foreground">
                  {r.score} pts
                </span>
                <span className="text-xs text-muted-foreground">
                  {r.averageAnswerMs ? `${(r.averageAnswerMs / 1000).toFixed(1)}s avg` : "—"}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            <button
              onClick={() => roomRef.current?.send({ type: "rematch" })}
              className="inline-flex items-center gap-2 border-2 border-foreground bg-foreground text-background px-4 h-10 text-sm font-bold uppercase tracking-tight"
            >
              <RotateCcw className="w-4 h-4" /> Rematch
            </button>
            <Link
              to="/"
              className="inline-flex items-center border-2 border-foreground bg-card px-4 h-10 text-sm font-bold uppercase tracking-tight"
            >
              Back to map
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---- Lobby ----
  if (status === "lobby") {
    const notReadyCount = players.filter((p) => !p.ready).length;
    const allReady = notReadyCount === 0 && players.length >= 2;
    const iAmReady = !!me?.ready;
    return (
      <div className="mx-auto max-w-2xl px-3 sm:px-4 py-6">
        <div className="atlas-card p-6 sm:p-8 text-center mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">
            Room code
          </p>
          <div className="flex items-center justify-center gap-3 mt-2">
            <span className="font-display text-5xl sm:text-6xl tracking-[0.2em] text-foreground">
              {code}
            </span>
            <button
              onClick={copyCode}
              className="border-2 border-foreground bg-terra w-11 h-11 inline-flex items-center justify-center"
              aria-label="Copy code"
            >
              {copied ? (
                <Check className="w-5 h-5" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 font-medium">
            Share this code with friends to play. Up to {MAX_PLAYERS} players.
          </p>
          <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => setQrZoom(true)}
              title="Tap to zoom"
              aria-label="Zoom QR code"
              className="group relative bg-white p-2 border-2 border-foreground cursor-zoom-in transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              <QRCodeSVG value={inviteUrl()} size={88} level="M" includeMargin={false} />
              <span className="pointer-events-none absolute inset-0 flex items-end justify-center pb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="bg-foreground text-background text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5">
                  Tap to zoom
                </span>
              </span>
            </button>
            <button
              onClick={copyInviteLink}
              className="inline-flex items-center justify-center gap-2 border-2 border-foreground bg-card px-3 h-10 text-xs font-bold uppercase tracking-tight"
            >
              <QrCode className="w-4 h-4" /> {copied ? "Copied" : "Copy invite link"}
            </button>
          </div>
        </div>

          <div className="atlas-card p-5 mb-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-foreground" />
              <h2 className="font-display text-lg text-foreground">
                Players ({players.length})
              </h2>
            </div>
            {isHost && (
              <button
                type="button"
                onClick={() => roomRef.current?.send({ type: "lock", locked: !roomLocked })}
                disabled={!connected}
                aria-pressed={roomLocked}
                title={roomLocked ? "Unlock room to allow new players" : "Lock the room so no one else can join"}
                className={cn(
                  "inline-flex items-center gap-1.5 border-2 border-foreground px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-tight transition-colors disabled:opacity-40",
                  roomLocked ? "bg-destructive text-white" : "bg-card hover:bg-muted",
                )}
              >
                {roomLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                {roomLocked ? "Locked" : "Open"}
              </button>
            )}
          </div>
          {connectionError && (
            <div className="mb-3 border-2 border-terra bg-terra/10 px-4 py-3 text-sm font-medium text-foreground">
              <span className="font-bold">Connection issue.</span> {connectionError}
            </div>
          )}
          <ul className="space-y-2">
            {players.map((p) => (
              <li
                key={p.seat}
                className={cn(
                  "flex items-center gap-2 border-2 border-foreground px-3 py-2 transition-colors",
                  p.ready ? "bg-forest/10 border-l-4" : "bg-card",
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
                    title="Room host — can edit settings, lock the room, and remove players"
                  >
                    <Crown className="w-3 h-3" /> Host
                  </span>
                )}
                {p.seat === mySeat && (
                  <span className="text-xs text-muted-foreground">(you)</span>
                )}
                <span
                  className={cn(
                    "ml-auto inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider shrink-0",
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
                    aria-label={`Remove ${p.name} from the room`}
                  >
                    <UserMinus className="w-3 h-3" /> Remove
                  </button>
                )}
              </li>
            ))}
            {players.length < MAX_PLAYERS && (
              <li className="text-sm text-muted-foreground font-medium px-1">
                {roomLocked ? "Room is locked — new players can't join." : `${MAX_PLAYERS - players.length} more can join this room…`}
              </li>
            )}
          </ul>
          {notice && (
            <p role="status" className="mt-3 border border-foreground/30 bg-muted px-3 py-2 text-sm font-semibold">
              {notice}
            </p>
          )}
        </div>

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
              <label className="text-xs font-bold uppercase tracking-tight text-muted-foreground">
                Rounds: {roomRounds}
              </label>
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

        {isHost ? (
          <>
            <button
              onClick={() => roomRef.current?.send({ type: "start" })}
              disabled={!allReady || !connected}
              className="w-full h-12 border-2 border-foreground bg-foreground text-background font-bold uppercase tracking-tight hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform disabled:opacity-40"
            >
              <span className="inline-flex items-center gap-2">
                <Play className="w-4 h-4" /> Start battle
              </span>
            </button>
            {players.length < 2 ? (
              <p className="text-xs text-muted-foreground text-center mt-2 font-medium">
                Need at least 2 players to start.
              </p>
            ) : !allReady ? (
              <p className="text-xs text-muted-foreground text-center mt-2 font-medium">
                Waiting for {notReadyCount} player{notReadyCount > 1 ? "s" : ""} to ready up…
              </p>
            ) : (
              <p className="text-xs text-forest text-center mt-2 font-bold">
                Everyone's ready — start the battle!
              </p>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => roomRef.current?.send({ type: "ready", ready: !iAmReady })}
              disabled={!connected}
              aria-pressed={iAmReady}
              className={cn(
                "w-full h-12 border-2 border-foreground font-bold uppercase tracking-tight transition-all disabled:opacity-40",
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
            <p className="text-xs text-muted-foreground text-center mt-2 font-medium">
              {iAmReady
                ? "Waiting for the host to start the battle."
                : "Tap ready when you want to play — the host starts the battle."}
            </p>
          </>
        )}

        {/* QR zoom overlay — tap the small QR to open */}
        {qrZoom && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Room invite QR code"
            onClick={() => setQrZoom(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4 cursor-zoom-out"
          >
            <div
              className="bg-white p-4 border-2 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)] max-w-[min(90vw,420px)]"
              onClick={(e) => e.stopPropagation()}
            >
              <QRCodeSVG value={inviteUrl()} size={320} level="M" includeMargin={false} className="w-full h-auto" />
              <p className="text-center text-xs font-bold uppercase tracking-wider text-foreground mt-3">
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

  // ---- Playing ----
  const done = myIndex >= questions.length;
  const finishedCount = players.filter((p) => p.finished).length;
  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-4 py-5 sm:py-6">
      <div className="grid lg:grid-cols-[1fr_240px] gap-4 sm:gap-5">
        <div>
          <div className="flex items-center justify-between mb-3 text-sm font-bold uppercase tracking-tight">
            <span className="text-muted-foreground">
              Q {Math.min(myIndex + 1, questions.length)}/{questions.length}
            </span>
            <span className="text-foreground">
              {me?.correct || 0} correct · {me?.score || 0} pts
            </span>
            <span className="text-terra">Time · {formatElapsedTime(elapsedMs)}</span>
          </div>
          {done ? (
            <div className="atlas-card grid-paper p-8 text-center">
              <Check className="w-10 h-10 mx-auto text-terra mb-3" />
              <h2 className="font-display text-2xl text-foreground">
                You're done!
              </h2>
              <p className="text-muted-foreground mt-1 font-medium">
                Waiting for {finishedCount}/{players.length} players to finish…
              </p>
            </div>
          ) : (
            <div className="atlas-card p-5 sm:p-6">
              <div className="mx-auto max-w-md aspect-[3/2] border-2 border-foreground bg-muted overflow-hidden">
                <FlagImage code={q.flag} className="w-full h-full" />
              </div>
              <p className="text-center text-sm text-muted-foreground mt-3 font-medium">
                Which country does this flag belong to?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                {q.options.map((opt) => {
                  const isPicked = picked === opt;
                  return (
                    <button
                      key={opt}
                      data-sound={opt === q.flag ? "success" : "error"}
                      onClick={() => answer(opt)}
                      className={cn(
                        "h-12 border-2 border-foreground px-3 text-sm font-bold uppercase tracking-tight transition-all",
                        isPicked
                          ? "bg-terra"
                          : "bg-card hover:-translate-x-0.5 hover:-translate-y-0.5",
                      )}
                    >
                      {byCode(opt)?.name || opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <aside className="atlas-card p-4 h-fit">
          <h3 className="font-display text-base text-foreground mb-3">
            Live standings
          </h3>
          <ul className="space-y-2">
            {players.map((p) => (
              <li
                key={p.seat}
                className="border-2 border-foreground bg-card px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-foreground bg-terra inline-flex items-center justify-center text-[10px] font-bold">
                    {p.seat}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-tight truncate flex-1">
                    {p.name || `Player ${p.seat}`}
                  </span>
                </div>
                <div className="mt-1.5 h-2 border-2 border-foreground bg-background overflow-hidden">
                  <div
                    className="h-full bg-terra"
                    style={{
                      width: `${(p.index / Math.max(1, questions.length)) * 100}%`,
                    }}
                  />
                </div>
                <div className="text-[11px] text-muted-foreground font-bold mt-1">
                  {p.correct} correct ·{" "}
                  {p.finished ? "done" : `${p.index}/${questions.length}`}
                </div>
                {p.answerCount > 0 && (
                  <div className="text-[11px] text-muted-foreground font-medium mt-0.5">
                    Avg {(p.totalAnswerMs / p.answerCount / 1000).toFixed(1)}s
                  </div>
                )}
              </li>
            ))}
          </ul>
        </aside>
      </div>
      {notice && (
        <div role="status" className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 border-2 border-foreground bg-card px-4 py-2 text-sm font-semibold shadow-lg">
          {notice}
        </div>
      )}
    </div>
  );
}
