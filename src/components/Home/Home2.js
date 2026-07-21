import React from "react";
import Tilt from "react-parallax-tilt";
import { Trans, useTranslation } from "react-i18next";
import CodeTerminal from "./CodeTerminal";

function Home2() {
  const { t } = useTranslation();
  return (
    <div className="section" id="about-intro">
      <div className="container-x">
        <div className="glass glass--hover" data-reveal="scale" data-spotlight>
          <div className="intro-grid">
            <div>
              <span className="eyebrow">{t("home.intro.eyebrow")}</span>
              <h2 className="section-heading">
                <Trans i18nKey="home.intro.heading">
                  Let me <span className="accent">introduce</span> myself
                </Trans>
              </h2>
              <p className="intro-body">
                {t("home.intro.p1")}
                <br />
                <br />
                {t("home.intro.p2")}
                <br />
                <br />
                {t("home.intro.p3")}
              </p>
            </div>
            <div className="intro-visual">
              <Tilt tiltMaxAngleX={6} tiltMaxAngleY={6} glareEnable={false}>
                <CodeTerminal />
              </Tilt>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home2;
