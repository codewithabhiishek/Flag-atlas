import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BattleEngine,
  randomRoomCode,
  sanitizePlayerName,
  ROUND_DURATION_MS,
  REVEAL_DURATION_MS,
} from '../src/lib/battle/engine.js';

test('randomRoomCode produces valid 4-character codes from safe charset', () => {
  const allowed = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/;
  for (let i = 0; i < 50; i++) {
    const code = randomRoomCode();
    assert.equal(code.length, 4);
    assert.match(code, allowed);
  }
});

test('sanitizePlayerName strips tags, control chars, and zero-width spoofers', () => {
  assert.equal(sanitizePlayerName('<script>alert(1)</script>Captain'), 'alert(1)Captain'.replace(/[^\w\s\-_.#@!]/g, ''));
  assert.equal(sanitizePlayerName('<img src=x onerror=hack()>Atlas'), 'Atlas');
  assert.equal(sanitizePlayerName('A\u200Bb\u200Cc\uFEFFd'), 'Abcd');
  assert.equal(sanitizePlayerName('Player\x00\x1F\x7FOne'), 'PlayerOne');

  // Max length (20)
  const longName = 'VeryLongPlayerNameThatExceedsTwentyChars';
  assert.equal(sanitizePlayerName(longName).length, 20);

  // Defaults on invalid / empty
  assert.equal(sanitizePlayerName('', 2), 'Player 2');
  assert.equal(sanitizePlayerName(null, 3), 'Player 3');
  assert.equal(sanitizePlayerName('   ', 1), 'Player 1');
});

test('BattleEngine room creation, join, ready, and start lifecycle', () => {
  const sentMessages = [];
  const mockIo = {
    send: (connId, msg) => {
      sentMessages.push({ connId, msg });
    },
  };

  const engine = new BattleEngine(mockIo);
  const code = 'TEST';

  // 1. Host creates room
  engine.handle('host-conn', {
    type: 'join',
    code,
    name: 'HostPlayer',
    create: true,
    region: 'World',
    rounds: 5,
  });

  const room = engine.rooms.get(code);
  assert.ok(room, 'Room should be created');
  assert.equal(room.players.size, 1);
  const host = room.players.get(1);
  assert.equal(host.name, 'HostPlayer');
  assert.equal(host.ready, true); // Host is implicitly ready

  // 2. Guest joins room
  engine.handle('guest-conn', {
    type: 'join',
    code,
    name: 'GuestPlayer',
  });

  assert.equal(room.players.size, 2);
  const guest = room.players.get(2);
  assert.equal(guest.name, 'GuestPlayer');
  assert.equal(guest.ready, false); // Guest starts not ready

  // 3. Attempt start while guest is not ready -> fails
  sentMessages.length = 0;
  engine.handle('host-conn', { type: 'start' });
  assert.equal(room.status, 'lobby');
  const errorMsg = sentMessages.find(m => m.msg.type === 'error');
  assert.ok(errorMsg, 'Should send error when not all players are ready');

  // 4. Guest readies up
  engine.handle('guest-conn', { type: 'ready', ready: true });
  assert.equal(guest.ready, true);

  // 5. Host starts battle
  engine.handle('host-conn', { type: 'start' });
  assert.equal(room.status, 'playing');
  assert.equal(room.roundPhase, 'question');
  assert.equal(room.questions.length, 5);

  // 6. Both players answer -> immediate reveal triggered
  const currentQ = room.questions[0];
  engine.handle('host-conn', { type: 'answer', choice: currentQ.flag });
  assert.equal(host.hasAnswered, true);
  assert.equal(host.correct, 1);
  assert.ok(host.score >= 100);

  // Guest also answers
  engine.handle('guest-conn', { type: 'answer', choice: currentQ.options[0] });
  assert.equal(guest.hasAnswered, true);

  // Since both answered, room should transition to reveal immediately
  assert.equal(room.roundPhase, 'reveal');

  // 7. Clean up engine
  engine.destroy();
  assert.equal(engine.rooms.size, 0);
  assert.equal(engine.conns.size, 0);
});

test('BattleEngine host leave transfers host to next player', () => {
  const mockIo = { send: () => {} };
  const engine = new BattleEngine(mockIo);
  const code = 'TRAN';

  engine.handle('c1', { type: 'join', code, name: 'Host1', create: true });
  engine.handle('c2', { type: 'join', code, name: 'Guest2' });

  const room = engine.rooms.get(code);
  assert.equal(room.hostSeat, 1);

  // Host 1 leaves
  engine.handle('c1', { type: 'leave' });
  assert.equal(room.players.size, 1);
  assert.equal(room.hostSeat, 2, 'Host should transfer to seat 2');
  const newHost = room.players.get(2);
  assert.equal(newHost.ready, true);

  engine.destroy();
});

test('BattleEngine rematch and closeRoom lifecycle', () => {
  const sentMessages = [];
  const mockIo = {
    send: (connId, msg) => {
      sentMessages.push({ connId, msg });
    },
  };
  const engine = new BattleEngine(mockIo);
  const code = 'REMT';

  engine.handle('c1', { type: 'join', code, name: 'Host', create: true });
  engine.handle('c2', { type: 'join', code, name: 'Guest' });
  engine.handle('c2', { type: 'ready', ready: true });
  engine.handle('c1', { type: 'start' });

  const room = engine.rooms.get(code);
  assert.equal(room.status, 'playing');

  // Finish match artificially
  engine.finishMatch(room);
  assert.equal(room.status, 'finished');
  assert.ok(room.results.length === 2);

  // Trigger rematch
  engine.handle('c1', { type: 'rematch' });
  assert.equal(room.status, 'lobby');
  assert.equal(room.results.length, 0);
  assert.equal(room.questions.length, 0);

  const host = room.players.get(1);
  const guest = room.players.get(2);
  assert.equal(host.ready, true, 'Host is ready for rematch');
  assert.equal(guest.ready, false, 'Guest must ready up again for rematch');
  assert.equal(host.score, 0);
  assert.equal(guest.score, 0);

  // Close room
  sentMessages.length = 0;
  engine.handle('c1', { type: 'closeRoom' });
  assert.equal(engine.rooms.has(code), false, 'Room should be purged');
  const roomClosedNotices = sentMessages.filter((m) => m.msg.type === 'roomClosed');
  assert.equal(roomClosedNotices.length, 2, 'Both players receive roomClosed');

  engine.destroy();
});
