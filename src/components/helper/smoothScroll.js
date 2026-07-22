import Lenis from "lenis";

/**
 * Smooth scrolling powered by Lenis — the same library and feel as the
 * reference site (chiragchrg.netlify.app): lerp 0.1, driven by our own rAF
 * loop. Exposed as a module singleton so the navbar, deep-links and
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
    lerp: 0.1,
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1,
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
