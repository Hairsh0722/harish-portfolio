import React from "react";
import Tilt from "react-parallax-tilt";
import { Trans, useTranslation } from "react-i18next";
import Aboutcard from "./AboutCard";
import Github from "./Github";
import CodeTerminal from "../Home/CodeTerminal";

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
              <Tilt tiltMaxAngleX={6} tiltMaxAngleY={6} glareEnable={false}>
                <CodeTerminal />
              </Tilt>
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
