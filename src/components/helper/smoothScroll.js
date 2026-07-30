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
    // framerate lerp — that's what gives the eased, momentum-rich feel rather
    // than a hard snap.
    //
    // DURATION is the single knob for how the page *feels*. It's how long a
    // wheel tick takes to settle. 1.2s reads as heavy and laggy: the page is
    // still gliding well after you've stopped scrolling, and every correction
    // fights the tail of the last one. 0.85 keeps the ease but tracks the
    // wheel closely enough to feel responsive. Raise toward 1.2 for a heavier
    // glide, drop toward 0.6 for near-native snap.
    duration: 0.85,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    // Slightly over 1 so one wheel notch covers a bit more ground — with the
    // shorter duration this keeps the total travel per gesture about the same.
    wheelMultiplier: 1.1,
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
