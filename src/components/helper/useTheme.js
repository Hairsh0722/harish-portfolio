import { useCallback, useEffect, useState } from "react";

/**
 * Light/dark theme state for the app.
 *
 * The initial value is read from the `data-theme` attribute that the inline
 * script in public/index.html already set before first paint (from a saved
 * choice, else the OS preference) — so there's no flash. This hook keeps
 * <html data-theme> and the browser <meta theme-color> in sync, follows the OS
 * until the visitor makes an explicit choice, and persists that choice.
 */
const THEME_KEY = "theme";
const META_COLORS = { dark: "#08070f", light: "#f4f3fb" };

const readInitialTheme = () => {
  if (typeof document !== "undefined") {
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "light" || attr === "dark") return attr;
  }
  return "dark";
};

export default function useTheme() {
  const [theme, setTheme] = useState(readInitialTheme);

  // reflect the current theme onto <html> and the browser chrome color
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", META_COLORS[theme] || META_COLORS.dark);
  }, [theme]);

  // follow the OS setting until the visitor has picked a theme themselves
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = (e) => {
      let saved = null;
      try {
        saved = localStorage.getItem(THEME_KEY);
      } catch (err) {
        saved = null;
      }
      if (saved === "light" || saved === "dark") return; // explicit choice wins
      setTheme(e.matches ? "light" : "dark");
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange); // older Safari
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else if (mq.removeListener) mq.removeListener(onChange);
    };
  }, []);

  const toggleTheme = useCallback(
    (e) => {
      const next = theme === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (err) {
        /* storage unavailable — theme still applies for this session */
      }

      const reduce =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const canWipe =
        typeof document !== "undefined" &&
        typeof document.startViewTransition === "function" &&
        !reduce;

      if (!canWipe) {
        setTheme(next);
        return;
      }

      // Anchor the circular wipe at the click point (the toggle button),
      // falling back to the top-centre if no coordinates are available.
      const root = document.documentElement;
      const x = e && e.clientX != null ? `${e.clientX}px` : "50%";
      const y = e && e.clientY != null ? `${e.clientY}px` : "8%";
      root.style.setProperty("--vt-x", x);
      root.style.setProperty("--vt-y", y);
      root.classList.add("theme-vt");

      const transition = document.startViewTransition(() => {
        // Flip the attribute synchronously so the "after" snapshot is the
        // new theme; React state is updated too, keeping the hook in sync.
        root.setAttribute("data-theme", next);
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
          meta.setAttribute("content", META_COLORS[next] || META_COLORS.dark);
        }
        setTheme(next);
      });
      transition.finished.finally(() => root.classList.remove("theme-vt"));
    },
    [theme]
  );

  return [theme, toggleTheme];
}
