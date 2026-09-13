import { useEffect, useRef, useState } from "react";

/**
 * Tracks elapsed active time and freezes cleanly when a round ends.
 *
 * With `pauseOnHidden` (default true), time spent while the tab is hidden
 * (switched away, minimized) does NOT count — a question left open in the
 * background for an hour should not show "1h 2m" when you come back.
 */
export function useElapsedTimer(running = true, resetKey = 0, { pauseOnHidden = true } = {}) {
  const startedAtRef = useRef(Date.now());
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    startedAtRef.current = Date.now();
    setElapsedMs(0);
  }, [resetKey]);

  useEffect(() => {
    if (!running) {
      setElapsedMs(Date.now() - startedAtRef.current);
      return undefined;
    }
    const update = () => {
      // While hidden, keep shifting the start forward so background time
      // is never accumulated — on return, the clock resumes where it left.
      if (pauseOnHidden && document.visibilityState === "hidden") {
        startedAtRef.current = Date.now();
        return;
      }
      setElapsedMs(Date.now() - startedAtRef.current);
    };
    update();
    const interval = window.setInterval(update, 250);
    // Also fire immediately on visibility changes so the clock resumes
    // (or pauses) the instant the tab is shown/hidden, not a tick later.
    const onVisible = () => update();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [running, pauseOnHidden]);

  return elapsedMs;
}

export function formatElapsedTime(milliseconds) {
  const totalSeconds = Math.max(0, Math.round((milliseconds || 0) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes ? `${minutes}m ${String(seconds).padStart(2, "0")}s` : `${seconds}s`;
}
