import React from "react";
import { Trans, useTranslation } from "react-i18next";
import Techstack from "../About/Techstack";
import Toolstack from "../About/Toolstack";

const stats = [
  { key: "experience", value: "5", suffix: "+" },
  { key: "technologies", value: "13", suffix: "+" },
  { key: "focus", value: "Full-stack" },
];

function Projects() {
  const { t } = useTranslation();
  return (
    <section className="section section--page" id="skills">
      <div className="container-x" style={{ textAlign: "center" }}>
        <span className="eyebrow eyebrow--center">{t("skills.eyebrow")}</span>
        <h1 className="section-heading">
          <Trans i18nKey="skills.heading">
            Professional <span className="accent">skillset</span>
          </Trans>
        </h1>

        <div className="skill-stats">
          {stats.map((stat) => (
            <div key={stat.key} className="glass glass--hover skill-stat">
              <div className="skill-stat__value">
                {stat.value}
                {stat.suffix && <span className="accent">{stat.suffix}</span>}
              </div>
              <div className="skill-stat__label">
                {t(`skills.stats.${stat.key}`)}
              </div>
            </div>
          ))}
        </div>

        <Techstack />

        <h2 className="section-heading" style={{ marginTop: "var(--space-6)" }}>
          <Trans i18nKey="skills.toolsHeading">
            <span className="accent">Tools</span> I use
          </Trans>
        </h2>
        <Toolstack />
      </div>
    </section>
  );
}

export default Projects;
