import { useEffect } from "react";

/**
 * Reveal — dependency-free scroll & pointer motion layer.
 *
 * 1. Scroll reveal: any element tagged `data-reveal` (optional value:
 *    "up" | "left" | "right" | "scale" | "fade") fades in as it enters the
 *    viewport. A parent tagged `data-reveal-children` staggers its direct
 *    children in sequence. Driven by a single IntersectionObserver — no
 *    scroll handlers, no library.
 * 2. Card spotlight: elements tagged `data-spotlight` track the pointer with
 *    a soft accent glow (fed via the --mx/--my custom properties).
 *
 * Both are gated on `prefers-reduced-motion` and a fine/hover pointer, so the
 * page stays fully visible and static when motion is disabled — the hidden
 * states live under a `no-preference` media query in CSS, so nothing can get
 * stuck invisible if this component never runs.
 */
export default function Reveal({ ready = true }) {
  useEffect(() => {
    if (!ready) return undefined;

    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return undefined;

    // ---- 1. Scroll reveal --------------------------------------------------
    const STAGGER = 90; // ms between staggered children

    // Show a staggered group; hiding resets the delay so children fade out
    // together and re-stagger cleanly the next time they scroll into view.
    const toggleGroup = (parent, show) => {
      Array.from(parent.children).forEach((kid, i) => {
        kid.style.transitionDelay = show ? `${i * STAGGER}ms` : "0ms";
        kid.classList.toggle("is-revealed", show);
      });
    };

    // Re-triggering observer: reveal on enter, hide on leave — so scrolling
    // back up hides the elements and scrolling down replays the animation.
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          const show = entry.isIntersecting;
          if (el.hasAttribute("data-reveal-children")) {
            toggleGroup(el, show);
          } else {
            const delay = el.getAttribute("data-reveal-delay");
            if (delay) el.style.transitionDelay = show ? `${delay}ms` : "0ms";
            el.classList.toggle("is-revealed", show);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    const targets = document.querySelectorAll(
      "[data-reveal], [data-reveal-children]"
    );
    targets.forEach((el) => io.observe(el));

    // ---- 2. Card spotlight -------------------------------------------------
    const finePointer =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const onPointerMove = (e) => {
      const card = e.target.closest("[data-spotlight]");
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--mx", `${x}%`);
      card.style.setProperty("--my", `${y}%`);
    };

    if (finePointer) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    // ---- 3. Magnetic buttons ----------------------------------------------
    // Tagged elements (`data-magnetic`, optional strength value) ease toward
    // the pointer while hovered and spring back on leave. The transform
    // transition already lives on the target's own CSS (.btn / .nav-cta).
    const magnetCleanups = [];
    if (finePointer) {
      document.querySelectorAll("[data-magnetic]").forEach((el) => {
        const strength = parseFloat(el.getAttribute("data-magnetic")) || 0.3;
        const onMove = (e) => {
          const r = el.getBoundingClientRect();
          const x = (e.clientX - (r.left + r.width / 2)) * strength;
          const y = (e.clientY - (r.top + r.height / 2)) * strength;
          el.style.transform = `translate(${x}px, ${y}px)`;
        };
        const onLeave = () => {
          el.style.transform = "";
        };
        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);
        magnetCleanups.push(() => {
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", onLeave);
          el.style.transform = "";
        });
      });
    }

    return () => {
      io.disconnect();
      if (finePointer) window.removeEventListener("pointermove", onPointerMove);
      magnetCleanups.forEach((fn) => fn());
    };
  }, [ready]);

  return null;
}
