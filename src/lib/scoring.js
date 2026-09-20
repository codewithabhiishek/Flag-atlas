import { RANKS } from "../data/ranks.js";

export function levelFromXp(xp) {
  const safeXp = Math.max(0, Number(xp) || 0);
  return Math.floor(Math.sqrt(safeXp / 100)) + 1;
}

export function levelProgress(xp) {
  const safeXp = Math.max(0, Number(xp) || 0);
  const lvl = levelFromXp(safeXp);
  const cur = (lvl - 1) * (lvl - 1) * 100;
  const next = lvl * lvl * 100;
  const span = next - cur;
  const into = Math.max(0, safeXp - cur);
  const pct = span ? Math.min(100, Math.max(0, Math.round((into / span) * 100))) : 0;
  return { level: lvl, into, span, pct };
}

export function rankFromMastered(count) {
  const safeCount = Math.max(0, Number(count) || 0);
  let rank = RANKS[0];
  for (const r of RANKS) if (safeCount >= r.min) rank = r;
  return rank;
}

export const XP = {
  correct: 12,
  perfectBonus: 8,
  recall: 8,
  builder: 10,
  review: 10,
  speedHit: 5
};