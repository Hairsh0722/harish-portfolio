// Shared smooth-scroll helper for the single-page layout.
// Respects prefers-reduced-motion: falls back to an instant jump.

export const SECTION_IDS = [
  "home",
  "about",
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
  const behavior = prefersReducedMotion() ? "auto" : "smooth";

  // "home" (and anything unresolved) means the very top of the page.
  if (!id || id === "home" || id === "top") {
    window.scrollTo({ top: 0, behavior });
    return;
  }

  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior, block: "start" });
  } else {
    window.scrollTo({ top: 0, behavior });
  }
}
