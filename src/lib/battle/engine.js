/**
 * FlagAtlas authoritative battle engine — browser edition.
 *
 * Runs locally inside the host player's browser (Word Rush architecture).
 * Synchronized round-by-round quiz: every player receives and plays the EXACT
 * same flag at the EXACT same time. When all active players lock in an answer
 * (or the 12-second round timer expires), a brief 2.5-second reveal displays
 * the correct country and earned points before everyone advances together.
 *
 * Wire protocol:
 * - Clients send: { type: "join" | "ready" | "configure" | "lock" | "start" | "answer" | "kick" | "leave" | "closeRoom" | "rematch" }
 * - Engine responds: { type: "joined" | "state" | "notice" | "error" | "finished" | "kicked" | "leftRoom" | "roomClosed" }
 */

import { COUNTRIES, pickOptions } from "../../data/countries.js";

const MAX_PLAYERS = 5;
const SEATS = [1, 2, 3, 4, 5];
const ROOM_PURGE_MS = 90_000;
export const ROUND_DURATION_MS = 12_000;
export const REVEAL_DURATION_MS = 2_500;

function makeQuestions(region, rounds) {
  const candidates =
    region === "World" ? COUNTRIES : COUNTRIES.filter((c) => c.region === region);
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  return shuffled
    .slice(0, Math.min(rounds, candidates.length))
    .map((country) => ({
      flag: country.code,
      options: pickOptions(
        country.code,
        region === "World" ? null : region,
        4,
      ).map((o) => o.code),
    }));
}

export class BattleEngine {
  /**
   * @param {{ send: (connId: string, msg: object) => void }} io
   *        send() delivers message to that connection. Local host is "host-local".
   */
  constructor(io) {
    this.io = io;
    this.rooms = new Map(); // code -> room
    this.conns = new Map(); // connId -> { roomCode, seat, lastSeen }
    this.purgeTimer = null;
  }

  /* ---------------- inbox ---------------- */

  handle(connId, msg) {
    if (!msg || typeof msg !== "object" || typeof msg.type !== "string") return;

    if (msg.type === "ping") {
      this.io.send(connId, { type: "pong" });
      return;
    }

    if (msg.type === "join") {
      this.actionJoin(connId, msg);
      return;
    }

    const conn = this.conns.get(connId);
    if (!conn) return this.fail(connId, "Join a room first.", "NOT_JOINED");

    const room = this.rooms.get(conn.roomCode);
    if (!room) return this.fail(connId, "This room no longer exists.", "ROOM_NOT_FOUND");

    switch (msg.type) {
      case "configure":
        this.actionConfigure(conn, room, msg);
        return;
      case "ready":
        this.actionReady(conn, room, msg);
        return;
      case "lock":
        this.actionLock(conn, room, msg);
        return;
      case "start":
        this.actionStart(conn, room);
        return;
      case "answer":
        this.actionAnswer(conn, room, msg);
        return;
      case "kick":
        this.actionKick(conn, room, msg);
        return;
      case "leave":
        this.actionLeave(conn, room);
        return;
      case "closeRoom":
        this.actionCloseRoom(conn, room);
        return;
      case "rematch":
        this.actionRematch(room);
        return;
      default:
        return;
    }
  }

  /* ---------------- actions ---------------- */

  actionJoin(connId, msg) {
    const code = String(msg.code || "").toUpperCase();
    const creating = Boolean(msg.create);

    if (!/^[A-Z2-9]{4}$/.test(code)) {
      return this.fail(connId, "Enter a valid 4-letter room code.", "INVALID_CODE");
    }
    if (this.conns.has(connId)) {
      return this.fail(connId, "Already connected to a room.", "ALREADY_CONNECTED");
    }

    let room = this.rooms.get(code);
    if (!room && !creating) {
      return this.fail(
        connId,
        "This room does not exist. Check the code and try again.",
        "ROOM_NOT_FOUND",
      );
    }

    if (!room) {
      room = {
        code,
        region: msg.region || "World",
        rounds: Math.max(5, Math.min(20, Number(msg.rounds) || 10)),
        status: "lobby", // "lobby" | "playing" | "finished"
        roundPhase: "lobby", // "lobby" | "question" | "reveal" | "finished"
        hostSeat: 1,
        locked: false,
        players: new Map(), // seat -> player
        questions: [],
        results: [],
        currentRound: 0,
        roundStartedAt: 0,
        roundDurationMs: ROUND_DURATION_MS,
        roundTimer: null,
        revealTimer: null,
        createdAt: Date.now(),
      };
      this.rooms.set(code, room);
    }

    if (room.status !== "lobby") {
      return this.fail(connId, "This battle has already started.", "ALREADY_STARTED");
    }
    if (room.locked && !creating) {
      return this.fail(connId, "This room is locked by the host.", "ROOM_LOCKED");
    }
    if (room.players.size >= MAX_PLAYERS) {
      return this.fail(connId, "This room is full (5 players maximum).", "ROOM_FULL");
    }

    const seat = SEATS.find((s) => !room.players.has(s));
    const cleanName =
      String(msg.name || "")
        .trim()
        .replace(/<[^>]*>?/gm, "")
        .slice(0, 20) || `Player ${seat}`;

    const player = {
      seat,
      name: cleanName,
      correct: 0,
      score: 0,
      totalAnswerMs: 0,
      answerCount: 0,
      lastAnswerMs: 0,
      currentAnswer: null,
      hasAnswered: false,
      lastPoints: 0,
      // Word Rush rule: the host is implicitly always ready.
      ready: Boolean(creating),
      connId,
    };

    room.players.set(seat, player);
    this.conns.set(connId, { roomCode: code, seat, lastSeen: Date.now() });

    this.io.send(connId, { type: "joined", seat });
    this.broadcast(room);
    this.announce(
      room,
      creating ? `${player.name} created room ${code}.` : `${player.name} joined the room.`,
    );
    this.schedulePurgeSweep();
  }

  actionConfigure(conn, room, msg) {
    if (conn.seat !== room.hostSeat || room.status !== "lobby") return;
    const region = String(msg.region || "World");
    const eligible =
      region === "World"
        ? COUNTRIES
        : COUNTRIES.filter((c) => c.region === region);
    if (!eligible.length) return;
    room.region = region;
    room.rounds = Math.max(5, Math.min(20, Number(msg.rounds) || 10));
    this.broadcast(room);
  }

  actionReady(conn, room, msg) {
    if (room.status !== "lobby") return;
    const player = room.players.get(conn.seat);
    if (!player) return;
    if (conn.seat === room.hostSeat) {
      player.ready = true;
      return;
    }
    player.ready = msg.ready === true;
    this.broadcast(room);
  }

  actionLock(conn, room, msg) {
    if (conn.seat !== room.hostSeat || room.status !== "lobby") return;
    room.locked = msg.locked === true;
    this.broadcast(room);
    this.announce(
      room,
      room.locked
        ? "Room locked — no new players can join."
        : "Room unlocked — new players can join.",
    );
  }

  actionStart(conn, room) {
    if (conn.seat !== room.hostSeat) {
      return this.fail(conn.connId, "Only the room host can start the battle.");
    }
    if (room.players.size < 2) {
      return this.fail(conn.connId, "At least two players are required to start.");
    }
    const notReady = [...room.players.values()].filter((p) => !p.ready);
    if (notReady.length > 0) {
      return this.fail(
        conn.connId,
        `Waiting for ${notReady.map((p) => p.name).join(", ")} to ready up.`,
      );
    }

    this.clearRoomTimers(room);
    room.questions = makeQuestions(room.region, room.rounds);
    room.status = "playing";
    room.currentRound = 0;

    for (const p of room.players.values()) {
      Object.assign(p, {
        correct: 0,
        score: 0,
        totalAnswerMs: 0,
        answerCount: 0,
        lastAnswerMs: 0,
        currentAnswer: null,
        hasAnswered: false,
        lastPoints: 0,
      });
    }

    this.announce(room, "Battle started — good luck!");
    this.startRound(room);
  }

  startRound(room) {
    this.clearRoomTimers(room);
    room.roundPhase = "question";
    room.roundStartedAt = Date.now();
    room.roundDurationMs = ROUND_DURATION_MS;

    for (const p of room.players.values()) {
      p.currentAnswer = null;
      p.hasAnswered = false;
      p.lastPoints = 0;
    }

    this.broadcast(room);

    // Auto-reveal when round duration expires
    room.roundTimer = setTimeout(() => {
      this.revealRound(room);
    }, ROUND_DURATION_MS);
  }

  actionAnswer(conn, room, msg) {
    if (room.status !== "playing" || room.roundPhase !== "question") return;
    const player = room.players.get(conn.seat);
    if (!player || player.hasAnswered) return;

    const question = room.questions[room.currentRound];
    if (!question || !question.options.includes(msg.choice)) return;

    const answerMs = Math.max(0, Date.now() - room.roundStartedAt);
    player.lastAnswerMs = answerMs;
    player.totalAnswerMs += answerMs;
    player.answerCount += 1;
    player.currentAnswer = msg.choice;
    player.hasAnswered = true;

    const isCorrect = msg.choice === question.flag;
    // Speed bonus: up to 100 bonus pts if answered quickly within round window
    const speedBonus = isCorrect ? Math.max(0, 100 - Math.floor(answerMs / 60)) : 0;
    const points = isCorrect ? 100 + speedBonus : 0;
    player.lastPoints = points;

    if (isCorrect) {
      player.correct += 1;
      player.score += points;
    }

    this.broadcast(room);

    // If every connected player has answered, reveal immediately without waiting for timer!
    const activePlayers = [...room.players.values()];
    if (activePlayers.length > 0 && activePlayers.every((p) => p.hasAnswered)) {
      this.revealRound(room);
    }
  }

  revealRound(room) {
    this.clearRoomTimers(room);
    room.roundPhase = "reveal";
    this.broadcast(room);

    room.revealTimer = setTimeout(() => {
      this.advanceOrFinish(room);
    }, REVEAL_DURATION_MS);
  }

  advanceOrFinish(room) {
    this.clearRoomTimers(room);
    if (room.currentRound + 1 < room.questions.length) {
      room.currentRound += 1;
      this.startRound(room);
    } else {
      this.finishMatch(room);
    }
  }

  finishMatch(room) {
    this.clearRoomTimers(room);
    room.status = "finished";
    room.roundPhase = "finished";

    const players = [...room.players.values()];
    const results = players
      .map((p) => ({ ...p }))
      .sort(
        (a, b) =>
          b.correct - a.correct ||
          b.score - a.score ||
          a.totalAnswerMs - b.totalAnswerMs,
      )
      .map((p, i) => ({
        seat: p.seat,
        name: p.name,
        correct: p.correct,
        score: p.score,
        averageAnswerMs: p.answerCount
          ? Math.round(p.totalAnswerMs / p.answerCount)
          : 0,
        rank: i + 1,
      }));

    room.results = results;
    for (const p of room.players.values()) {
      this.io.send(p.connId, { type: "finished", results });
    }
    this.broadcast(room);
  }

  actionKick(conn, room, msg) {
    if (conn.seat !== room.hostSeat || room.status !== "lobby") return;
    const targetSeat = Number(msg.seat);
    const target = room.players.get(targetSeat);
    if (!target || targetSeat === conn.seat) return;

    this.io.send(target.connId, { type: "kicked" });
    this.conns.delete(target.connId);
    room.players.delete(targetSeat);
    this.broadcast(room);
    this.announce(room, `${target.name} was removed from the room.`);
  }

  actionLeave(conn, room) {
    const player = room.players.get(conn.seat);
    if (!player) return;
    this.io.send(player.connId, { type: "leftRoom" });
    this.conns.delete(player.connId);
    room.players.delete(conn.seat);

    if (room.players.size === 0) {
      this.clearRoomTimers(room);
      this.rooms.delete(room.code);
      return;
    }
    if (conn.seat === room.hostSeat) {
      room.hostSeat = [...room.players.keys()][0];
      const nextHost = room.players.get(room.hostSeat);
      if (nextHost) {
        nextHost.ready = true;
        this.announce(room, `${nextHost.name} is now the room host.`);
      }
    }
    this.broadcast(room);
    this.announce(room, `${player.name} left the room.`);

    if (room.status === "playing" && room.roundPhase === "question") {
      const activePlayers = [...room.players.values()];
      if (activePlayers.length > 0 && activePlayers.every((p) => p.hasAnswered)) {
        this.revealRound(room);
      }
    }
  }

  actionCloseRoom(conn, room) {
    if (conn.seat !== room.hostSeat) return;
    this.clearRoomTimers(room);
    for (const p of room.players.values()) {
      this.io.send(p.connId, { type: "roomClosed" });
      this.conns.delete(p.connId);
    }
    this.rooms.delete(room.code);
  }

  actionRematch(room) {
    if (room.status !== "finished") return;
    this.clearRoomTimers(room);
    room.status = "lobby";
    room.roundPhase = "lobby";
    room.currentRound = 0;
    room.questions = [];
    room.results = [];

    for (const p of room.players.values()) {
      Object.assign(p, {
        correct: 0,
        score: 0,
        totalAnswerMs: 0,
        answerCount: 0,
        lastAnswerMs: 0,
        currentAnswer: null,
        hasAnswered: false,
        lastPoints: 0,
      });
      p.ready = p.seat === room.hostSeat;
    }
    this.broadcast(room);
    this.announce(room, "Rematch ready! Everyone ready up to play again.");
  }

  /* ---------------- lifecycle & cleanup ---------------- */

  onDisconnect(connId) {
    const conn = this.conns.get(connId);
    if (!conn) return;
    this.conns.delete(connId);
    const room = this.rooms.get(conn.roomCode);
    if (!room) return;
    const player = room.players.get(conn.seat);
    if (!player) return;

    room.players.delete(conn.seat);

    if (room.players.size === 0) {
      this.clearRoomTimers(room);
      this.rooms.delete(room.code);
      return;
    }

    if (conn.seat === room.hostSeat) {
      room.hostSeat = [...room.players.keys()][0];
      const nextHost = room.players.get(room.hostSeat);
      if (nextHost) {
        nextHost.ready = true;
        this.announce(room, `${nextHost.name} is now the room host.`);
      }
    }

    this.broadcast(room);
    this.announce(room, `${player.name} disconnected.`);

    // If game in progress, check if remaining players all answered
    if (room.status === "playing" && room.roundPhase === "question") {
      const activePlayers = [...room.players.values()];
      if (activePlayers.length > 0 && activePlayers.every((p) => p.hasAnswered)) {
        this.revealRound(room);
      }
    }
  }

  clearRoomTimers(room) {
    if (room.roundTimer != null) {
      clearTimeout(room.roundTimer);
      room.roundTimer = null;
    }
    if (room.revealTimer != null) {
      clearTimeout(room.revealTimer);
      room.revealTimer = null;
    }
  }

  sweep() {
    const now = Date.now();
    for (const [code, room] of [...this.rooms.entries()]) {
      if (room.players.size === 0 && now - room.createdAt > ROOM_PURGE_MS) {
        this.clearRoomTimers(room);
        this.rooms.delete(code);
      }
    }
  }

  destroy() {
    if (this.purgeTimer != null) clearInterval(this.purgeTimer);
    this.purgeTimer = null;
    for (const room of this.rooms.values()) {
      this.clearRoomTimers(room);
    }
    this.rooms.clear();
    this.conns.clear();
  }

  /* ---------------- helpers ---------------- */

  roomState(room) {
    return {
      type: "state",
      code: room.code,
      status: room.status,
      roundPhase: room.roundPhase,
      region: room.region,
      rounds: room.rounds,
      hostSeat: room.hostSeat,
      locked: room.locked === true,
      currentRound: room.currentRound,
      roundStartedAt: room.roundStartedAt,
      roundDurationMs: room.roundDurationMs,
      questions: room.status === "playing" ? room.questions : [],
      players: [...room.players.values()].map((p) => ({
        seat: p.seat,
        name: p.name,
        correct: p.correct,
        score: p.score,
        ready: p.ready,
        hasAnswered: p.hasAnswered === true,
        lastPoints: p.lastPoints || 0,
        // Only broadcast choices during reveal or finished phase to prevent inspection cheating
        currentAnswer:
          room.roundPhase === "reveal" || room.status === "finished"
            ? p.currentAnswer
            : null,
      })),
    };
  }

  broadcast(room) {
    const state = JSON.stringify(this.roomState(room));
    for (const p of room.players.values()) {
      this.io.send(p.connId, { __raw: state });
    }
  }

  announce(room, message) {
    for (const p of room.players.values()) {
      this.io.send(p.connId, { type: "notice", message });
    }
  }

  fail(connId, message, code = "GENERIC_ERROR") {
    this.io.send(connId, { type: "error", message, code });
  }

  schedulePurgeSweep() {
    if (this.purgeTimer != null) return;
    this.purgeTimer = setInterval(() => this.sweep(), 5000);
  }
}

export function randomRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}
