import { createServer } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { COUNTRIES, pickOptions } from "../src/data/countries.js";

const port = Number(process.env.PORT || 8787);
const rooms = new Map();

const send = (socket, message) => {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
};

function roomState(room) {
  return {
    type: "state",
    code: room.code,
    status: room.status,
    region: room.region,
    rounds: room.rounds,
    hostSeat: room.hostSeat,
    questions: room.status === "playing" ? room.questions : [],
    players: [...room.players.values()].map(({ socket, ...player }) => player),
  };
}

function broadcast(room) {
  const state = JSON.stringify(roomState(room));
  for (const player of room.players.values()) {
    if (player.socket.readyState === WebSocket.OPEN) player.socket.send(state);
  }
}

function makeQuestions(region, rounds) {
  const candidates = region === "World"
    ? COUNTRIES
    : COUNTRIES.filter((country) => country.region === region);
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(rounds, candidates.length)).map((country) => ({
    flag: country.code,
    options: pickOptions(country.code, region === "World" ? null : region, 4).map((option) => option.code),
  }));
}

function finishIfReady(room) {
  const players = [...room.players.values()];
  if (!players.length || !players.every((player) => player.finished)) return;
  const results = players
    .map((player) => ({ ...player }))
    .sort((a, b) => b.score - a.score || a.finishedAt - b.finishedAt)
    .map((player, index) => ({
      seat: player.seat,
      name: player.name,
      correct: player.correct,
      score: player.score,
      rank: index + 1,
    }));
  room.status = "finished";
  room.results = results;
  for (const player of room.players.values()) send(player.socket, { type: "finished", results });
  broadcast(room);
}

function fail(socket, message) {
  send(socket, { type: "error", message });
}

const httpServer = createServer((request, response) => {
  if (request.url === "/health") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ ok: true, rooms: rooms.size }));
    return;
  }
  response.writeHead(404);
  response.end();
});

const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", (socket) => {
  let room = null;
  let player = null;

  socket.on("message", (raw) => {
    let message;
    try { message = JSON.parse(raw.toString()); } catch { return fail(socket, "Invalid message."); }

    if (message.type === "join") {
      const code = String(message.code || "").toUpperCase();
      const creating = Boolean(message.create);
      if (!/^[A-Z2-9]{4}$/.test(code)) return fail(socket, "Enter a valid room code.");
      if (room) return fail(socket, "Already connected to a room.");
      room = rooms.get(code);
      if (!room && !creating) return fail(socket, "This room does not exist. Check the code and try again.");
      if (!room) {
        room = { code, region: message.region || "World", rounds: Number(message.rounds) || 10, status: "lobby", hostSeat: 1, players: new Map(), questions: [], results: [] };
        rooms.set(code, room);
      }
      if (room.status !== "lobby") return fail(socket, "This battle has already started.");
      if (room.players.size >= 2) return fail(socket, "This room is full.");
      const seat = room.players.size + 1;
      player = { socket, seat, name: String(message.name || `Player ${seat}`).slice(0, 20), correct: 0, score: 0, index: 0, finished: false, finishedAt: 0 };
      room.players.set(seat, player);
      send(socket, { type: "joined", seat });
      broadcast(room);
      return;
    }

    if (!room || !player) return fail(socket, "Join a room first.");
    if (message.type === "set_name") {
      player.name = String(message.name || `Player ${player.seat}`).slice(0, 20);
      broadcast(room);
    } else if (message.type === "configure") {
      if (player.seat !== room.hostSeat || room.status !== "lobby") return;
      const region = String(message.region || "World");
      const eligible = region === "World" ? COUNTRIES : COUNTRIES.filter((country) => country.region === region);
      if (!eligible.length) return fail(socket, "That region has no playable flags.");
      room.region = region;
      room.rounds = Math.max(5, Math.min(20, Number(message.rounds) || 10));
      broadcast(room);
    } else if (message.type === "start") {
      if (player.seat !== room.hostSeat) return fail(socket, "Only the room host can start the battle.");
      if (room.players.size !== 2) return fail(socket, "Two players are required to start.");
      room.questions = makeQuestions(room.region, room.rounds);
      room.status = "playing";
      for (const participant of room.players.values()) Object.assign(participant, { correct: 0, score: 0, index: 0, finished: false, finishedAt: 0 });
      broadcast(room);
    } else if (message.type === "answer" && room.status === "playing" && !player.finished) {
      const question = room.questions[player.index];
      if (!question || !question.options.includes(message.choice)) return;
      if (message.choice === question.flag) {
        player.correct += 1;
        player.score += 100;
      }
      player.index += 1;
      if (player.index >= room.questions.length) {
        player.finished = true;
        player.finishedAt = Date.now();
      }
      broadcast(room);
      finishIfReady(room);
    } else if (message.type === "rematch" && room.status === "finished") {
      room.status = "lobby";
      room.questions = [];
      room.results = [];
      for (const participant of room.players.values()) Object.assign(participant, { correct: 0, score: 0, index: 0, finished: false, finishedAt: 0 });
      broadcast(room);
    }
  });

  socket.on("close", () => {
    if (!room || !player) return;
    room.players.delete(player.seat);
    if (!room.players.size) return rooms.delete(room.code);
    if (player.seat === room.hostSeat) room.hostSeat = [...room.players.keys()][0];
    if (room.status === "playing") {
      for (const remaining of room.players.values()) {
        remaining.finished = true;
        remaining.finishedAt ||= Date.now();
      }
      finishIfReady(room);
    } else broadcast(room);
  });
});

httpServer.listen(port, () => console.log(`FlagAtlas battle server listening on ${port}`));
