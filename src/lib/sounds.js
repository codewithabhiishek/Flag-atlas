/** Lightweight UI sounds via Web Audio — no asset files required. */

let audioCtx = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  return audioCtx;
}

const SOUND_PROFILES = {
  click: [{ frequency: 520, duration: 0.04, type: "triangle", volume: 0.035, decay: 0.035 }],
  tap: [{ frequency: 640, duration: 0.045, type: "triangle", volume: 0.045, decay: 0.04 }],
  navigate: [
    { frequency: 440, duration: 0.055, type: "sine", volume: 0.04, decay: 0.05 },
    { frequency: 660, duration: 0.07, type: "sine", volume: 0.04, decay: 0.06, delay: 0.045 },
  ],
  success: [
    { frequency: 660, duration: 0.09, type: "sine", volume: 0.06, decay: 0.08 },
    { frequency: 880, duration: 0.13, type: "sine", volume: 0.065, decay: 0.11, delay: 0.07 },
  ],
  error: [
    { frequency: 280, duration: 0.07, type: "triangle", volume: 0.045, decay: 0.06 },
    { frequency: 210, duration: 0.1, type: "triangle", volume: 0.04, decay: 0.08, delay: 0.06 },
  ],
  advance: [{ frequency: 740, duration: 0.055, type: "sine", volume: 0.045, decay: 0.045 }],
  timerWarning: [{ frequency: 920, duration: 0.045, type: "sine", volume: 0.035, decay: 0.04 }],
  timerEnd: [
    { frequency: 330, duration: 0.1, type: "triangle", volume: 0.05, decay: 0.08 },
    { frequency: 220, duration: 0.15, type: "triangle", volume: 0.045, decay: 0.12, delay: 0.09 },
  ],
};

/**
 * Play a short UI sound.
 * @param {'click'|'tap'|'success'|'error'|'navigate'|'advance'|'timerWarning'|'timerEnd'} type
 */
export function playUiSound(type = "click") {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  const profiles = SOUND_PROFILES[type] || SOUND_PROFILES.click;
  const now = ctx.currentTime;

  profiles.forEach((profile) => {
    const startAt = now + (profile.delay || 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = profile.type;
    osc.frequency.setValueAtTime(profile.frequency, startAt);
    gain.gain.setValueAtTime(profile.volume, startAt);
    gain.gain.exponentialRampToValueAtTime(0.001, startAt + profile.decay);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startAt);
    osc.stop(startAt + profile.duration);
  });
}

/** Wrap a click handler to play a sound before invoking it. */
export function withClickSound(handler, type = "click") {
  return (...args) => {
    playUiSound(type);
    return handler?.(...args);
  };
}
