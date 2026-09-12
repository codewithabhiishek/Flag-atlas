import { COUNTRIES } from "@/data/countries";

export function isMastered(rec) {
  return !!(rec && rec.sr && rec.sr.reps >= 3);
}

export function flagStatus(flags, code) {
  const r = flags[code];
  if (isMastered(r)) return "mastered";
  if (r && r.seen > 0) return "learning";
  return "locked";
}

export function masteredCount(flags) {
  return COUNTRIES.filter((c) => isMastered(flags[c.code])).length;
}

export function regionTotal(region) {
  return COUNTRIES.filter((c) => c.region === region).length;
}

export function masteredInRegion(flags, region) {
  return COUNTRIES.filter((c) => c.region === region && isMastered(flags[c.code])).length;
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
  return COUNTRIES.map((c) => {
    const r = flags[c.code];
    return { c, acc: accuracyOf(r), seen: r ? r.seen : 0, sr: r ? r.sr : null };
  })
    .filter((x) => x.seen > 0)
    .sort((a, b) => a.acc - b.acc || a.seen - b.seen)
    .slice(0, n);
}