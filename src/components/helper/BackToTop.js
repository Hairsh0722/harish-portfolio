import React, { useEffect, useState } from "react";
import { FiArrowUp } from "react-icons/fi";
import { smoothScrollTo } from "./smoothScroll";

/**
 * Floating "back to top" button. Hidden at the top of the page, fades in once
 * the visitor has scrolled past ~60% of a viewport, and smooth-scrolls back up
 * (instant jump under prefers-reduced-motion). Styled as a glass rounded-square
 * with the primary theme accent; it re-themes with the rest of the site.
 */
const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce && smoothScrollTo(0)) return;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      className={`back-to-top ${visible ? "is-visible" : ""}`}
      onClick={toTop}
      aria-label="Back to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
    >
      <FiArrowUp aria-hidden="true" />
    </button>
  );
};

export default BackToTop;
