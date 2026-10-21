import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { triggerHaptic, cancelHaptic, HAPTIC_PATTERNS } from '../src/lib/haptics.js';

describe('haptics tactile feedback engine', () => {
  test('executes safely in non-browser Node environments without throwing', () => {
    assert.doesNotThrow(() => {
      assert.equal(triggerHaptic('tap'), false);
      assert.equal(triggerHaptic('light'), false);
      assert.equal(triggerHaptic('medium'), false);
      assert.equal(triggerHaptic('heavy'), false);
      assert.equal(triggerHaptic('success'), false);
      assert.equal(triggerHaptic('error'), false);
      assert.equal(triggerHaptic('warning'), false);
      assert.equal(triggerHaptic('celebrate'), false);
      assert.equal(triggerHaptic('stamp'), false);
      assert.equal(triggerHaptic('navigate'), false);
      assert.equal(cancelHaptic(), false);
    });
  });

  test('correctly maps vibration presets when navigator.vibrate is available', () => {
    const calls = [];
    const origDescriptor = Object.getOwnPropertyDescriptor(globalThis.navigator, 'vibrate');

    try {
      Object.defineProperty(globalThis.navigator, 'vibrate', {
        value: (pattern) => {
          calls.push(pattern);
          return true;
        },
        configurable: true,
        writable: true,
      });

      // Preset patterns
      assert.equal(triggerHaptic('tap'), true);
      assert.deepEqual(calls.at(-1), HAPTIC_PATTERNS.tap);

      assert.equal(triggerHaptic('success'), true);
      assert.deepEqual(calls.at(-1), HAPTIC_PATTERNS.success);

      assert.equal(triggerHaptic('error'), true);
      assert.deepEqual(calls.at(-1), HAPTIC_PATTERNS.error);

      assert.equal(triggerHaptic('stamp'), true);
      assert.deepEqual(calls.at(-1), HAPTIC_PATTERNS.stamp);

      assert.equal(triggerHaptic('celebrate'), true);
      assert.deepEqual(calls.at(-1), HAPTIC_PATTERNS.celebrate);

      // Custom numeric duration
      assert.equal(triggerHaptic(50), true);
      assert.equal(calls.at(-1), 50);

      // Custom array pattern
      assert.equal(triggerHaptic([10, 20, 30]), true);
      assert.deepEqual(calls.at(-1), [10, 20, 30]);

      // Unrecognized key falls back to default tap
      assert.equal(triggerHaptic('unknown_key'), true);
      assert.deepEqual(calls.at(-1), HAPTIC_PATTERNS.tap);

      // Cancel haptic calls with 0
      assert.equal(cancelHaptic(), true);
      assert.equal(calls.at(-1), 0);
    } finally {
      if (origDescriptor) {
        Object.defineProperty(globalThis.navigator, 'vibrate', origDescriptor);
      } else {
        delete globalThis.navigator.vibrate;
      }
    }
  });

  test('gracefully swallows errors if navigator.vibrate throws', () => {
    const origDescriptor = Object.getOwnPropertyDescriptor(globalThis.navigator, 'vibrate');

    try {
      Object.defineProperty(globalThis.navigator, 'vibrate', {
        value: () => {
          throw new Error('Hardware exception');
        },
        configurable: true,
        writable: true,
      });

      assert.equal(triggerHaptic('tap'), false);
      assert.equal(cancelHaptic(), false);
    } finally {
      if (origDescriptor) {
        Object.defineProperty(globalThis.navigator, 'vibrate', origDescriptor);
      } else {
        delete globalThis.navigator.vibrate;
      }
    }
  });
});
