import { lazy } from "react";

const RETRY_KEY = "flagatlas.chunkReloaded";

/**
 * Wraps React.lazy() so that if a new deployment invalidates old hashed JS chunks
 * while a user's tab is open, the browser automatically reloads once to fetch
 * the fresh bundle instead of hanging or breaking navigation.
 */
export function lazyWithRetry(importer) {
  return lazy(async () => {
    try {
      const mod = await importer();
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.removeItem(RETRY_KEY);
      }
      return mod;
    } catch (err) {
      if (typeof sessionStorage !== "undefined" && !sessionStorage.getItem(RETRY_KEY)) {
        sessionStorage.setItem(RETRY_KEY, "1");
        window.location.reload();
        return new Promise(() => {});
      }
      throw err;
    }
  });
}

export const ROUTE_IMPORTERS = {
  "/atlas": () => import("@/pages/Home"),
  "/learn": () => import("@/pages/Learn"),
  "/play": () => import("@/pages/ModePicker"),
  "/battle": () => import("@/pages/Battle"),
  "/dashboard": () => import("@/pages/Dashboard"),
  "/review": () => import("@/pages/ReviewDeck"),
};

const prefetched = new Set();

export function prefetchRoute(path) {
  const loader = ROUTE_IMPORTERS[path];
  if (!loader || prefetched.has(path)) return;
  prefetched.add(path);
  loader().catch(() => {
    prefetched.delete(path);
  });
}

export function prefetchPrimaryRoutes() {
  if (typeof window === "undefined") return;
  const run = () => {
    Object.keys(ROUTE_IMPORTERS).forEach((path) => prefetchRoute(path));
  };
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(run, { timeout: 1500 });
  } else {
    window.setTimeout(run, 600);
  }
}
