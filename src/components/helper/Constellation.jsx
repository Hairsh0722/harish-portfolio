import React, { useEffect, useRef } from "react";

/**
 * Interactive particle-constellation layer for the aurora backdrop.
 * Pure <canvas> — no dependency. Dots drift, connect with thin lines
 * when near, and reach toward the cursor. Uses the design-system
 * accent tokens so it stays on-brand.
 *
 * Performance: device-pixel-ratio is capped, particle count scales with
 * the viewport (and drops on mobile), the loop pauses while the tab is
 * hidden, and it honours prefers-reduced-motion (renders a single static
 * frame with no animation loop and no cursor tracking).
 */
const Constellation = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

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
    let particles = [];
    let linkDist = 150;
    let rafId = 0;
    // Cap the draw rate (~32fps) and freeze the loop while the page is being
    // actively scrolled, so the animation never competes with the compositor
    // for frame budget — the background dots hold a static frame mid-scroll,
    // which is imperceptible, and resume the moment scrolling settles.
    const FRAME_MS = 1000 / 32;
    let lastTs = 0;
    let scrolling = false;
    let scrollTimer = 0;
    const mouse = { x: -9999, y: -9999, active: false };

    const build = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const mobile = w < 768;
      linkDist = mobile ? 110 : 150;
      const divisor = mobile ? 28000 : 19000;
      const cap = mobile ? 40 : 90;
      const count = Math.min(cap, Math.floor((w * h) / divisor));

      particles = new Array(count).fill(0).map((_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.1 + 1.1,
        c: i % 3 === 0 ? accent2 : accent, // ~1/3 cyan, the rest violet
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];

        // links between neighbouring particles
        for (let j = i + 1; j < particles.length; j += 1) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d = Math.hypot(dx, dy);
          if (d < linkDist) {
            const a = (1 - d / linkDist) * 0.18;
            ctx.strokeStyle = `rgba(${p.c[0]},${p.c[1]},${p.c[2]},${a})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }

        // links reaching toward the cursor
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d = Math.hypot(dx, dy);
          const reach = linkDist * 1.4;
          if (d < reach) {
            const a = (1 - d / reach) * 0.45;
            ctx.strokeStyle = `rgba(${p.c[0]},${p.c[1]},${p.c[2]},${a})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }

        // the dot itself
        ctx.fillStyle = `rgba(${p.c[0]},${p.c[1]},${p.c[2]},0.65)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = (ts) => {
      rafId = window.requestAnimationFrame(step);
      if (ts - lastTs < FRAME_MS) return; // throttle to ~32fps
      lastTs = ts;

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = w + 10;
        else if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        else if (p.y > h + 10) p.y = -10;
      }
      draw();
    };

    const start = () => {
      if (!rafId && !scrolling && !document.hidden) {
        lastTs = 0;
        rafId = window.requestAnimationFrame(step);
      }
    };
    const stop = () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const onResize = () => {
      build();
      if (prefersReduced) draw();
    };
    const onMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const onLeave = () => {
      mouse.active = false;
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    const onScroll = () => {
      scrolling = true;
      stop(); // hold the current frame; free the main thread for scrolling
      if (scrollTimer) window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        scrolling = false;
        start();
      }, 180);
    };

    build();

    // Reduced motion: one static frame, no loop, no cursor tracking.
    if (prefersReduced) {
      draw();
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseout", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      stop();
      if (scrollTimer) window.clearTimeout(scrollTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="aurora__net" aria-hidden="true" />;
};

export default Constellation;
