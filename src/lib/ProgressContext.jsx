import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { reviewCard, newCard } from "@/lib/spacedRepetition";

// today() as a function so it's evaluated at call-time, not module load-time.
// A module-level `const today = new Date()...` would be stale if the app runs
// past midnight without a refresh.
const today = () => new Date().toISOString().slice(0, 10);

const KEY = "flagatlas.progress.v1";

function initial() {
  return {
    xp: 0,
    streak: 0,
    lastPlayed: null,
    flags: {},
    stats: { answered: 0, correct: 0, timePlayedMs: 0 },
    leaderboards: {},
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...initial(), ...JSON.parse(raw) };
  } catch (e) {}
  return null;
}

const Ctx = createContext(null);

export function ProgressProvider({ children }) {
  const [state, setState] = useState(() => load() || initial());

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {}
  }, [state]);

  const touchStreak = useCallback(() => {
    setState((s) => {
      const t = today();
      if (s.lastPlayed === t) return s;
      let streak = s.streak;
      if (s.lastPlayed) {
        const diff = Math.round(
          (new Date(t) - new Date(s.lastPlayed)) / 86400000,
        );
        streak = diff === 1 ? (s.streak || 0) + 1 : 1;
      } else {
        streak = 1;
      }
      return { ...s, streak, lastPlayed: t };
    });
  }, []);

  const record = useCallback(
    (code, { correct, quality, xpGain = 0, timeMs = 0 }) => {
      setState((s) => {
        const prev = s.flags[code] || {
          seen: 0,
          correct: 0,
          wrong: 0,
          sr: newCard(),
        };
        const sr = reviewCard(prev.sr, quality);
        const flags = {
          ...s.flags,
          [code]: {
            seen: prev.seen + 1,
            correct: prev.correct + (correct ? 1 : 0),
            wrong: prev.wrong + (correct ? 0 : 1),
            sr,
          },
        };
        const stats = {
          answered: s.stats.answered + 1,
          correct: s.stats.correct + (correct ? 1 : 0),
          timePlayedMs: s.stats.timePlayedMs + (timeMs || 0),
        };
        return { ...s, xp: s.xp + (xpGain || 0), flags, stats };
      });
    },
    [],
  );

  const recordLeaderboard = useCallback((region, score) => {
    setState((s) => {
      const list = (s.leaderboards[region] || []).slice();
      list.push({ score, date: today() });
      list.sort((a, b) => b.score - a.score);
      return {
        ...s,
        leaderboards: { ...s.leaderboards, [region]: list.slice(0, 10) },
      };
    });
  }, []);

  const reset = useCallback(() => setState(initial()), []);

  return (
    <Ctx.Provider
      value={{ state, touchStreak, record, recordLeaderboard, reset }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useProgress() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useProgress must be used within ProgressProvider");
  return c;
}
