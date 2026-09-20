// Shared by the auth pages (Login, Register, and any page that resumes a flow
// after sign-in, e.g. the MCP OAuth consent page). Keep the redirect
// validation in one place — it is security-sensitive and easy to drift.

// Resolve ?returnTo= to a safe same-origin path, else "/".
//
// The same-origin check alone is not enough: a value like /.//evil.com or
// /\evil.com parses same-origin but normalizes to a protocol-relative
// //evil.com when assigned to location.href — an open redirect. So require the
// resolved path to be exactly one leading slash (no "//" prefix, no backslash).
export function safeReturnTo(urlString, origin) {
  let raw = null;
  const currentOrigin =
    origin || (typeof window !== "undefined" && window.location ? window.location.origin : "http://localhost");

  if (urlString != null) {
    if (urlString.startsWith("?") || urlString.includes("?")) {
      const search = urlString.startsWith("?") ? urlString : urlString.slice(urlString.indexOf("?"));
      raw = new URLSearchParams(search).get("returnTo");
    } else {
      raw = urlString;
    }
  } else if (typeof window !== "undefined" && window.location) {
    raw = new URLSearchParams(window.location.search).get("returnTo");
  }

  if (!raw || raw.includes("\\") || raw.startsWith("//")) return "/";
  try {
    const url = new URL(raw, currentOrigin);
    if (url.origin !== currentOrigin) return "/";
    // Only access_token/clear_access_token are still URL-read by app-params.js, but the
    // whole bootstrap set stays stripped: one going back to a URL read must not silently
    // become injectable again. Normal app-flow params (e.g. the OAuth consent ctx) are kept.
    for (const p of [
      "access_token",
      "clear_access_token",
      "app_id",
      "app_base_url",
      "functions_version",
      "from_url",
    ]) {
      url.searchParams.delete(p);
    }
    const path = url.pathname + url.search;
    if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return "/";
    return path;
  } catch {
    return "/";
  }
}
