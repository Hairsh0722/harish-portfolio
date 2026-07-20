import React from "react";
import { Trans, useTranslation } from "react-i18next";
import ProjectCards from "./ProjectCards";
import projects from "./projectsData";

function ProjectShowcase() {
  const { t } = useTranslation();
  return (
    <section className="section section--page" id="projects">
      <div className="container-x">
        <div style={{ textAlign: "center" }}>
          <span className="eyebrow eyebrow--center">
            {t("skills.showcase.eyebrow")}
          </span>
          <h1 className="section-heading">
            <Trans i18nKey="skills.showcase.heading">
              Things I've <span className="accent">built</span>
            </Trans>
          </h1>
          <p
            className="lead"
            style={{ maxWidth: "54ch", margin: "0 auto var(--space-7)" }}
          >
            {t("skills.showcase.lead")}
          </p>
        </div>

        <div className="projects-grid">
          {projects.map((p) => {
            // Project copy is translated by the project's abbr key when a
            // translation exists; otherwise the English source data is used.
            const base = `skills.projects.${p.abbr}`;
            return (
              <ProjectCards
                key={p.title}
                {...p}
                description={t(`${base}.description`, p.description)}
                modules={t(`${base}.modules`, {
                  returnObjects: true,
                  defaultValue: p.modules,
                })}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ProjectShowcase;
