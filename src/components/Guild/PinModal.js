import React, { useEffect, useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import { BsPinAngle } from "react-icons/bs";
import emailjs from "@emailjs/browser";
import { useTranslation } from "react-i18next";

/* -------------------------------------------------------------------
   Reuses the same EmailJS credentials as the Contact form — a pinned
   note is delivered to the owner's inbox for moderation, then added to
   the wall. Set these in .env.local (see .env.example).
------------------------------------------------------------------- */
const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

// When a visitor leaves no email, the template's reply-to still needs a valid
// address, so fall back to the owner's own inbox.
const FALLBACK_EMAIL = "harish.siva@iopex.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_MESSAGE = 220;

function PinModal({ onClose, onPinned }) {
  const { t } = useTranslation();
  const formRef = useRef(null);
  const closeRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [errors, setErrors] = useState({});
  const [count, setCount] = useState(0);

  const configured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

  // Esc closes; focus the close button on open; lock body scroll.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (closeRef.current) closeRef.current.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const validate = (form) => {
    const data = new FormData(form);
    const get = (key) => String(data.get(key) || "").trim();
    const next = {};
    if (!get("name")) next.name = t("guild.form.errName");
    const email = get("email");
    if (email && !EMAIL_RE.test(email)) next.email = t("guild.form.errEmail");
    if (!get("message")) next.message = t("guild.form.errMessage");
    return next;
  };

  const clearError = (key) =>
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const message = String(data.get("message") || "").trim();

    // Write the pin to the shared wall. Awaited so a backend rejection
    // (rules/network) surfaces as an error instead of a false success.
    setStatus("sending");
    try {
      await onPinned({ name, message });
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.error("Guild pin failed:", err);
      }
      setStatus("error");
      return;
    }
    setStatus("success");

    // Best-effort notification: email the owner so they see the pin even on
    // another device. Fire-and-forget — a missing/failed mail config never
    // blocks the pin from showing.
    if (configured) {
      const emailField = form.elements.namedItem("email");
      if (emailField && !emailField.value.trim()) emailField.value = FALLBACK_EMAIL;
      const subjectField = form.elements.namedItem("subject");
      if (subjectField) subjectField.value = "🧷 New Guild Board pin";
      const timeField = form.elements.namedItem("time");
      if (timeField) timeField.value = new Date().toLocaleString();
      emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form, { publicKey: PUBLIC_KEY })
        .catch((err) => {
          if (process.env.NODE_ENV === "development") {
            // eslint-disable-next-line no-console
            console.error("Guild pin notify failed:", err);
          }
        });
    }
  };

  return (
    <div
      className="guild-modal__overlay"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="guild-modal glass"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guild-modal-title"
      >
        <button
          type="button"
          className="guild-modal__close"
          onClick={onClose}
          ref={closeRef}
          aria-label={t("guild.form.close")}
        >
          <FiX />
        </button>

        <h3 className="guild-modal__title" id="guild-modal-title">
          <BsPinAngle aria-hidden="true" /> {t("guild.form.title")}
        </h3>
        <p className="guild-modal__hint">{t("guild.form.hint")}</p>

        {status === "success" ? (
          <div className="guild-modal__done" role="status">
            <span className="guild-modal__done-emoji" aria-hidden="true">
              🎉
            </span>
            <p>{t("guild.form.success")}</p>
            <button type="button" className="btn btn-primary" onClick={onClose}>
              {t("guild.form.done")}
            </button>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <label className="form-label" htmlFor="gf-name">
                {t("guild.form.name")} <span className="req">*</span>
              </label>
              <input
                id="gf-name"
                name="name"
                type="text"
                className="form-input"
                placeholder={t("guild.form.namePlaceholder")}
                autoComplete="name"
                aria-invalid={errors.name ? "true" : "false"}
                onChange={() => clearError("name")}
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="gf-email">
                {t("guild.form.email")}{" "}
                <span className="guild-form__optional">
                  {t("guild.form.optional")}
                </span>
              </label>
              <input
                id="gf-email"
                name="email"
                type="email"
                className="form-input"
                placeholder={t("guild.form.emailPlaceholder")}
                autoComplete="email"
                aria-invalid={errors.email ? "true" : "false"}
                onChange={() => clearError("email")}
              />
              {errors.email && (
                <span className="form-error">{errors.email}</span>
              )}
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="gf-message">
                {t("guild.form.message")} <span className="req">*</span>
              </label>
              <textarea
                id="gf-message"
                name="message"
                className="form-input form-textarea guild-form__note"
                placeholder={t("guild.form.messagePlaceholder")}
                maxLength={MAX_MESSAGE}
                aria-invalid={errors.message ? "true" : "false"}
                onChange={(e) => {
                  setCount(e.target.value.length);
                  clearError("message");
                }}
              />
              <div className="guild-form__meta">
                {errors.message ? (
                  <span className="form-error">{errors.message}</span>
                ) : (
                  <span />
                )}
                <span className="guild-form__count">
                  {count}/{MAX_MESSAGE}
                </span>
              </div>
            </div>

            {/* Hidden fields mirror the Contact EmailJS template variables. */}
            <input type="hidden" name="subject" />
            <input type="hidden" name="time" />

            <button
              type="submit"
              className="btn btn-primary guild-modal__submit"
              disabled={status === "sending"}
            >
              <BsPinAngle />{" "}
              {status === "sending"
                ? t("guild.form.sending")
                : t("guild.form.submit")}
            </button>

            {status === "error" && (
              <p className="form-status" role="alert" style={{ color: "#fca5a5" }}>
                {t("guild.form.error")}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

export default PinModal;
