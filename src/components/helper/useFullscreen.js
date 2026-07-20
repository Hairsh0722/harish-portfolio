import { useCallback, useEffect, useState } from "react";

/**
 * Cross-browser fullscreen state for a target element (defaults to the whole
 * document). Tracks whether we're currently fullscreen, exposes a toggle, and
 * reports whether the browser supports the Fullscreen API at all.
 *
 * `supported` is false on iOS Safari (which only allows fullscreen on <video>),
 * so callers can hide the control there instead of showing a dead button.
 *
 * @param {React.RefObject<HTMLElement>} [targetRef] element to expand; when
 *   omitted the entire page (documentElement) goes fullscreen.
 */
const fsElement = () =>
  document.fullscreenElement || document.webkitFullscreenElement || null;

const request = (el) => {
  if (el.requestFullscreen) return el.requestFullscreen();
  if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
  return null;
};

const exit = () => {
  if (document.exitFullscreen) return document.exitFullscreen();
  if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
  return null;
};

export default function useFullscreen(targetRef) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    setSupported(!!(root.requestFullscreen || root.webkitRequestFullscreen));

    const onChange = () => setIsFullscreen(!!fsElement());
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    onChange();
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);

  const toggle = useCallback(() => {
    const el = (targetRef && targetRef.current) || document.documentElement;
    // Requests can reject (permission/gesture rules) — swallow so we never
    // surface an unhandled promise rejection to the console.
    const p = fsElement() ? exit() : request(el);
    if (p && p.catch) p.catch(() => {});
  }, [targetRef]);

  return { isFullscreen, toggle, supported };
}
