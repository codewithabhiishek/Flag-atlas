import { COUNTRIES } from "../data/countries.js";

export function isMastered(rec) {
  // A country is complete only after three consecutive successful reviews.
  // `reviewCard` resets reps after any incorrect attempt, so this definition
  // is shared by the map, region totals, passport, rank, and dashboard.
  return !!(rec && rec.sr && rec.sr.reps >= 3);
}

export function flagStatus(flags, code) {
  const f = flags && typeof flags === "object" ? flags : {};
  const c = String(code || "").toLowerCase();
  const r = f[c] || f[code];
  if (isMastered(r)) return "mastered";
  if (r && r.seen > 0) return "learning";
  return "locked";
}

export function masteredCount(flags) {
  const f = flags && typeof flags === "object" ? flags : {};
  return COUNTRIES.filter((c) => isMastered(f[c.code])).length;
}

export function regionTotal(region) {
  return COUNTRIES.filter((c) => c.region === region).length;
}

export function masteredInRegion(flags, region) {
  const f = flags && typeof flags === "object" ? flags : {};
  return COUNTRIES.filter((c) => c.region === region && isMastered(f[c.code])).length;
}

export function regionMastery(flags, region) {
  const total = regionTotal(region);
  if (!total) return 0;
  return Math.round((masteredInRegion(flags, region) / total) * 100);
}

export function accuracyOf(rec) {
  if (!rec || !rec.seen) return null;
  return rec.correct / rec.seen;
}

export function weakestFlags(flags, n = 6) {
  const f = flags && typeof flags === "object" ? flags : {};
  return COUNTRIES.map((c) => {
    const r = f[c.code];
    return { c, acc: accuracyOf(r), seen: r ? r.seen : 0, sr: r ? r.sr : null };
  })
    .filter((x) => x.seen > 0)
    .sort((a, b) => a.acc - b.acc || a.seen - b.seen)
    .slice(0, n);
}
