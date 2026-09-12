/**
 * useGsapScrollReveal
 * Registers a GSAP ScrollTrigger "fromTo" reveal on every element that has
 * [data-reveal] inside the given container ref. Call once in a useEffect.
 *
 * Usage:
 *   const containerRef = useRef(null);
 *   useGsapScrollReveal(containerRef);
 *   <div ref={containerRef}>
 *     <div data-reveal>…</div>
 *   </div>
 */
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useGsapScrollReveal(containerRef, deps = []) {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray("[data-reveal]").forEach((el) => {
        const delay = parseFloat(el.dataset.revealDelay || "0");
        gsap.fromTo(
          el,
          { opacity: 0, y: 28, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.65,
            delay,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          },
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, deps);
}

/**
 * initSmoothScroll
 * Applies GSAP's inertia-style smooth scrolling to the whole page.
 * Call once at app mount (e.g. in main.jsx or a top-level component).
 * Uses native scroll + GSAP ticker for a buttery feel without
 * replacing the scroll model (so anchor links / keyboard still work).
 */
export function initSmoothScroll() {
  // Only on desktop — mobile already has momentum scrolling
  if (typeof window === "undefined") return;
  if (window.matchMedia("(pointer: coarse)").matches) return;

  let currentY = window.scrollY;
  let targetY = window.scrollY;
  const ease = 0.1; // lower = slower / smoother

  function onWheel(e) {
    e.preventDefault();
    targetY += e.deltaY;
    targetY = Math.max(0, Math.min(targetY, document.body.scrollHeight - window.innerHeight));
  }

  function tick() {
    const diff = targetY - currentY;
    if (Math.abs(diff) < 0.5) {
      currentY = targetY;
    } else {
      currentY += diff * ease;
    }
    window.scrollTo(0, currentY);
    ScrollTrigger.update();
  }

  window.addEventListener("wheel", onWheel, { passive: false });
  gsap.ticker.add(tick);

  return () => {
    window.removeEventListener("wheel", onWheel);
    gsap.ticker.remove(tick);
  };
}
