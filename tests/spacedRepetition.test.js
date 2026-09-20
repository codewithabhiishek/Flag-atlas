import test from 'node:test';
import assert from 'node:assert/strict';
import { newCard, reviewCard, isDue } from '../src/lib/spacedRepetition.js';

test('newCard initializes with proper defaults', () => {
  const card = newCard();
  assert.equal(card.ef, 2.5);
  assert.equal(card.interval, 0);
  assert.equal(card.reps, 0);
  assert.equal(card.due, 0);
});

test('reviewCard advances reps and interval on correct recall (quality >= 3)', () => {
  let card = newCard();

  // First correct recall (quality 5)
  card = reviewCard(card, 5);
  assert.equal(card.reps, 1);
  assert.equal(card.interval, 1);
  assert.ok(card.due > Date.now());

  // Second correct recall (quality 4)
  card = reviewCard(card, 4);
  assert.equal(card.reps, 2);
  assert.equal(card.interval, 3);

  // Third correct recall (quality 5)
  const prevInterval = card.interval;
  card = reviewCard(card, 5);
  assert.equal(card.reps, 3);
  assert.equal(card.interval, Math.round(prevInterval * card.ef));
});

test('reviewCard resets reps and interval on failed recall (quality < 3)', () => {
  let card = newCard();
  card = reviewCard(card, 5);
  card = reviewCard(card, 5);
  assert.equal(card.reps, 2);

  // Failed review
  card = reviewCard(card, 1);
  assert.equal(card.reps, 0);
  assert.equal(card.interval, 1);
});

test('reviewCard clamps quality parameter safely and maintains minimum ef of 1.3', () => {
  let card = newCard();

  // Repeatedly bad reviews
  for (let i = 0; i < 20; i++) {
    card = reviewCard(card, 0);
  }
  assert.ok(card.ef >= 1.3, `Ease factor must not fall below 1.3, got ${card.ef}`);

  // Extreme inputs: NaN, negative, excessive
  const fromNan = reviewCard(newCard(), NaN);
  assert.equal(typeof fromNan.ef, 'number');
  assert.ok(!Number.isNaN(fromNan.ef));

  const fromNegative = reviewCard(newCard(), -10);
  assert.equal(fromNegative.reps, 0);
});

test('isDue correctly detects overdue cards', () => {
  assert.equal(isDue(null), true);
  assert.equal(isDue(undefined), true);
  assert.equal(isDue({ due: Date.now() - 1000 }), true);
  assert.equal(isDue({ due: Date.now() + 100000 }), false);
});
