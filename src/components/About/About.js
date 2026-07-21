import React from "react";
import { Trans, useTranslation } from "react-i18next";
import Aboutcard from "./AboutCard";
import Github from "./Github";
import avatar from "../../Assets/avatar.png";

function About() {
  const { t } = useTranslation();
  return (
    <section className="section section--page" id="about">
      <div className="container-x">
        <span className="eyebrow">{t("about.eyebrow")}</span>
        <h1 className="section-heading">
          <Trans i18nKey="about.heading">
            Know who <span className="accent">I am</span>
          </Trans>
        </h1>
        <div className="glass" style={{ marginTop: "var(--space-5)" }}>
          <div className="about-grid">
            <div className="about-visual">
              <div className="about-photo-frame">
                <img
                  src={avatar}
                  alt="Harish Siva"
                  className="about-photo"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="about-card">
              <Aboutcard />
            </div>
          </div>
        </div>
        <Github />
      </div>
    </section>
  );
}

export default About;
