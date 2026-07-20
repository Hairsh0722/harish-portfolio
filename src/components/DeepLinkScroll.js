import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import scrollToSection from "./helper/scrollToSection";
import { requestResume } from "./helper/resumeReveal";

// Old routes are kept as deep-links into the single page: visiting /about
// (or a shared link to it) scrolls to that section once the app is ready.
const PATH_TO_SECTION = {
  "/": "home",
  "/about": "about",
  "/skills": "skills",
  "/projects": "projects",
  "/resume": "resume",
  "/contact": "contact",
};

function DeepLinkScroll({ ready }) {
  const { pathname } = useLocation();

  useEffect(() => {
    // The preloader locks scrolling (#no-scroll) until ready — wait for it.
    if (!ready) return;

    const id = PATH_TO_SECTION[pathname] || "home";
    if (id === "home") return; // already at the top after preload

    // Let layout settle after the scroll lock is released.
    const t = setTimeout(() => {
      // Resume is hidden by default; a /resume deep-link must reveal it first.
      if (id === "resume") requestResume();
      else scrollToSection(id);
    }, 60);
    return () => clearTimeout(t);
  }, [pathname, ready]);

  return null;
}

export default DeepLinkScroll;
