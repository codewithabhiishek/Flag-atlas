import test from 'node:test';
import assert from 'node:assert/strict';
import { levelFromXp, levelProgress, rankFromMastered, XP } from '../src/lib/scoring.js';
import { RANKS } from '../src/data/ranks.js';

test('levelFromXp calculates correct levels and handles edge cases', () => {
  assert.equal(levelFromXp(0), 1);
  assert.equal(levelFromXp(99), 1);
  assert.equal(levelFromXp(100), 2);
  assert.equal(levelFromXp(399), 2);
  assert.equal(levelFromXp(400), 3);
  assert.equal(levelFromXp(900), 4);

  // Edge cases: negative, NaN, non-number
  assert.equal(levelFromXp(-100), 1);
  assert.equal(levelFromXp(NaN), 1);
  assert.equal(levelFromXp(null), 1);
  assert.equal(levelFromXp(undefined), 1);
  assert.equal(levelFromXp("invalid"), 1);
});

test('levelProgress returns accurate into, span, and percentage bounds', () => {
  const atZero = levelProgress(0);
  assert.equal(atZero.level, 1);
  assert.equal(atZero.into, 0);
  assert.equal(atZero.span, 100);
  assert.equal(atZero.pct, 0);

  const halfwayLvl1 = levelProgress(50);
  assert.equal(halfwayLvl1.level, 1);
  assert.equal(halfwayLvl1.into, 50);
  assert.equal(halfwayLvl1.span, 100);
  assert.equal(halfwayLvl1.pct, 50);

  const atLvl2Start = levelProgress(100);
  assert.equal(atLvl2Start.level, 2);
  assert.equal(atLvl2Start.into, 0);
  assert.equal(atLvl2Start.span, 300); // 400 - 100
  assert.equal(atLvl2Start.pct, 0);

  // Edge case: negative or NaN values
  const negative = levelProgress(-500);
  assert.equal(negative.level, 1);
  assert.equal(negative.pct, 0);
});

test('rankFromMastered returns expected ranks across progression thresholds', () => {
  assert.equal(rankFromMastered(0).name, RANKS[0].name);
  assert.equal(rankFromMastered(-5).name, RANKS[0].name);

  for (const r of RANKS) {
    const matched = rankFromMastered(r.min);
    assert.equal(matched.name, r.name);
  }
});
