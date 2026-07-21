import React from "react";
import { AiFillFacebook } from "react-icons/ai";
import { FaLinkedinIn, FaGithub, FaInstagram } from "react-icons/fa";
import { Trans, useTranslation } from "react-i18next";

const socials = [
  {
    icon: <FaLinkedinIn />,
    href: "https://www.linkedin.com/in/harish-s-119b5a18a/",
    label: "LinkedIn",
    brand: "linkedin",
  },
  {
    icon: <FaGithub />,
    href: "https://github.com/Hairsh0722",
    label: "GitHub",
    brand: "github",
  },
  {
    icon: <FaInstagram />,
    href: "https://www.instagram.com/harish_.siva",
    label: "Instagram",
    brand: "instagram",
  },
  {
    icon: <AiFillFacebook />,
    href: "https://www.facebook.com/harish.siva.727191",
    label: "Facebook",
    brand: "facebook",
  },
];

function Connect() {
  const { t } = useTranslation();
  return (
    <section className="section section--page" id="connect">
      <div className="container-x" style={{ textAlign: "center" }}>
        <span className="eyebrow eyebrow--center" data-reveal>
          {t("connect.eyebrow")}
        </span>
        <h2 className="section-heading" data-reveal>
          <Trans i18nKey="connect.heading">
            Find me <span className="accent">online</span>
          </Trans>
        </h2>
        <p
          className="lead"
          style={{ maxWidth: "48ch", margin: "0 auto var(--space-6)" }}
          data-reveal
        >
          {t("connect.lead")}
        </p>
        <div className="social-pills" data-reveal-children>
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className={`social-pill social-pill--${s.brand}`}
            >
              {s.icon}
              <span>{s.label}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Connect;
