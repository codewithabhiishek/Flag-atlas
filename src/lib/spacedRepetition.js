// SM-2 spaced repetition. quality: 0..5 (>=3 = correct recall).
export function newCard() {
  return { ef: 2.5, interval: 0, reps: 0, due: 0 };
}

export function reviewCard(sr, quality) {
  const q = Math.max(0, Math.min(5, Number(quality) || 0));
  let { ef = 2.5, interval = 0, reps = 0 } = sr || newCard();
  if (q >= 3) {
    reps += 1;
    interval = reps === 1 ? 1 : reps === 2 ? 3 : Math.round(interval * ef);
  } else {
    reps = 0;
    interval = 1;
  }
  ef = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (ef < 1.3) ef = 1.3;
  const due = Date.now() + interval * 86400000;
  return { ef, interval, reps, due };
}

export function isDue(sr) {
  return !sr || sr.due <= Date.now();
}