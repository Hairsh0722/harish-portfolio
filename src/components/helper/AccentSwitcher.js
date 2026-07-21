import React, { useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { useTranslation } from "react-i18next";

/**
 * Accent-palette switcher (Default / Ocean / Forest / Sunset / Custom).
 *
 * Each palette is just two raw hues written onto <html data-accent="...">;
 * the CSS in style.css derives every accent token (name gradient, buttons,
 * links, rings, glows) from them, so picking a palette recolours the whole
 * UI instantly — no reload. The choice is cached to localStorage and applied
 * pre-paint by the inline script in public/index.html (so there's no flash).
 * "Custom" lets the visitor pick any primary colour; the secondary is derived
 * from it (hue-rotated) and both raw hues are persisted.
 */
const PALETTES = [
  { id: "default", colors: ["#a855f7", "#22d3ee"] },
  { id: "ocean", colors: ["#3ba9fd", "#46d5f5"] },
  { id: "forest", colors: ["#22c55e", "#2dd4bf"] },
  { id: "sunset", colors: ["#ff6b35", "#ffb43d"] },
];

const ACCENT_KEY = "accent";
const COLOR_KEY = "accentColor";
const COLOR2_KEY = "accentColor2";

/* ---- colour helpers: derive a matching secondary from a picked primary ---- */
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const int = parseInt(full, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}
function rgbToHex(r, g, b) {
  const to = (v) => Math.round(v).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}
function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  if (s === 0) return [l * 255, l * 255, l * 255];
  const hue2rgb = (p, q, t) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    hue2rgb(p, q, h + 1 / 3) * 255,
    hue2rgb(p, q, h) * 255,
    hue2rgb(p, q, h - 1 / 3) * 255,
  ];
}
// Secondary = primary hue-rotated ~30° with a small lift in saturation/lightness
// so the pair reads as a cohesive gradient rather than one flat colour.
function deriveSecondary(hex) {
  const [h, s, l] = rgbToHsl(...hexToRgb(hex));
  const nh = (h + 32) % 360;
  const ns = Math.min(100, s + 4);
  const nl = Math.min(72, l + 8);
  return rgbToHex(...hslToRgb(nh, ns, nl));
}

function readInitialAccent() {
  if (typeof document !== "undefined") {
    const a = document.documentElement.getAttribute("data-accent");
    if (a) return a;
  }
  return "ocean";
}
function readInitialCustom() {
  try {
    return localStorage.getItem(COLOR_KEY) || "#a855f7";
  } catch (e) {
    return "#a855f7";
  }
}

// Write the chosen palette onto <html> and persist it. For presets the inline
// custom hues are cleared so the CSS palette blocks take over.
function applyAccent(id, customColor) {
  const root = document.documentElement;
  root.setAttribute("data-accent", id);
  try {
    localStorage.setItem(ACCENT_KEY, id);
  } catch (e) {
    /* storage unavailable — still applies for this session */
  }
  if (id === "custom") {
    const c2 = deriveSecondary(customColor);
    root.style.setProperty("--accent-raw", customColor);
    root.style.setProperty("--accent-2-raw", c2);
    try {
      localStorage.setItem(COLOR_KEY, customColor);
      localStorage.setItem(COLOR2_KEY, c2);
    } catch (e) {
      /* ignore */
    }
  } else {
    root.style.removeProperty("--accent-raw");
    root.style.removeProperty("--accent-2-raw");
  }
}

function Dot({ colors }) {
  return (
    <span
      className="accent-dot"
      aria-hidden="true"
      style={{
        background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`,
      }}
    />
  );
}

export default function AccentSwitcher() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [accent, setAccent] = useState(readInitialAccent);
  const [customColor, setCustomColor] = useState(readInitialCustom);
  const ref = useRef(null);

  // close on outside click
  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [open]);

  const choosePreset = (id) => {
    applyAccent(id);
    setAccent(id);
    setOpen(false);
  };

  const chooseCustom = (color) => {
    setCustomColor(color);
    applyAccent("custom", color);
    setAccent("custom");
  };

  const currentColors =
    accent === "custom"
      ? [customColor, deriveSecondary(customColor)]
      : (PALETTES.find((p) => p.id === accent) || PALETTES[0]).colors;

  const label = (id) => t(`nav.accents.${id}`);

  return (
    <div className={`accent-switch ${open ? "is-open" : ""}`} ref={ref}>
      <button
        type="button"
        className="accent-pill"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("nav.changeAccent")}
        onClick={() => setOpen((v) => !v)}
      >
        <Dot colors={currentColors} />
        <span className="accent-name">{label(accent)}</span>
        <FiChevronDown className="accent-caret" aria-hidden="true" />
      </button>
      {open && (
        <ul className="accent-menu" role="listbox">
          <li>
            <label className="accent-custom">
              <span
                className="accent-dot accent-dot--custom"
                aria-hidden="true"
                style={{
                  background: `linear-gradient(135deg, ${customColor} 0%, ${deriveSecondary(
                    customColor
                  )} 100%)`,
                }}
              />
              <span>{label("custom")}</span>
              <input
                type="color"
                className="accent-color-input"
                value={customColor}
                aria-label={t("nav.customColor")}
                onChange={(e) => chooseCustom(e.target.value)}
              />
            </label>
          </li>
          {PALETTES.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                role="option"
                aria-selected={p.id === accent}
                className={p.id === accent ? "is-active" : ""}
                onClick={() => choosePreset(p.id)}
              >
                <Dot colors={p.colors} />
                <span>{label(p.id)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
