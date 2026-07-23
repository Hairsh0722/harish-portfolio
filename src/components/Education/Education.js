import React from "react";
import { Trans, useTranslation } from "react-i18next";
import educationData from "./educationData";

function Education() {
  const { t } = useTranslation();

  // Optional fields resolve to "" (via defaultValue) so a card only renders
  // the pieces the locale files actually provide.
  const opt = (id, field) =>
    t(`education.items.${id}.${field}`, { defaultValue: "" });

  return (
    <section className="section section--page" id="education">
      <div className="container-x" style={{ textAlign: "center" }}>
        <span className="eyebrow eyebrow--center" data-reveal>
          {t("education.eyebrow")}
        </span>
        <h1 className="section-heading" data-reveal>
          <Trans i18nKey="education.heading">
            Where I <span className="accent">studied</span>
          </Trans>
        </h1>

        <div className="edu-grid" data-reveal-children>
          {educationData.map(({ id, icon: Icon }) => {
            const field = opt(id, "field");
            const period = opt(id, "period");
            const location = opt(id, "location");
            const grade = opt(id, "grade");
            const description = opt(id, "description");
            return (
              <article
                key={id}
                className="glass glass--hover edu-card"
                data-spotlight
              >
                <div className="edu-card__head">
                  <span className="edu-card__icon" aria-hidden="true">
                    <Icon />
                  </span>
                  {period && <span className="edu-card__period">{period}</span>}
                </div>
                <div className="edu-card__body">
                  <h3 className="edu-card__degree">
                    {t(`education.items.${id}.degree`)}
                  </h3>
                  {field && <p className="edu-card__field">{field}</p>}
                  <p className="edu-card__institution">
                    {t(`education.items.${id}.institution`)}
                    {location && (
                      <span className="edu-card__location"> · {location}</span>
                    )}
                  </p>
                  {description && (
                    <p className="edu-card__desc">{description}</p>
                  )}
                  {grade && <span className="edu-card__grade">{grade}</span>}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Education;
