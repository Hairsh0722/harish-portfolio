import Lenis from "lenis";

/**
 * Smooth scrolling powered by Lenis — tuned for the heavy, momentum-rich
 * glide of reference portfolios (e.g. adityathakur.me): a time-based
 * duration + exponential ease-out (see startSmoothScroll), driven by our own
 * rAF loop. Exposed as a module singleton so the navbar, deep-links and
 * back-to-top button can drive programmatic scrolls through it.
 *
 * Disabled entirely under prefers-reduced-motion, so the OS accessibility
 * setting keeps instant, native scrolling.
 */
let lenis = null;
let rafId = 0;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Clearance below the fixed navbar — mirrors the sections'
// scroll-margin-top: var(--nav-h) so Lenis lands them in the same place.
function navOffset() {
  if (typeof getComputedStyle === "undefined") return 72;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(
    "--nav-h"
  );
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : 72;
}

export function getLenis() {
  return lenis;
}

export function startSmoothScroll() {
  if (lenis || prefersReducedMotion()) return lenis;

  lenis = new Lenis({
    // Time-based glide (duration + exponential ease-out) instead of a
    // framerate lerp. This is what gives the heavy, momentum-rich "buttery"
    // feel of reference portfolios like adityathakur.me — the wheel/scroll
    // settles over ~1.2s with a smooth ease rather than snapping.
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.5,
    autoRaf: false, // we drive raf() below
  });

  const raf = (time) => {
    if (!lenis) return;
    lenis.raf(time);
    rafId = requestAnimationFrame(raf);
  };
  rafId = requestAnimationFrame(raf);
  return lenis;
}

export function stopSmoothScroll() {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = 0;
  if (lenis) {
    lenis.destroy();
    lenis = null;
  }
}

/**
 * Programmatic scroll used by the navbar / deep-links / back-to-top.
 * @param target  0 | number | HTMLElement | selector
 * @param opts.section  add navbar clearance (for scrolling to a section)
 * @returns true if Lenis handled it, false to let the caller fall back.
 */
export function smoothScrollTo(target, opts = {}) {
  if (!lenis) return false;
  lenis.scrollTo(target, opts.section ? { offset: -navOffset() } : undefined);
  return true;
}

// Pause/resume around full-screen modals (e.g. the resume overlay) so Lenis
// doesn't fight a body-scroll lock.
export function pauseSmoothScroll() {
  if (lenis) lenis.stop();
}
export function resumeSmoothScroll() {
  if (lenis) lenis.start();
}
