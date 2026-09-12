import { useEffect, useRef, useState } from "react";

/** Tracks elapsed wall-clock time and freezes cleanly when a round ends. */
export function useElapsedTimer(running = true, resetKey = 0) {
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
    const update = () => setElapsedMs(Date.now() - startedAtRef.current);
    update();
    const interval = window.setInterval(update, 250);
    return () => window.clearInterval(interval);
  }, [running]);

  return elapsedMs;
}

export function formatElapsedTime(milliseconds) {
  const totalSeconds = Math.max(0, Math.round((milliseconds || 0) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes ? `${minutes}m ${String(seconds).padStart(2, "0")}s` : `${seconds}s`;
}
