import React, { useEffect, useRef } from "react";

/**
 * Custom aurora cursor. A crisp accent dot tracks the pointer 1:1 while a
 * ring and a soft glow ease behind it — the glow blends into the backdrop
 * (screen in dark mode, multiply in light) so moving the mouse lights the
 * scene and pairs with the dot-grid that reacts to the pointer.
 *
 * Purely decorative and additive. It only activates on hover-capable, fine
 * pointers with motion allowed; on touch devices or with prefers-reduced-motion
 * it renders inert markup and the native cursor is used.
 */
const Cursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const canHover = window.matchMedia("(hover: hover)").matches;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!fine || !canHover || reduced) return undefined;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const glow = glowRef.current;
    if (!dot || !ring || !glow) return undefined;

    const root = document.documentElement;
    root.classList.add("has-aurora-cursor");

    // start off-screen so nothing flashes at 0,0 before the first move
    const target = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    const glowPos = { x: -100, y: -100 };
    let raf = 0;
    let visible = false;

    const interactiveSel =
      'a, button, [role="button"], input, textarea, select, label, summary, .btn, [data-cursor="link"]';

    const lerp = (a, b, n) => a + (b - a) * n;
    const place = (el, x, y) => {
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    };

    const render = () => {
      // dot snaps to the pointer; ring and glow trail with easing
      place(dot, target.x, target.y);
      ringPos.x = lerp(ringPos.x, target.x, 0.4);
      ringPos.y = lerp(ringPos.y, target.y, 0.4);
      glowPos.x = lerp(glowPos.x, target.x, 0.22);
      glowPos.y = lerp(glowPos.y, target.y, 0.22);
      place(ring, ringPos.x, ringPos.y);
      place(glow, glowPos.x, glowPos.y);

      // Stop the loop once the trailing ring/glow have caught up to the
      // pointer — no point burning frames (and stealing scroll budget) while
      // the cursor is at rest. A new pointer move kicks it back off.
      const settled =
        Math.abs(ringPos.x - target.x) +
          Math.abs(ringPos.y - target.y) +
          Math.abs(glowPos.x - target.x) +
          Math.abs(glowPos.y - target.y) <
        0.5;
      raf = settled ? 0 : window.requestAnimationFrame(render);
    };

    // (re)start the easing loop; no-op if it's already running
    const kick = () => {
      if (!raf) raf = window.requestAnimationFrame(render);
    };

    const reveal = () => {
      if (visible) return;
      visible = true;
      root.classList.add("cursor-visible");
    };
    const onMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      reveal();
      kick();
    };
    const onOver = (e) => {
      const hit = e.target.closest && e.target.closest(interactiveSel);
      root.classList.toggle("cursor-hover", Boolean(hit));
    };
    const onDown = () => root.classList.add("cursor-down");
    const onUp = () => root.classList.remove("cursor-down");
    const onLeave = () => {
      visible = false;
      root.classList.remove("cursor-visible");
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", reveal);
    raf = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", reveal);
      root.classList.remove(
        "has-aurora-cursor",
        "cursor-visible",
        "cursor-hover",
        "cursor-down"
      );
    };
  }, []);

  return (
    <div className="cursor" aria-hidden="true">
      <div ref={glowRef} className="cursor__glow" />
      <div ref={ringRef} className="cursor__ring" />
      <div ref={dotRef} className="cursor__dot" />
    </div>
  );
};

export default Cursor;
