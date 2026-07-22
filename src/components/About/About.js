import React from "react";
import { Trans, useTranslation } from "react-i18next";
import Aboutcard from "./AboutCard";
import Github from "./Github";
import avatar from "../../Assets/avatar.webp";

function About() {
  const { t } = useTranslation();
  return (
    <section className="section section--page" id="about">
      <div className="container-x">
        <span className="eyebrow" data-reveal>{t("about.eyebrow")}</span>
        <h1 className="section-heading" data-reveal>
          <Trans i18nKey="about.heading">
            Know who <span className="accent">I am</span>
          </Trans>
        </h1>
        <div
          className="glass"
          style={{ marginTop: "var(--space-5)" }}
          data-reveal="scale"
          data-spotlight
        >
          <div className="about-grid">
            <div className="about-visual">
              <div className="about-photo-frame">
                <img
                  src={avatar}
                  alt="Harish Siva"
                  className="about-photo"
                  width="700"
                  height="700"
                  loading="lazy"
                  decoding="async"
                />
                <span className="photo-orbits" aria-hidden="true">
                  <span className="orbit-ring orbit-ring--1" />
                  <span className="orbit-ring orbit-ring--2" />
                  <span className="orbit-ring orbit-ring--3" />
                </span>
              </div>
            </div>
            <div className="about-card">
              <Aboutcard />
            </div>
          </div>
        </div>
        <div data-reveal="fade">
          <Github />
        </div>
      </div>
    </section>
  );
}

export default About;
