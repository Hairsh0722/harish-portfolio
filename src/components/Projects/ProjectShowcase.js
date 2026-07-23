import React, { useCallback, useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ProjectCards from "./ProjectCards";
import projects from "./projectsData";

function ProjectShowcase() {
  const { t } = useTranslation();
  const trackRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [active, setActive] = useState(0);

  // Recompute which arrows/dots are usable from the track's scroll position.
  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setHasOverflow(scrollWidth > clientWidth + 4);
    setCanPrev(scrollLeft > 4);
    setCanNext(scrollLeft + clientWidth < scrollWidth - 4);

    const cell = el.querySelector(".project-cell");
    const step = cell ? cell.offsetWidth : clientWidth;
    setActive(step ? Math.round(scrollLeft / step) : 0);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scrollToIndex = (index) => {
    const el = trackRef.current;
    if (!el) return;
    const cell = el.querySelector(".project-cell");
    const gap = parseFloat(getComputedStyle(el).columnGap || "0") || 0;
    const step = cell ? cell.offsetWidth + gap : el.clientWidth;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
    el.scrollTo({ left: step * index, behavior });
  };

  const scrollByCard = (dir) => scrollToIndex(active + dir);

  // Only show carousel controls when there are multiple cards AND they don't
  // all fit at once (so nothing idle appears when every card is visible).
  const isCarousel = projects.length > 1 && hasOverflow;

  return (
    <section className="section section--page" id="projects">
      <div className="container-x">
        <div style={{ textAlign: "center" }} data-reveal>
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

        <div className={`projects-carousel${isCarousel ? " is-carousel" : ""}`}>
          {isCarousel && (
            <button
              type="button"
              className="carousel-btn carousel-btn--prev"
              onClick={() => scrollByCard(-1)}
              disabled={!canPrev}
              aria-label={t("skills.showcase.prev")}
            >
              <FiChevronLeft aria-hidden="true" />
            </button>
          )}

          <div className="projects-track" ref={trackRef} data-reveal-children>
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

          {isCarousel && (
            <button
              type="button"
              className="carousel-btn carousel-btn--next"
              onClick={() => scrollByCard(1)}
              disabled={!canNext}
              aria-label={t("skills.showcase.next")}
            >
              <FiChevronRight aria-hidden="true" />
            </button>
          )}
        </div>

        {isCarousel && (
          <div className="carousel-dots" role="tablist">
            {projects.map((p, i) => (
              <button
                type="button"
                key={p.title}
                className={`carousel-dot${i === active ? " is-active" : ""}`}
                onClick={() => scrollToIndex(i)}
                aria-label={t("skills.showcase.goToProject", { number: i + 1 })}
                aria-selected={i === active}
                role="tab"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ProjectShowcase;
