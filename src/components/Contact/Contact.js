import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import { Trans, useTranslation } from "react-i18next";

/* -------------------------------------------------------------------
   ⚠️  SET YOUR WHATSAPP NUMBER HERE
   International format, digits only — no "+", spaces or dashes.
   Example: India +91 95513 63232  →  "919551363232"
------------------------------------------------------------------- */
const WHATSAPP_NUMBER = "919551363232"; // +91 95513 63232

function Contact() {
  const { t } = useTranslation();
  const number = WHATSAPP_NUMBER.replace(/\D/g, "");

  return (
    <section className="section section--page" id="contact">
      <div className="container-x">
        <div style={{ textAlign: "center" }}>
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
          {/* ---------------- ASIDE ---------------- */}
          <aside className="contact-aside glass">
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
