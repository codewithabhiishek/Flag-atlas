/**
 * Safe mobile haptic feedback engine.
 * Wraps navigator.vibrate with pattern presets and safe SSR / Node / un-supported fallbacks.
 */

export const HAPTIC_PATTERNS = {
  tap: 12,
  light: 15,
  medium: 25,
  heavy: 45,
  success: [25, 40, 60],
  error: [40, 60, 40],
  warning: [30, 45, 30],
  celebrate: [30, 50, 40, 60, 80],
  stamp: [25, 35, 55],
  navigate: 15,
};

/**
 * Triggers physical vibration on supported mobile devices.
 * Gracefully no-ops in Node, desktop, or un-supported environments.
 * @param {keyof typeof HAPTIC_PATTERNS | number | number[]} [pattern="tap"]
 * @returns {boolean} Whether vibration was initiated
 */
export function triggerHaptic(pattern = "tap") {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") {
    return false;
  }

  try {
    const vibrationPattern =
      typeof pattern === "number" || Array.isArray(pattern)
        ? pattern
        : HAPTIC_PATTERNS[pattern] || HAPTIC_PATTERNS.tap;
    return Boolean(navigator.vibrate(vibrationPattern));
  } catch {
    return false;
  }
}

/**
 * Cancels any active vibration pulses.
 * @returns {boolean}
 */
export function cancelHaptic() {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try {
      return Boolean(navigator.vibrate(0));
    } catch {
      return false;
    }
  }
  return false;
}

export const haptics = {
  tap: () => triggerHaptic("tap"),
  light: () => triggerHaptic("light"),
  medium: () => triggerHaptic("medium"),
  heavy: () => triggerHaptic("heavy"),
  success: () => triggerHaptic("success"),
  error: () => triggerHaptic("error"),
  warning: () => triggerHaptic("warning"),
  celebrate: () => triggerHaptic("celebrate"),
  stamp: () => triggerHaptic("stamp"),
  navigate: () => triggerHaptic("navigate"),
  cancel: () => cancelHaptic(),
};
