import React, { useEffect, useMemo, useState } from "react";
import GitHubCalendar from "react-github-calendar";
import { useTranslation } from "react-i18next";

const GITHUB_USERNAME = "Hairsh0722";

// react-github-calendar does JS-level colour parsing on the theme it's given,
// so it must receive real hex values — not "var(--accent)" strings. Instead we
// build the 5-level ramp from the *resolved* accent colour at runtime and
// rebuild it whenever the theme OR the accent palette changes, so the calendar
// tracks the accent switcher just like the rest of the UI.

const FALLBACK_ACCENT = [168, 85, 247];
const FALLBACK_BASE = [13, 11, 24];

function parseColorToRgb(str, fallback) {
  if (!str) return fallback;
  const s = str.trim();
  if (s.startsWith("#")) {
    let h = s.slice(1);
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const n = parseInt(h, 16);
    if (Number.isNaN(n)) return fallback;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const m = s.match(/[\d.]+/g); // rgb()/rgba() -> first three numbers
  if (m && m.length >= 3) return [Number(m[0]), Number(m[1]), Number(m[2])];
  return fallback;
}

function toHex([r, g, b]) {
  const h = (v) =>
    Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

// blend colour a toward colour b by t (0 = a, 1 = b)
function blend(a, b, t) {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

// Resolve --accent to concrete RGB. The token can be a var()/color-mix() chain,
// which only computes on a real property — so read `color` off a throwaway span.
function resolveAccent() {
  if (typeof document === "undefined") return FALLBACK_ACCENT;
  try {
    const probe = document.createElement("span");
    probe.style.cssText =
      "color:var(--accent);position:absolute;opacity:0;pointer-events:none;";
    document.body.appendChild(probe);
    const rgb = parseColorToRgb(getComputedStyle(probe).color, FALLBACK_ACCENT);
    document.body.removeChild(probe);
    return rgb;
  } catch (e) {
    return FALLBACK_ACCENT;
  }
}

// Empty days fade toward the card background (theme-aware via --bg-elev-1);
// the peak level is the accent itself — so the ramp recolours with the palette.
function buildRamp() {
  const base =
    typeof document !== "undefined"
      ? parseColorToRgb(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--bg-elev-1"
          ),
          FALLBACK_BASE
        )
      : FALLBACK_BASE;
  const accent = resolveAccent();
  return {
    level0: toHex(blend(accent, base, 0.88)),
    level1: toHex(blend(accent, base, 0.66)),
    level2: toHex(blend(accent, base, 0.44)),
    level3: toHex(blend(accent, base, 0.22)),
    level4: toHex(accent),
  };
}

// Bump a tick whenever <html data-theme|data-accent|style> changes so the ramp
// recomputes. (style catches the inline --accent-raw a Custom colour writes.)
function useAppearanceTick() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const el = document.documentElement;
    const obs = new MutationObserver(() => setTick((t) => t + 1));
    obs.observe(el, {
      attributes: true,
      attributeFilter: ["data-theme", "data-accent", "style"],
    });
    return () => obs.disconnect();
  }, []);
  return tick;
}

function Github() {
  const { t } = useTranslation();
  const tick = useAppearanceTick();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const calendarTheme = useMemo(() => buildRamp(), [tick]);

  return (
    <div className="github-activity">
      <h3 className="github-activity__heading">{t("about.github.heading")}</h3>
      <p className="github-activity__sub lead">{t("about.github.sub")}</p>
      <div className="glass github-activity__card">
        <GitHubCalendar
          username={GITHUB_USERNAME}
          theme={calendarTheme}
          blockSize={12}
          blockMargin={4}
          blockRadius={2}
          fontSize={14}
          labels={{ totalCount: t("about.github.totalCount") }}
          style={{ color: "var(--text-primary)", maxWidth: "100%" }}
        />
      </div>
    </div>
  );
}

export default Github;
