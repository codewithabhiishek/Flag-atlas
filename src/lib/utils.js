import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Safe iframe check — avoids crashing in non-browser contexts (SSR, tests)
export const isIframe =
  typeof window !== "undefined" && window.self !== window.top;
