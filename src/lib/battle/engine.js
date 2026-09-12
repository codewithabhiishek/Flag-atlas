/**
 * FlagAtlas authoritative battle engine — browser edition.
 *
 * This is the room logic of the former server/battle-server.mjs, ported
 * into a transport-agnostic class so the HOST PLAYER'S BROWSER can
 * run it locally (Word Rush architecture). The wire protocol:
 * clients send { type: "join" | "ready" | "configure" | "lock" | "start" |
 * "answer" | "kick" | "rematch" }, the engine answers with { type:
 * "joined" | "state" | "notice" | "error" | "finished" | "kicked" }.
 *
 * Lobby rules (Word Rush style): the host is always ready; everyone else
 * toggles ready/unready. The host can only start when every connected
 * player is ready, and can lock the room to stop new joins.
 *
 * The engine only needs a `send(connId, msg)` callback — it doesn't know or
 * care whether messages go over a WebSocket, a WebRTC data channel, or a
 * loopback call inside the host tab.
 */

import { COUNTRIES, pickOptions } from "@/data/countries";

const MAX_PLAYERS = 5;
const SEATS = [1, 2, 3, 4, 5];
const ROOM_PURGE_MS = 90_000; // empty rooms are swept after 90s

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
   *        send() must deliver the message to that connection. Local host
   *        connections use connId "host-local"; P2P guests use "p2p-<peerId>".
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
    if (!conn) return this.fail(connId, "Join a room first.");

    const room = this.rooms.get(conn.roomCode);
    if (!room) return this.fail(connId, "This room no longer exists.");

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
    if (!/^[A-Z2-9]{4}$/.test(code))
      return this.fail(connId, "Enter a valid room code.");
    if (this.conns.has(connId))
      return this.fail(connId, "Already connected to a room.");

    let room = this.rooms.get(code);
    if (!room && !creating)
      return this.fail(connId, "This room does not exist. Check the code and try again.");

    if (!room) {
      room = {
        code,
        region: msg.region || "World",
        rounds: Number(msg.rounds) || 10,
        status: "lobby",
        hostSeat: 1,
        locked: false,
        players: new Map(), // seat -> player
        questions: [],
        results: [],
        createdAt: Date.now(),
      };
      this.rooms.set(code, room);
    }

    if (room.status !== "lobby")
      return this.fail(connId, "This battle has already started.");
    if (room.locked && !creating)
      return this.fail(connId, "This room is locked by the host.");
    if (room.players.size >= MAX_PLAYERS)
      return this.fail(connId, "This room is full (five players maximum).");

    const seat = SEATS.find((s) => !room.players.has(s));
    const player = {
      socket: null, // transports deliver via io.send; kept for parity with old server
      seat,
      name: String(msg.name || `Player ${seat}`).slice(0, 20),
      correct: 0,
      score: 0,
      index: 0,
      finished: false,
      finishedAt: 0,
      questionStartedAt: 0,
      totalAnswerMs: 0,
      answerCount: 0,
      lastAnswerMs: 0,
      // Word Rush rule: the host is implicitly always ready — a freshly
      // created room must never be blocked by its own host.
      ready: Boolean(creating),
      connId,
    };
    room.players.set(seat, player);
    this.conns.set(connId, { roomCode: code, seat, lastSeen: Date.now() });

    this.io.send(connId, { type: "joined", seat });
    this.broadcast(room);
    this.announce(
      room,
      creating ? `${player.name} opened the room.` : `${player.name} joined the room.`,
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

  /** Word Rush rule: host is always ready; guests toggle freely. */
  actionReady(conn, room, msg) {
    if (room.status !== "lobby") return;
    const player = room.players.get(conn.seat);
    if (!player) return;
    if (conn.seat === room.hostSeat) {
      // Hosts cannot unready — readiness is implicit in hosting.
      player.ready = true;
      return;
    }
    player.ready = msg.ready === true;
    this.broadcast(room);
  }

  /** Host-only: lock the room so nobody else can join. */
  actionLock(conn, room, msg) {
    if (conn.seat !== room.hostSeat || room.status !== "lobby") return;
    room.locked = msg.locked === true;
    this.broadcast(room);
    this.announce(room, room.locked ? "Room locked — no new players can join." : "Room unlocked — anyone can join.");
  }

  actionStart(conn, room) {
    if (conn.seat !== room.hostSeat)
      return this.fail(conn.connId, "Only the room host can start the battle.");
    if (room.players.size < 2)
      return this.fail(conn.connId, "At least two players are required to start.");
    // Word Rush rule: start requires every connected player to be ready.
    const notReady = [...room.players.values()].filter((p) => !p.ready);
    if (notReady.length > 0) {
      return this.fail(
        conn.connId,
        `Waiting for ${notReady.map((p) => p.name).join(", ")} to ready up.`,
      );
    }
    room.questions = makeQuestions(room.region, room.rounds);
    room.status = "playing";
    const now = Date.now();
    for (const p of room.players.values()) {
      Object.assign(p, {
        correct: 0,
        score: 0,
        index: 0,
        finished: false,
        finishedAt: 0,
        questionStartedAt: now,
        totalAnswerMs: 0,
        answerCount: 0,
        lastAnswerMs: 0,
      });
    }
    this.broadcast(room);
    this.announce(room, "Battle started — good luck!");
  }

  actionAnswer(conn, room, msg) {
    if (room.status !== "playing") return;
    const player = room.players.get(conn.seat);
    if (!player || player.finished) return;
    const question = room.questions[player.index];
    if (!question || !question.options.includes(msg.choice)) return;

    const answerMs = Math.max(0, Date.now() - player.questionStartedAt);
    player.lastAnswerMs = answerMs;
    player.totalAnswerMs += answerMs;
    player.answerCount += 1;

    if (msg.choice === question.flag) {
      player.correct += 1;
      player.score += 100 + Math.max(0, 100 - Math.floor(answerMs / 50));
    }

    player.index += 1;
    if (player.index >= room.questions.length) {
      player.finished = true;
      player.finishedAt = Date.now();
    } else {
      player.questionStartedAt = Date.now();
    }

    this.broadcast(room);
    this.finishIfReady(room);
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
    this.announce(room, `${target.name} was kicked from the room.`);
  }

  /* ---------------- lifecycle ---------------- */

  actionRematch(room) {
    if (room.status !== "finished") return;
    room.status = "lobby";
    room.questions = [];
    room.results = [];
    for (const p of room.players.values()) {
      Object.assign(p, {
        correct: 0,
        score: 0,
        index: 0,
        finished: false,
        finishedAt: 0,
        questionStartedAt: 0,
        totalAnswerMs: 0,
        answerCount: 0,
        lastAnswerMs: 0,
      });
      // Back to the lobby: everyone must ready up again (host stays ready).
      p.ready = p.seat === room.hostSeat;
    }
    this.broadcast(room);
  }

  /** Transport-level disconnect (tab closed, WebRTC drop). */
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
      this.rooms.delete(room.code);
      return;
    }
    if (conn.seat === room.hostSeat) {
      room.hostSeat = [...room.players.keys()][0];
      const nextHost = room.players.get(room.hostSeat);
      if (nextHost) {
        nextHost.ready = true;
        this.announce(room, `${nextHost.name} is now the host.`);
      }
    }
    // During a match the remaining player is allowed to finish (README
    // behavior) — do NOT force-finish the room.
    this.broadcast(room);
    this.announce(room, `${player.name} left the room.`);
    if (room.status === "playing") this.finishIfReady(room);
  }

  finishIfReady(room) {
    const players = [...room.players.values()];
    if (!players.length || !players.every((p) => p.finished)) return;
    const results = players
      .map((p) => ({ ...p }))
      .sort(
        (a, b) =>
          b.correct - a.correct ||
          a.totalAnswerMs - b.totalAnswerMs ||
          a.finishedAt - b.finishedAt,
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
    room.status = "finished";
    room.results = results;
    for (const p of room.players.values()) {
      this.io.send(p.connId, { type: "finished", results });
    }
    this.broadcast(room);
  }

  /**
   * Periodic housekeeping. Unlike Word Rush's engine there are no client
   * heartbeats in this protocol, so stale connections are detected by the
   * transport (WebRTC close events → onDisconnect); here we only purge rooms
   * that have been empty too long.
   */
  sweep() {
    const now = Date.now();
    for (const [code, room] of [...this.rooms.entries()]) {
      if (room.players.size === 0 && now - room.createdAt > ROOM_PURGE_MS) {
        this.rooms.delete(code);
      }
    }
  }

  destroy() {
    if (this.purgeTimer != null) clearInterval(this.purgeTimer);
    this.purgeTimer = null;
    this.rooms.clear();
    this.conns.clear();
  }

  /* ---------------- helpers ---------------- */

  roomState(room) {
    return {
      type: "state",
      code: room.code,
      status: room.status,
      region: room.region,
      rounds: room.rounds,
      hostSeat: room.hostSeat,
      locked: room.locked === true,
      questions: room.status === "playing" ? room.questions : [],
      players: [...room.players.values()].map(({ connId, ...p }) => p),
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

  fail(connId, message) {
    this.io.send(connId, { type: "error", message });
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
