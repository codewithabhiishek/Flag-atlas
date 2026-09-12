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
  click: { frequency: 880, duration: 0.055, type: "sine", volume: 0.07, decay: 0.04 },
  tap: { frequency: 640, duration: 0.045, type: "triangle", volume: 0.06, decay: 0.035 },
  success: { frequency: 660, duration: 0.14, type: "sine", volume: 0.09, decay: 0.1 },
  error: { frequency: 220, duration: 0.12, type: "square", volume: 0.05, decay: 0.08 },
  navigate: { frequency: 520, duration: 0.07, type: "sine", volume: 0.06, decay: 0.05 },
};

/**
 * Play a short UI sound.
 * @param {'click'|'tap'|'success'|'error'|'navigate'} type
 */
export function playUiSound(type = "click") {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  const profile = SOUND_PROFILES[type] || SOUND_PROFILES.click;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = profile.type;
  osc.frequency.setValueAtTime(profile.frequency, now);

  gain.gain.setValueAtTime(profile.volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + profile.decay);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + profile.duration);
}

/** Wrap a click handler to play a sound before invoking it. */
export function withClickSound(handler, type = "click") {
  return (...args) => {
    playUiSound(type);
    return handler?.(...args);
  };
}
