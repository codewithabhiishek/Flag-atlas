/**
 * GSAP + Lenis Smooth Scroll Integration
 *
 * Replaces broken wheel-hijacking with Lenis, the industry standard smooth
 * scroll engine designed specifically for GSAP ScrollTrigger.
 * Preserves native Mac trackpad momentum and touch inertia while providing
 * silky-smooth 60/120fps scrolling on mouse wheel without getting stuck.
 */
import { useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger);

let lenisInstance = null;

export function initSmoothScroll() {
  if (typeof window === "undefined") return;
  if (lenisInstance) return lenisInstance;

  // Initialize Lenis with gentle, responsive easing
  lenisInstance = new Lenis({
    duration: 0.9,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    syncTouch: false, // Keep native touch/trackpad feel without sticky lag
  });

  // Synchronize Lenis scroll positions with GSAP ScrollTrigger
  lenisInstance.on("scroll", ScrollTrigger.update);

  // Use GSAP's internal ticker for buttery 60/120Hz synchronization
  gsap.ticker.add((time) => {
    lenisInstance?.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  return lenisInstance;
}

export function getLenis() {
  return lenisInstance;
}

/**
 * Sync a thin header indicator with the document's actual scroll progress.
 * ScrollTrigger also receives Lenis updates, so wheel, trackpad and touch
 * scrolling all update the same element without React re-renders.
 */
export function useGsapScrollProgress(indicatorRef, routeKey = "") {
  useLayoutEffect(() => {
    const indicator = indicatorRef?.current;
    if (!indicator || typeof window === "undefined") return;

    const ctx = gsap.context(() => {
      gsap.set(indicator, { scaleX: 0, transformOrigin: "left center" });
      ScrollTrigger.create({
        start: 0,
        end: () => Math.max(1, ScrollTrigger.maxScroll(window)),
        invalidateOnRefresh: true,
        onUpdate: (trigger) => gsap.set(indicator, { scaleX: trigger.progress }),
      });
      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, [indicatorRef, routeKey]);
}

/**
 * useGsapScrollReveal
 * Registers a light GSAP ScrollTrigger reveal on elements with [data-reveal].
 */
export function useGsapScrollReveal(containerRef, deps = []) {
  useEffect(() => {
    if (!containerRef?.current) return;

    const ctx = gsap.context(() => {
      const elements = containerRef.current.querySelectorAll("[data-reveal]");
      elements.forEach((el) => {
        const delay = parseFloat(el.dataset.revealDelay || "0");
        gsap.fromTo(
          el,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            delay,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          },
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, deps);
}
