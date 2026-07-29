import React, { useEffect, useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { logVisit, setVisitName } from "./visitorStore";
import { deviceInfo } from "./deviceInfo";
import { lookupGeo } from "./geo";
import { prefersReducedMotion } from "../helper/scrollToSection";

/**
 * Visitor greeter + tracker.
 *
 * On first load of a browser session it logs one visit (device, approx.
 * location, referrer, time) to the store, then — for first-time visitors who
 * haven't introduced themselves — shows a small, dismissible card inviting a
 * name. The name is optional; whatever is entered patches the same visit doc
 * and is remembered locally so returning visits arrive already named.
 */
const SESSION_KEY = "pv.session.v1"; // one log per tab session
const SEEN_KEY = "pv.seen.v1"; // returning-visitor flag (persists)
const NAME_KEY = "pv.name.v1"; // remembered self-provided name
const ASKED_KEY = "pv.asked.v1"; // visitor dismissed/answered the prompt

const readLS = (key) => {
  try {
    return window.localStorage.getItem(key) || "";
  } catch (_) {
    return "";
  }
};
const writeLS = (key, val) => {
  try {
    window.localStorage.setItem(key, val);
  } catch (_) {
    /* ignore */
  }
};

function VisitorPrompt() {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);
  const visitIdRef = useRef(null);
  const inputRef = useRef(null);

  // Log the visit once per session, then decide whether to greet.
  useEffect(() => {
    let cancelled = false;

    let loggedThisSession = false;
    try {
      loggedThisSession = window.sessionStorage.getItem(SESSION_KEY) === "1";
    } catch (_) {
      /* ignore */
    }

    const knownName = readLS(NAME_KEY);
    const asked = readLS(ASKED_KEY) === "1";
    const returning = readLS(SEEN_KEY) === "1";

    async function run() {
      if (!loggedThisSession) {
        try {
          window.sessionStorage.setItem(SESSION_KEY, "1");
        } catch (_) {
          /* ignore */
        }
        const geo = await lookupGeo();
        if (cancelled) return;
        const meta = {
          ...deviceInfo(),
          name: knownName,
          referrer: document.referrer || "direct",
          path: window.location.pathname + window.location.hash,
          returning,
          ...(geo || {}),
        };
        try {
          visitIdRef.current = await logVisit(meta);
        } catch (err) {
          if (process.env.NODE_ENV === "development") {
            // eslint-disable-next-line no-console
            console.warn("Visit log failed:", err);
          }
        }
        writeLS(SEEN_KEY, "1");
      }

      // Greet only newcomers who haven't named themselves or dismissed before.
      if (!cancelled && !knownName && !asked) setShow(true);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  // Focus the name field once the card is in (skipped for reduced motion).
  useEffect(() => {
    if (!show) return undefined;
    const delay = prefersReducedMotion() ? 0 : 420;
    const timer = setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, delay);
    return () => clearTimeout(timer);
  }, [show]);

  const dismiss = () => {
    writeLS(ASKED_KEY, "1");
    setShow(false);
  };

  const save = async (e) => {
    e.preventDefault();
    const clean = name.trim().slice(0, 60);
    if (!clean) {
      dismiss();
      return;
    }
    writeLS(NAME_KEY, clean);
    writeLS(ASKED_KEY, "1");
    try {
      await setVisitName(visitIdRef.current, clean);
    } catch (_) {
      /* ignore — the visit is already logged, the name is a bonus */
    }
    setSaved(true);
    setTimeout(() => setShow(false), 1500);
  };

  if (!show) return null;

  return (
    <div
      className={`pv-prompt${saved ? " is-saved" : ""}`}
      role="dialog"
      aria-live="polite"
      aria-label={t("visitors.prompt.aria")}
    >
      <button
        type="button"
        className="pv-prompt__close"
        onClick={dismiss}
        aria-label={t("visitors.prompt.dismiss")}
      >
        <FiX aria-hidden="true" />
      </button>

      {saved ? (
        <p className="pv-prompt__thanks">
          {t("visitors.prompt.thanks", { name: name.trim() })}
        </p>
      ) : (
        <>
          <span className="pv-prompt__wave" aria-hidden="true">
            👋
          </span>
          <p className="pv-prompt__title">{t("visitors.prompt.title")}</p>
          <p className="pv-prompt__hint">{t("visitors.prompt.hint")}</p>
          <form className="pv-prompt__form" onSubmit={save}>
            <input
              ref={inputRef}
              type="text"
              className="pv-prompt__input"
              placeholder={t("visitors.prompt.placeholder")}
              value={name}
              maxLength={60}
              onChange={(e) => setName(e.target.value)}
              aria-label={t("visitors.prompt.placeholder")}
            />
            <button type="submit" className="pv-prompt__save">
              {t("visitors.prompt.save")}
            </button>
          </form>
          <button type="button" className="pv-prompt__skip" onClick={dismiss}>
            {t("visitors.prompt.skip")}
          </button>
        </>
      )}
    </div>
  );
}

export default VisitorPrompt;
