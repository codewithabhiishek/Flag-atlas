import { useEffect } from "react";

/**
 * Flag prefetching — kills the "flag takes a moment to appear" delay.
 *
 * Flags are SVGs served from flagcdn.com. The first fetch in a session pays a
 * DNS + TLS handshake, and every on-demand fetch pays a network round trip
 * while the player stares at a blank box. Prefetching the next few flags in
 * the queue via `new Image()` warms the browser cache so the next question's
 * flag renders instantly.
 */

const prefetched = new Set();

export function prefetchFlag(code) {
  if (!code || prefetched.has(code)) return;
  prefetched.add(code);
  const img = new Image();
  img.decoding = "async";
  img.src = `https://flagcdn.com/${code}.svg`;
}

/**
 * Prefetch the flags at `queue[index + 1 .. index + ahead]`.
 * Pass any array of country objects with a `.code` property.
 */
export function useFlagPrefetch(queue, index = 0, ahead = 3) {
  useEffect(() => {
    if (!queue?.length) return;
    const start = Math.max(0, index);
    const end = Math.min(index + ahead, queue.length - 1);
    for (let i = start; i <= end; i++) {
      const item = queue[i];
      const code = item?.code || item?.flag || (typeof item === "string" ? item : null);
      if (code) prefetchFlag(code);
    }
  }, [queue, index, ahead]);
}
