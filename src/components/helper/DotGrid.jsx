import React, { useEffect, useRef } from "react";

/**
 * Fixed dot-grid that illuminates around the cursor. Every dot rests
 * almost invisible; within a radius of the pointer it brightens and
 * blends from the violet accent toward cyan, so moving the mouse reveals
 * the grid — on-brand with the aurora tokens.
 *
 * Pure <canvas>, no dependency. Draws on demand (rAF-throttled per mouse
 * move, not a continuous loop), so it's idle-cheap. Caps device-pixel-ratio,
 * honours prefers-reduced-motion and coarse/touch pointers (static faint
 * grid, no tracking), and reads the design-system accent tokens.
 */
const DotGrid = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const canHover =
      window.matchMedia("(hover: hover)").matches &&
      window.matchMedia("(pointer: fine)").matches;

    // ---- palette (read from CSS tokens, with fallbacks) ----
    const rootStyles = getComputedStyle(document.documentElement);
    const toRgb = (hex, fallback) => {
      const h = (hex || "").trim().replace("#", "");
      if (h.length !== 6) return fallback;
      const n = parseInt(h, 16);
      if (Number.isNaN(n)) return fallback;
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };
    const accent = toRgb(rootStyles.getPropertyValue("--accent"), [168, 85, 247]);
    const accent2 = toRgb(rootStyles.getPropertyValue("--accent-2"), [34, 211, 238]);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let gap = 32;
    let radius = 170; // cursor influence radius
    let cols = 0;
    let rows = 0;
    let offX = 0;
    let offY = 0;
    const mouse = { x: -9999, y: -9999 };
    let scheduled = 0;

    const build = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const mobile = w < 768;
      gap = mobile ? 40 : 32;
      radius = mobile ? 120 : 170;
      cols = Math.ceil(w / gap) + 1;
      rows = Math.ceil(h / gap) + 1;
      // centre the grid so edges stay even on any viewport
      offX = (w - (cols - 1) * gap) / 2;
      offY = (h - (rows - 1) * gap) / 2;
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const r2 = radius * radius;

      for (let iy = 0; iy < rows; iy += 1) {
        const y = offY + iy * gap;
        for (let ix = 0; ix < cols; ix += 1) {
          const x = offX + ix * gap;
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const dist2 = dx * dx + dy * dy;

          let t = 0;
          if (dist2 < r2) {
            t = 1 - Math.sqrt(dist2) / radius;
            t *= t; // ease-in so the falloff feels soft
          }

          // violet at rest, blending toward cyan at the cursor
          const cr = Math.round(accent[0] + (accent2[0] - accent[0]) * t);
          const cg = Math.round(accent[1] + (accent2[1] - accent[1]) * t);
          const cb = Math.round(accent[2] + (accent2[2] - accent[2]) * t);
          const alpha = 0.05 + t * 0.85;
          const dotR = 1 + t * 1.7;

          ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, dotR, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const requestDraw = () => {
      if (scheduled) return;
      scheduled = window.requestAnimationFrame(() => {
        scheduled = 0;
        draw();
      });
    };

    const onResize = () => {
      build();
      draw();
    };
    const onMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      requestDraw();
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
      requestDraw();
    };

    build();
    draw();
    window.addEventListener("resize", onResize);

    // Static faint grid only for reduced-motion / touch devices.
    if (prefersReduced || !canHover) {
      return () => window.removeEventListener("resize", onResize);
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseout", onLeave);

    return () => {
      if (scheduled) window.cancelAnimationFrame(scheduled);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="aurora__dots" aria-hidden="true" />;
};

export default DotGrid;
