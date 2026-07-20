// The resume section is hidden by default in the single-page scroll layout —
// it only appears when the user explicitly asks for it (the Resume nav item,
// the hero "View Resume" button, or a /resume deep-link). This tiny event
// channel lets those decoupled triggers ask the Resume section to reveal
// itself, so no shared state has to be threaded through the tree.

const RESUME_SHOW_EVENT = "resume:show";

export function requestResume() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(RESUME_SHOW_EVENT));
}

export function onResumeRequest(handler) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(RESUME_SHOW_EVENT, handler);
  return () => window.removeEventListener(RESUME_SHOW_EVENT, handler);
}
