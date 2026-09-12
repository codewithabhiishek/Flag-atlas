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
} from "lucide-react";
import { byCode } from "@/data/countries";
import { REGIONS } from "@/data/regions";
const PLAYABLE_REGIONS = REGIONS.filter((r) => r.id !== "Antarctica");
import FlagImage from "@/components/FlagImage";
import { cn } from "@/lib/utils";
import { useProgress } from "@/lib/ProgressContext";
import { formatElapsedTime, useElapsedTimer } from "@/hooks/use-elapsed-timer";

const BATTLE_SOCKET_URL = import.meta.env.VITE_BATTLE_WS_URL ||
  (import.meta.env.DEV ? `ws://${window.location.hostname}:8787` : "");

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
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 4; i++)
    s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}
function getConnId() {
  let id = sessionStorage.getItem("fa_conn");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("fa_conn", id);
  }
  return id;
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
  const [myIndex, setMyIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [roomMode, setRoomMode] = useState(null);
  const [connectionError, setConnectionError] = useState("");
  const [connected, setConnected] = useState(false);
  const [notice, setNotice] = useState("");
  const roomRef = useRef(null);
  const answerLockedRef = useRef(false);
  const questionStartedAtRef = useRef(Date.now());
  const elapsedMs = useElapsedTimer(status === "playing", `${code || ""}-${status}`);

  useEffect(() => {
    if (!code) return;
    if (!BATTLE_SOCKET_URL) {
      setConnectionError("Multiplayer is not configured for this deployment yet.");
      return;
    }
    const socket = new WebSocket(BATTLE_SOCKET_URL);
    roomRef.current = {
      send: (message) => {
        if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
      },
    };
    socket.addEventListener("open", () => {
      setConnected(true);
      setConnectionError("");
      socket.send(JSON.stringify({
        type: "join",
        code,
        name,
        create: roomMode === "create",
        region,
        rounds,
        connectionId: getConnId(),
      }));
    });
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "joined") setMySeat(message.seat);
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
      }
      if (message.type === "finished") setResults(message.results);
    });
    socket.addEventListener("error", () => setConnectionError("Could not reach the multiplayer server."));
    socket.addEventListener("close", () => setConnected(false));
    return () => {
      socket.close();
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
            Share this code with a friend to play.
          </p>
          <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <div className="bg-white p-2 border-2 border-foreground" title="Scan to join this room">
              <QRCodeSVG value={inviteUrl()} size={88} level="M" includeMargin={false} />
            </div>
            <button
              onClick={copyInviteLink}
              className="inline-flex items-center justify-center gap-2 border-2 border-foreground bg-card px-3 h-10 text-xs font-bold uppercase tracking-tight"
            >
              <QrCode className="w-4 h-4" /> {copied ? "Copied" : "Copy invite link"}
            </button>
          </div>
        </div>

          <div className="atlas-card p-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-foreground" />
            <h2 className="font-display text-lg text-foreground">
              Players ({players.length})
            </h2>
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
                className="flex items-center gap-2 border-2 border-foreground bg-card px-3 py-2"
              >
                <span className="w-6 h-6 border-2 border-foreground bg-terra inline-flex items-center justify-center text-xs font-bold">
                  {p.seat}
                </span>
                <span className="font-bold uppercase tracking-tight text-sm">
                  {p.name || `Player ${p.seat}`}
                </span>
                {p.seat === mySeat && (
                  <span className="text-xs text-muted-foreground">(you)</span>
                )}
                {isHost && p.seat !== mySeat && (
                  <button
                    type="button"
                    onClick={() => roomRef.current?.send({ type: "kick", seat: p.seat })}
                    className="ml-auto inline-flex items-center gap-1 border border-destructive px-2 py-1 text-[10px] font-bold uppercase text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <UserMinus className="w-3 h-3" /> Remove
                  </button>
                )}
              </li>
            ))}
            {players.length < 2 && (
              <li className="text-sm text-muted-foreground font-medium px-1">
                Waiting for an opponent to join…
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

        <button
          onClick={() => roomRef.current?.send({ type: "start" })}
          disabled={players.length < 2 || !isHost || !connected}
          className="w-full h-12 border-2 border-foreground bg-foreground text-background font-bold uppercase tracking-tight hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform disabled:opacity-40"
        >
          <span className="inline-flex items-center gap-2">
            <Play className="w-4 h-4" /> Start battle
          </span>
        </button>
        {!isHost && players.length >= 2 && (
          <p className="text-xs text-muted-foreground text-center mt-2 font-medium">Waiting for the host to start the battle.</p>
        )}
        {players.length < 2 && (
          <p className="text-xs text-muted-foreground text-center mt-2 font-medium">
            Need at least 2 players to start.
          </p>
        )}
      </div>
    );
  }

  // ---- Playing ----
  const done = myIndex >= questions.length;
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
                Waiting for the opponent to finish…
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
