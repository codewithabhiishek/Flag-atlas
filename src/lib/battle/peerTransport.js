/**
 * PeerJS WebRTC transport — the Word Rush P2P architecture.
 *
 * The host player's browser registers a deterministic PeerJS id derived from
 * the room code (`flagatlas-v1-<CODE>`) with PeerJS's free public signaling
 * broker, and runs the BattleEngine locally. Guests connect directly to that
 * peer id over a WebRTC data channel — no backend, works on any static host
 * like Vercel.
 *
 * Free infrastructure used (same as Word Rush):
 *  - PeerJS cloud broker: signaling / introductions only
 *  - Google + Twilio STUN servers: NAT discovery
 * All game traffic then flows directly between the two browsers.
 */

import Peer from "peerjs";
import { BattleEngine, randomRoomCode } from "./engine";

const PEER_PREFIX = "flagatlas-v1-";

const PEER_CONFIG = {
  debug: 0,
  config: {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:global.stun.twilio.com:3478" },
    ],
  },
};

export function peerIdForRoom(code) {
  return `${PEER_PREFIX}${String(code).trim().toLowerCase()}`;
}

/* ------------------------------------------------------------------ */
/* Host side: announce the room on PeerJS + run the engine locally     */
/* ------------------------------------------------------------------ */

export class PeerHostBridge {
  constructor(engine, code) {
    this.engine = engine;
    this.code = code;
    this.peer = null;
    this.conns = new Map(); // connId -> DataConnection
    this.pendingQueues = new Map(); // connId -> Array of messages queued before open
    this.closed = false;

    this.onUnload = () => this.close();
    if (typeof window !== "undefined") {
      window.addEventListener("pagehide", this.onUnload);
      window.addEventListener("beforeunload", this.onUnload);
    }
    this.init();
  }

  getCode() {
    return this.code;
  }

  flushQueue(connId) {
    const queue = this.pendingQueues.get(connId);
    const conn = this.conns.get(connId);
    if (!queue || !conn || !conn.open) return;
    while (queue.length > 0) {
      const msg = queue.shift();
      try {
        conn.send(msg);
      } catch {
        break;
      }
    }
    this.pendingQueues.delete(connId);
  }

  init() {
    if (this.closed) return;
    try {
      const id = peerIdForRoom(this.code);
      this.peer = new Peer(id, PEER_CONFIG);

      this.peer.on("connection", (conn) => {
        const connId = `p2p-${conn.peer}`;
        this.conns.set(connId, conn);

        conn.on("open", () => {
          this.flushQueue(connId);
        });

        conn.on("data", (raw) => {
          try {
            const msg = typeof raw === "string" ? JSON.parse(raw) : raw;
            this.engine.handle(connId, msg);
          } catch {
            /* ignore malformed */
          }
        });

        const drop = () => {
          this.pendingQueues.delete(connId);
          if (this.conns.has(connId)) {
            this.conns.delete(connId);
            this.engine.onDisconnect(connId);
          }
        };
        conn.on("close", drop);
        conn.on("error", drop);
      });

      this.peer.on("error", (err) => {
        // Someone else already claimed this room id (double-tab host) —
        // clean up previous peer instance before retrying
        if (err.type === "unavailable-id" && !this.closed) {
          try {
            this.peer?.destroy();
          } catch {}
          this.peer = null;
          window.setTimeout(() => {
            if (!this.closed) this.init();
          }, 1500);
        }
      });
    } catch {
      /* PeerJS unavailable — P2P hosting disabled, local play still works */
    }
  }

  send(connId, msg) {
    const conn = this.conns.get(connId);
    if (conn) {
      if (conn.open) {
        try {
          conn.send(msg);
        } catch {
          /* ignore dropped socket */
        }
      } else {
        // Queue message until data channel emits "open"
        if (!this.pendingQueues.has(connId)) {
          this.pendingQueues.set(connId, []);
        }
        this.pendingQueues.get(connId).push(msg);
      }
    }
  }

  close() {
    this.closed = true;
    if (typeof window !== "undefined") {
      window.removeEventListener("pagehide", this.onUnload);
      window.removeEventListener("beforeunload", this.onUnload);
    }
    this.pendingQueues.clear();
    for (const c of this.conns.values()) {
      try {
        c.close();
      } catch {}
    }
    this.conns.clear();
    try {
      this.peer?.destroy();
    } catch {}
    this.peer = null;
  }
}

/* ------------------------------------------------------------------ */
/* Guest side: dial the host's peer id directly                        */
/* ------------------------------------------------------------------ */

export function tryPeerGuestLink(roomCode, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const targetId = peerIdForRoom(roomCode);
    let settled = false;
    let peer = null;
    let conn = null;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        try {
          conn?.close();
          peer?.destroy();
        } catch {}
        reject(new Error("P2P connection timeout"));
      }
    }, timeoutMs);

    const listeners = new Set();
    const deliver = (msg) => listeners.forEach((cb) => cb(msg));

    const link = {
      mode: "p2p",
      send: (msg) => {
        if (conn && conn.open) {
          try {
            conn.send(msg);
          } catch {}
        }
      },
      onMessage: (cb) => {
        listeners.add(cb);
        return () => listeners.delete(cb);
      },
      onClose: undefined,
      close: () => {
        clearTimeout(timer);
        try {
          conn?.close();
          peer?.destroy();
        } catch {}
      },
    };

    try {
      peer = new Peer(PEER_CONFIG);
    } catch (err) {
      clearTimeout(timer);
      return reject(err);
    }

    peer.on("open", () => {
      try {
        conn = peer.connect(targetId, { reliable: true });
        conn.on("open", () => {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            resolve(link);
          }
        });
        conn.on("data", (raw) => {
          try {
            let msg = typeof raw === "string" ? JSON.parse(raw) : raw;
            // broadcast() uses a { __raw: "<json>" } envelope for wire
            // efficiency — unwrap it before dispatching.
            if (msg && typeof msg.__raw === "string") msg = JSON.parse(msg.__raw);
            if (msg && typeof msg.type === "string") deliver(msg);
          } catch {}
        });
        conn.on("close", () => {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            reject(new Error("Host closed the connection"));
          } else {
            link.onClose?.();
          }
        });
        conn.on("error", (err) => {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            reject(err);
          } else {
            link.onClose?.();
          }
        });
      } catch (err) {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          reject(err);
        }
      }
    });

    peer.on("error", (err) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        try {
          conn?.close();
          peer?.destroy();
        } catch {}
        reject(err);
      } else {
        link.onClose?.();
      }
    });
  });
}

/* ------------------------------------------------------------------ */
/* Host link: engine in this tab + loopback io + PeerJS announcements  */
/* ------------------------------------------------------------------ */

/**
 * Creates the host-side GameLink. The engine lives in this tab; the local
 * player's messages are delivered straight into engine.handle() (loopback),
 * and engine replies to the local player are routed back to onMessage.
 */
export function createPeerHostLink({ code, name, region, rounds }) {
  const listeners = new Set();
  // Engine replies fired before the UI registers onMessage (the local
  // "joined" + first "state" arrive synchronously with the join below) must
  // be buffered, not dropped — otherwise the host tab never learns its seat
  // and renders the guest UI (no Start button, locked settings, no kick).
  const earlyQueue = [];
  let hasListener = false;
  const deliver = (msg) => {
    if (!hasListener) {
      earlyQueue.push(msg);
      return;
    }
    listeners.forEach((cb) => cb(msg));
  };
  const HOST_CONN = "host-local";

  let bridge = null;
  let open = false;

  const link = {
    mode: "p2p-host",
    get isOpen() {
      return open;
    },
    send: (msg) => {
      // Local loopback: the host IS the server.
      engine.handle(HOST_CONN, msg);
    },
    onMessage: (cb) => {
      listeners.add(cb);
      if (!hasListener) {
        hasListener = true;
        // Replay everything the engine said before the UI was listening.
        const queued = earlyQueue.splice(0);
        for (const msg of queued) cb(msg);
      }
      return () => listeners.delete(cb);
    },
    onClose: undefined,
    close: () => {
      open = false;
      // Notify remote guests before tearing down WebRTC bridge
      for (const room of engine.rooms.values()) {
        for (const p of room.players.values()) {
          if (p.connId !== HOST_CONN) {
            bridge?.send(p.connId, {
              type: "roomClosed",
              message: "The host left the battle.",
            });
          }
        }
      }
      bridge?.close();
      bridge = null;
      engine.destroy();
    },
  };

  const engine = new BattleEngine({
    send: (connId, msg) => {
      if (connId === HOST_CONN) {
        // Strip the __raw envelope the broadcast() uses for wire efficiency —
        // deliver parsed objects locally.
        if (msg.__raw) {
          try {
            deliver(JSON.parse(msg.__raw));
          } catch {}
        } else {
          deliver(msg);
        }
      } else {
        bridge?.send(connId, msg);
      }
    },
  });

  open = true;
  bridge = new PeerHostBridge(engine, code);

  // Join our own room immediately (same handshake the old client did).
  engine.handle(HOST_CONN, {
    type: "join",
    code,
    name,
    create: true,
    region,
    rounds,
    connectionId: "host",
  });

  return link;
}

export { randomRoomCode };
