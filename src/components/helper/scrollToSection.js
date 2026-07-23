// Shared smooth-scroll helper for the single-page layout.
// Routes through Lenis (buttery smooth) when active; otherwise falls back to
// native scrolling. Respects prefers-reduced-motion via an instant jump.
import { smoothScrollTo } from "./smoothScroll";

export const SECTION_IDS = [
  "home",
  "about",
  "education",
  "skills",
  "projects",
  "resume",
  "contact",
];

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function scrollToSection(id) {
  const reduce = prefersReducedMotion();
  const behavior = reduce ? "auto" : "smooth";

  // "home" (and anything unresolved) means the very top of the page.
  if (!id || id === "home" || id === "top") {
    if (!reduce && smoothScrollTo(0)) return;
    window.scrollTo({ top: 0, behavior });
    return;
  }

  const el = document.getElementById(id);
  if (el) {
    if (!reduce && smoothScrollTo(el, { section: true })) return;
    el.scrollIntoView({ behavior, block: "start" });
  } else {
    if (!reduce && smoothScrollTo(0)) return;
    window.scrollTo({ top: 0, behavior });
  }
}
