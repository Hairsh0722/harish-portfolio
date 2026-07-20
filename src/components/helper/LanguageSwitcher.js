import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiGlobe, FiChevronDown } from "react-icons/fi";

/**
 * Language switch (English / Tamil / Hindi). Drives react-i18next: picking a
 * language calls i18n.changeLanguage(), which re-renders the app instantly from
 * the local translation dictionaries (src/locales/*.json) and caches the choice
 * to localStorage. No page reload, no external widget — works on localhost too.
 */
const LANGS = [
  { code: "en", label: "English", short: "EN" },
  { code: "ta", label: "தமிழ்", short: "TA" },
  { code: "hi", label: "हिन्दी", short: "HI" },
];

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const active = (i18n.language || "en").split("-")[0];

  // keep the document language in sync for accessibility / screen readers
  useEffect(() => {
    document.documentElement.lang = active;
  }, [active]);

  // close the menu on outside click
  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [open]);

  const choose = (code) => {
    setOpen(false);
    i18n.changeLanguage(code);
  };

  const current = LANGS.find((l) => l.code === active) || LANGS[0];

  return (
    <div className={`lang-switch ${open ? "is-open" : ""}`} ref={ref}>
      <button
        type="button"
        className="lang-pill"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("nav.changeLanguage")}
        onClick={() => setOpen((v) => !v)}
      >
        <FiGlobe aria-hidden="true" />
        <span>{current.short}</span>
        <FiChevronDown className="lang-caret" aria-hidden="true" />
      </button>
      {open && (
        <ul className="lang-menu" role="listbox">
          {LANGS.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={l.code === active}
                className={l.code === active ? "is-active" : ""}
                onClick={() => choose(l.code)}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
