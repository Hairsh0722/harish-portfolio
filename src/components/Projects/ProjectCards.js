import React from "react";
import Tilt from "react-parallax-tilt";
import { BsGithub } from "react-icons/bs";
import { CgWebsite } from "react-icons/cg";
import { FiCheck } from "react-icons/fi";
import { useTranslation } from "react-i18next";

function ProjectCards({
  title,
  abbr,
  description,
  modules = [],
  tags = [],
  ghLink,
  demoLink,
  imgPath,
}) {
  const { t } = useTranslation();
  const hasLinks = Boolean(ghLink || demoLink);

  return (
    <div className="project-cell">
      <Tilt
        tiltMaxAngleX={7}
        tiltMaxAngleY={7}
        glareEnable={false}
        scale={1.02}
        transitionSpeed={800}
        className="project-tilt"
      >
        <article className="project-card glass glass--hover" data-spotlight>
      <div className="project-cover">
        {imgPath ? (
          <img src={imgPath} alt={t("skills.card.screenshotAlt", { title })} />
        ) : (
          <span className="project-cover-abbr" aria-hidden="true">
            {abbr || title.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>

      <div className="project-body">
        <h3 className="project-title">{title}</h3>
        <p className="project-desc">{description}</p>

        {modules.length > 0 && (
          <div className="project-modules">
            <span className="project-modules-label">
              {t("skills.card.keyModules")}
            </span>
            <ul>
              {modules.map((m) => (
                <li key={m}>
                  <FiCheck /> {m}
                </li>
              ))}
            </ul>
          </div>
        )}

        {tags.length > 0 && (
          <div className="chip-row project-tags">
            {tags.map((t) => (
              <span className="chip" key={t}>
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="project-actions">
          {ghLink && (
            <a
              href={ghLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              <BsGithub /> {t("skills.card.code")}
            </a>
          )}
          {demoLink && (
            <a
              href={demoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <CgWebsite /> {t("skills.card.liveDemo")}
            </a>
          )}
          {!hasLinks && (
            <span className="project-note">{t("skills.card.internal")}</span>
          )}
        </div>
      </div>
        </article>
      </Tilt>
    </div>
  );
}

export default ProjectCards;
