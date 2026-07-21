import React, { useRef, useState } from "react";
import { FaWhatsapp, FaEnvelope } from "react-icons/fa";
import emailjs from "@emailjs/browser";
import { Trans, useTranslation } from "react-i18next";

/* -------------------------------------------------------------------
   ⚠️  SET YOUR WHATSAPP NUMBER HERE
   International format, digits only — no "+", spaces or dashes.
   Example: India +91 95513 63232  →  "919551363232"
------------------------------------------------------------------- */
const WHATSAPP_NUMBER = "919551363232"; // +91 95513 63232

/* -------------------------------------------------------------------
   EmailJS credentials — set these in a .env.local file (see .env.example).
   Messages are delivered to the inbox configured in your EmailJS template.
------------------------------------------------------------------- */
const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Contact() {
  const { t } = useTranslation();
  const number = WHATSAPP_NUMBER.replace(/\D/g, "");

  const formRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [errors, setErrors] = useState({});
  const [errorDetail, setErrorDetail] = useState("");

  const configured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

  const validate = (form) => {
    // Read via FormData: an input named "name" collides with the form's own
    // .name property, so form.name would not return the field value.
    const data = new FormData(form);
    const get = (key) => String(data.get(key) || "").trim();

    const next = {};
    if (!get("name")) next.name = t("contact.form.errName");
    const email = get("email");
    if (!email) next.email = t("contact.form.errEmailRequired");
    else if (!EMAIL_RE.test(email)) next.email = t("contact.form.errEmailInvalid");
    if (!get("message")) next.message = t("contact.form.errMessage");
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    if (!configured) {
      setStatus("error");
      return;
    }

    // Populate the template's {{time}} variable.
    const timeField = form.elements.namedItem("time");
    if (timeField) timeField.value = new Date().toLocaleString();

    setStatus("sending");
    try {
      await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form, {
        publicKey: PUBLIC_KEY,
      });
      setStatus("success");
      setErrorDetail("");
      form.reset();
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.error("EmailJS send failed:", err);
      }
      const detail =
        err && (err.text || err.message)
          ? `${err.status ? err.status + ": " : ""}${err.text || err.message}`
          : "";
      setErrorDetail(detail);
      setStatus("error");
    }
  };

  const clearError = (key) =>
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  return (
    <section className="section section--page" id="contact">
      <div className="container-x">
        <div style={{ textAlign: "center" }} data-reveal>
          <span className="eyebrow eyebrow--center">{t("contact.eyebrow")}</span>
          <h1 className="section-heading">
            <Trans i18nKey="contact.heading">
              Let's <span className="accent">talk</span>
            </Trans>
          </h1>
          <p
            className="lead"
            style={{ maxWidth: "52ch", margin: "0 auto var(--space-7)" }}
          >
            {t("contact.lead")}
          </p>
        </div>

        <div className="contact-grid">
          {/* ---------------- FORM ---------------- */}
          <form
            ref={formRef}
            className="contact-form glass"
            onSubmit={handleSubmit}
            noValidate
            data-reveal="scale"
            data-spotlight
          >
            <div className="form-field">
              <label className="form-label" htmlFor="cf-name">
                {t("contact.form.name")} <span className="req">*</span>
              </label>
              <input
                id="cf-name"
                name="name"
                type="text"
                className="form-input"
                placeholder={t("contact.form.namePlaceholder")}
                autoComplete="name"
                aria-invalid={errors.name ? "true" : "false"}
                onChange={() => clearError("name")}
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="cf-email">
                {t("contact.form.email")} <span className="req">*</span>
              </label>
              <input
                id="cf-email"
                name="email"
                type="email"
                className="form-input"
                placeholder={t("contact.form.emailPlaceholder")}
                autoComplete="email"
                aria-invalid={errors.email ? "true" : "false"}
                onChange={() => clearError("email")}
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="cf-message">
                {t("contact.form.message")} <span className="req">*</span>
              </label>
              <textarea
                id="cf-message"
                name="message"
                className="form-input form-textarea"
                placeholder={t("contact.form.messagePlaceholder")}
                aria-invalid={errors.message ? "true" : "false"}
                onChange={() => clearError("message")}
              />
              {errors.message && (
                <span className="form-error">{errors.message}</span>
              )}
            </div>

            {/* Hidden field for the template's {{time}} variable */}
            <input type="hidden" name="time" />

            <button
              type="submit"
              className="btn btn-primary form-submit"
              data-magnetic="0.35"
              disabled={status === "sending"}
            >
              <FaEnvelope />{" "}
              {status === "sending"
                ? t("contact.form.sending")
                : t("contact.form.send")}
            </button>

            {status === "success" && (
              <p className="form-status" role="status" style={{ color: "var(--accent)" }}>
                {t("contact.form.success")}
              </p>
            )}
            {status === "error" && (
              <p className="form-status" role="alert" style={{ color: "#fca5a5" }}>
                {configured ? t("contact.form.error") : t("contact.form.notConfigured")}
                {configured && errorDetail && (
                  <>
                    <br />
                    <span style={{ opacity: 0.85 }}>({errorDetail})</span>
                  </>
                )}
              </p>
            )}
          </form>

          {/* ---------------- ASIDE ---------------- */}
          <aside className="contact-aside glass" data-reveal="scale" data-spotlight>
            <span className="status-chip">
              <span className="dot" /> {t("contact.replyTime")}
            </span>

            <h2 className="contact-aside-title">{t("contact.asideTitle")}</h2>
            <p className="contact-aside-copy">{t("contact.asideCopy")}</p>

            <a
              href={`https://wa.me/${number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary contact-wa-btn"
              data-magnetic="0.35"
            >
              <FaWhatsapp /> {t("contact.chatWhatsApp")}
            </a>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default Contact;
