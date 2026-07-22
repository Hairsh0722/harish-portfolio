import React from "react";
import { AiFillFacebook } from "react-icons/ai";
import { FaLinkedinIn, FaGithub, FaInstagram } from "react-icons/fa";
import { Trans, useTranslation } from "react-i18next";
import avatar from "../../Assets/connect-photo.jpg";

// Icons orbit the avatar on a dashed ring. `angle` is measured clockwise from
// the top (0deg = 12 o'clock); the four links sit symmetrically on the left
// (professional) and right (social) so the top and bottom of the ring stay
// clear. Links come from the portfolio owner's own profiles.
const socials = [
  {
    icon: <FaLinkedinIn />,
    href: "https://www.linkedin.com/in/harish-s-119b5a18a/",
    label: "LinkedIn",
    brand: "linkedin",
    angle: "-50deg",
  },
  {
    icon: <FaGithub />,
    href: "https://github.com/Hairsh0722",
    label: "GitHub",
    brand: "github",
    angle: "-130deg",
  },
  {
    icon: <FaInstagram />,
    href: "https://www.instagram.com/harish_.siva",
    label: "Instagram",
    brand: "instagram",
    angle: "50deg",
  },
  {
    icon: <AiFillFacebook />,
    href: "https://www.facebook.com/harish.siva.727191",
    label: "Facebook",
    brand: "facebook",
    angle: "130deg",
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

        <div className="orbit" data-reveal>
          <span className="orbit-ring" aria-hidden="true" />
          <span className="orbit-avatar">
            <img src={avatar} alt="Harish Siva" width="480" height="480" loading="lazy" decoding="async" />
          </span>
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              aria-label={s.label}
              className={`orbit-node orbit-node--${s.brand}`}
              style={{ "--a": s.angle }}
            >
              <span className="orbit-node__chip">{s.icon}</span>
              <span className="orbit-node__tip">{s.label}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Connect;
