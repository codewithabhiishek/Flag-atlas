import { Actor } from 'base44:runtime/actors';

const REGION_CODES = {
  Europe: ["al","ad","at","by","be","ba","bg","hr","cy","cz","dk","ee","fi","fr","de","gr","hu","is","ie","it","xk","lv","li","lt","lu","mt","md","mc","me","nl","mk","no","pl","pt","ro","ru","sm","rs","sk","si","es","se","ch","ua","gb","va"],
  Asia: ["af","am","az","bh","bd","bt","bn","kh","cn","ge","in","id","ir","iq","il","jp","jo","kz","kw","kg","la","lb","my","mv","mn","mm","np","kp","om","pk","ps","ph","qa","sa","sg","kr","lk","sy","tw","tj","th","tl","tr","tm","ae","uz","vn","ye"],
  Africa: ["dz","ao","bj","bw","bf","bi","cv","cm","cf","td","km","cg","cd","dj","eg","gq","er","sz","et","ga","gm","gh","gn","gw","ci","ke","ls","lr","ly","mg","mw","ml","mr","mu","ma","mz","na","ne","ng","rw","st","sn","sc","sl","so","za","ss","sd","tz","tg","tn","ug","zm","zw"],
  "North America": ["ag","bs","bb","bz","ca","cr","cu","dm","do","sv","gd","gt","ht","hn","jm","mx","ni","pa","kn","lc","vc","tt","us"],
  "South America": ["ar","bo","br","cl","co","ec","gy","py","pe","sr","uy","ve"],
  Oceania: ["au","fj","ki","mh","fm","nr","nz","pw","pg","ws","sb","to","tv","vu"]
};
REGION_CODES.World = Object.values(REGION_CODES).flat();

const DEFAULT_ROUNDS = 10;
const MAX_PLAYERS = 8;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickQuestion(codes) {
  const correct = codes[Math.floor(Math.random() * codes.length)];
  const distractors = shuffle(codes.filter((c) => c !== correct)).slice(0, 3);
  return { correct, options: shuffle([correct, ...distractors]) };
}

export default class FlagBattle extends Actor {
  players = new Map();
  nextSeat = 1;
  status = 'lobby';
  region = 'World';
  rounds = DEFAULT_ROUNDS;
  queue = [];
  startedAt = 0;
  results = null;

  async handleStart() {
    const saved = await this.storage.get('state');
    if (saved) {
      this.status = saved.status;
      this.region = saved.region;
      this.rounds = saved.rounds;
      this.queue = saved.queue || [];
      this.startedAt = saved.startedAt || 0;
      this.results = saved.results || null;
      this.nextSeat = saved.nextSeat || 1;
      this.players = new Map(saved.players || []);
    }
    const live = new Set(this.getConnections().map((c) => c.id));
    for (const id of this.players.keys()) if (!live.has(id)) this.players.delete(id);
    this.nextSeat = Math.max(0, ...[...this.players.values()].map((p) => p.seat)) + 1;
  }

  async handleConnect(conn) {
    if (!this.players.has(conn.id)) {
      if (this.players.size >= MAX_PLAYERS) {
        conn.reject(4001, 'room full');
        return;
      }
      this.players.set(conn.id, {
        seat: this.nextSeat++,
        name: '',
        score: 0,
        correct: 0,
        index: 0,
        lastAt: 0,
        finishedAt: 0
      });
      await this.save();
    }
    const p = this.players.get(conn.id);
    conn.send({ type: 'you', seat: p.seat });
    conn.send({
      type: 'state',
      status: this.status,
      region: this.region,
      rounds: this.rounds,
      questions: this.clientQuestions(),
      players: this.publicPlayers()
    });
    if (this.results) conn.send({ type: 'result', results: this.results });
    this.broadcastPresence();
  }

  async handleMessage(conn, msg) {
    if (typeof msg !== 'object' || msg === null) return;
    const p = this.players.get(conn.id);
    if (!p) return;

    if (msg.type === 'set_name') {
      p.name = String(msg.name || '').slice(0, 20) || `Player ${p.seat}`;
      await this.save();
      this.broadcastPresence();
    } else if (msg.type === 'configure' && this.status === 'lobby') {
      this.region = REGION_CODES[msg.region] ? msg.region : 'World';
      this.rounds = Math.min(20, Math.max(3, Number(msg.rounds) || DEFAULT_ROUNDS));
      await this.save();
      this.broadcast({ type: 'state', status: this.status, region: this.region, rounds: this.rounds, questions: [], players: this.publicPlayers() });
    } else if (msg.type === 'start' && this.status === 'lobby') {
      this.startGame();
    } else if (msg.type === 'answer' && this.status === 'playing') {
      this.handleAnswer(conn, msg);
    } else if (msg.type === 'rematch' && this.status === 'finished') {
      this.resetLobby();
    }
  }

  startGame() {
    const codes = REGION_CODES[this.region] || REGION_CODES.World;
    this.queue = Array.from({ length: this.rounds }, () => pickQuestion(codes));
    this.status = 'playing';
    this.startedAt = Date.now();
    this.results = null;
    for (const p of this.players.values()) {
      p.score = 0;
      p.correct = 0;
      p.index = 0;
      p.lastAt = 0;
      p.finishedAt = 0;
    }
    this.broadcast({
      type: 'state',
      status: 'playing',
      region: this.region,
      rounds: this.rounds,
      questions: this.clientQuestions(),
      players: this.publicPlayers()
    });
    this.save();
  }

  handleAnswer(conn, msg) {
    const p = this.players.get(conn.id);
    if (p.index >= this.queue.length) return;
    const q = this.queue[p.index];
    const choice = String(msg.choice || '');
    const now = Date.now();
    const elapsed = now - (p.lastAt || this.startedAt);
    if (choice === q.correct) {
      const bonus = Math.max(0, 50 - Math.floor(elapsed / 1000));
      p.score += 100 + bonus;
      p.correct += 1;
    }
    p.lastAt = now;
    p.index += 1;
    if (p.index >= this.queue.length) p.finishedAt = now;
    this.broadcastPresence();
    if ([...this.players.values()].every((pl) => pl.finishedAt > 0)) this.finish();
    this.save();
  }

  finish() {
    this.status = 'finished';
    const ranked = [...this.players.values()].sort(
      (a, b) => b.correct - a.correct || a.finishedAt - b.finishedAt
    );
    this.results = ranked.map((p, i) => ({
      seat: p.seat,
      name: p.name,
      correct: p.correct,
      score: p.score,
      rank: i + 1
    }));
    this.broadcast({ type: 'result', results: this.results });
    this.save();
  }

  resetLobby() {
    this.status = 'lobby';
    this.queue = [];
    this.results = null;
    for (const p of this.players.values()) {
      p.score = 0;
      p.correct = 0;
      p.index = 0;
      p.lastAt = 0;
      p.finishedAt = 0;
    }
    this.broadcast({
      type: 'state',
      status: 'lobby',
      region: this.region,
      rounds: this.rounds,
      questions: [],
      players: this.publicPlayers()
    });
    this.save();
  }

  async handleClose(conn) {
    this.players.delete(conn.id);
    await this.save();
    this.broadcastPresence();
  }

  clientQuestions() {
    return this.queue.map((q) => ({ flag: q.correct, options: q.options }));
  }

  publicPlayers() {
    return [...this.players.values()].map((p) => ({
      seat: p.seat,
      name: p.name,
      score: p.score,
      correct: p.correct,
      index: p.index,
      finished: !!p.finishedAt
    }));
  }

  broadcastPresence() {
    this.broadcast({ type: 'presence', players: this.publicPlayers() });
  }

  save() {
    return this.storage.put('state', {
      status: this.status,
      region: this.region,
      rounds: this.rounds,
      queue: this.queue,
      startedAt: this.startedAt,
      results: this.results,
      players: [...this.players.entries()],
      nextSeat: this.nextSeat
    });
  }
}