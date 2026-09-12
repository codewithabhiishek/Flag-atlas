import { RANKS } from "@/data/ranks";

export function levelFromXp(xp) {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function levelProgress(xp) {
  const lvl = levelFromXp(xp);
  const cur = (lvl - 1) * (lvl - 1) * 100;
  const next = lvl * lvl * 100;
  const span = next - cur;
  const into = Math.max(0, xp - cur);
  const pct = span ? Math.min(100, Math.max(0, Math.round((into / span) * 100))) : 0;
  return { level: lvl, into, span, pct };
}

export function rankFromMastered(count) {
  let rank = RANKS[0];
  for (const r of RANKS) if (count >= r.min) rank = r;
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