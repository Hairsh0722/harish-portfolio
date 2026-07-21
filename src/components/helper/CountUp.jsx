import { useEffect, useRef, useState } from "react";

/**
 * CountUp — animates a number from 0 to `end` when it scrolls into view.
 * Re-triggers on every entry (resets on leave) to match the site's
 * re-playing scroll-reveal behaviour. Honours reduced motion by showing
 * the final value immediately.
 */
export default function CountUp({ end, duration = 1500, suffix = "" }) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setValue(end);
      return undefined;
    }

    let raf = 0;
    let startTs = 0;
    const step = (ts) => {
      if (!startTs) startTs = ts;
      const p = Math.min((ts - startTs) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setValue(Math.round(eased * end));
      if (p < 1) raf = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          cancelAnimationFrame(raf);
          if (entry.isIntersecting) {
            startTs = 0;
            raf = requestAnimationFrame(step);
          } else {
            setValue(0); // reset so it counts again next time it enters
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(node);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [end, duration]);

  return (
    <span ref={ref}>
      {value}
      {suffix && <span className="accent">{suffix}</span>}
    </span>
  );
}
