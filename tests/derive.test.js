import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isMastered,
  flagStatus,
  masteredCount,
  regionTotal,
  masteredInRegion,
  regionMastery,
  accuracyOf,
  weakestFlags,
} from '../src/lib/derive.js';

test('isMastered requires at least 3 consecutive successful repetitions', () => {
  assert.equal(isMastered(null), false);
  assert.equal(isMastered({}), false);
  assert.equal(isMastered({ sr: { reps: 2 } }), false);
  assert.equal(isMastered({ sr: { reps: 3 } }), true);
  assert.equal(isMastered({ sr: { reps: 5 } }), true);
});

test('flagStatus correctly maps states and handles case-insensitivity', () => {
  const flags = {
    us: { sr: { reps: 3 }, seen: 4 },
    fr: { seen: 2, sr: { reps: 1 } },
    jp: { seen: 0 },
  };

  assert.equal(flagStatus(flags, 'us'), 'mastered');
  assert.equal(flagStatus(flags, 'US'), 'mastered');
  assert.equal(flagStatus(flags, 'fr'), 'learning');
  assert.equal(flagStatus(flags, 'FR'), 'learning');
  assert.equal(flagStatus(flags, 'jp'), 'locked');
  assert.equal(flagStatus(flags, 'NONEXISTENT'), 'locked');
});

test('masteredCount and region calculations work and gracefully handle null states', () => {
  // Empty or null state
  assert.equal(masteredCount(null), 0);
  assert.equal(masteredCount(undefined), 0);
  assert.equal(masteredCount({}), 0);

  assert.ok(regionTotal('Europe') > 0, 'Europe should have countries');
  assert.equal(masteredInRegion(null, 'Europe'), 0);
  assert.equal(regionMastery(null, 'Europe'), 0);

  // Partial mastery
  const flags = {
    fr: { sr: { reps: 3 } },
    de: { sr: { reps: 3 } },
  };
  assert.equal(masteredInRegion(flags, 'Europe'), 2);
  assert.ok(regionMastery(flags, 'Europe') > 0);
});

test('accuracyOf calculates correct ratio and returns null when unseen', () => {
  assert.equal(accuracyOf(null), null);
  assert.equal(accuracyOf({ seen: 0 }), null);
  assert.equal(accuracyOf({ seen: 4, correct: 3 }), 0.75);
  assert.equal(accuracyOf({ seen: 10, correct: 10 }), 1.0);
});

test('weakestFlags orders by accuracy and seen counts safely', () => {
  const flags = {
    us: { seen: 10, correct: 9 }, // 90%
    ca: { seen: 10, correct: 2 }, // 20%
    mx: { seen: 5, correct: 1 },  // 20%
  };

  const weakest = weakestFlags(flags, 2);
  assert.equal(weakest.length, 2);
  // ca or mx should be in the weakest list before us
  assert.ok(weakest[0].acc <= 0.2);
});
