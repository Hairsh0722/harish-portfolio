import React, { useState, useEffect } from "react";
import pdf from "../../Assets/harish_resume_new.pdf";
import { AiOutlineDownload, AiOutlineFullscreen, AiOutlineClose } from "react-icons/ai";
import { Document, Page, pdfjs } from "react-pdf";
import { Trans, useTranslation } from "react-i18next";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import scrollToSection from "../helper/scrollToSection";
import { onResumeRequest } from "../helper/resumeReveal";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function ResumeNew() {
  const { t } = useTranslation();
  const [pageWidth, setPageWidth] = useState(720);
  // Larger page size used inside the fullscreen overlay.
  const [fsPageWidth, setFsPageWidth] = useState(720);
  const [inView, setInView] = useState(false);
  // Hidden by default: the resume only shows once the user asks for it.
  const [visible, setVisible] = useState(false);
  // Fullscreen overlay for a large, readable view of the PDF.
  const [fullscreen, setFullscreen] = useState(false);

  // Reveal on request, and (re)scroll to the section each time it's asked for
  // — even if it's already showing, so a repeat click still jumps to it.
  useEffect(
    () =>
      onResumeRequest(() => {
        setVisible(true);
        // Explicit request → mount the PDF right away (no lazy-scroll wait).
        setInView(true);
        setTimeout(() => scrollToSection("resume"), 60);
      }),
    []
  );

  useEffect(() => {
    const update = () => {
      setPageWidth(Math.min(760, window.innerWidth - 64));
      setFsPageWidth(Math.min(1000, window.innerWidth - 48));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // While the overlay is open: lock body scroll and let Escape close it.
  useEffect(() => {
    if (!fullscreen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [fullscreen]);

  // Not requested yet → render nothing, so it's absent from the scroll page.
  if (!visible) return null;

  return (
    <section className="resume-section" id="resume">
      <div className="container-x" style={{ textAlign: "center" }}>
        <span className="eyebrow eyebrow--center">{t("resume.eyebrow")}</span>
        <h1 className="section-heading">
          <Trans i18nKey="resume.heading">
            The <span className="accent">full story</span>
          </Trans>
        </h1>

        <div className="resume-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setFullscreen(true)}
          >
            <AiOutlineFullscreen /> {t("resume.viewFullscreen")}
          </button>
          <a href={pdf} download className="btn btn-primary">
            <AiOutlineDownload /> {t("resume.downloadCv")}
          </a>
        </div>

        <div className="glass resume-wrap">
          {inView ? (
            <Document
              file={pdf}
              loading={<p className="lead">{t("resume.loading")}</p>}
            >
              <Page
                pageNumber={1}
                width={pageWidth}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
          ) : (
            <p className="lead">{t("resume.loading")}</p>
          )}
        </div>

        <div className="resume-actions" style={{ marginTop: "var(--space-6)" }}>
          <a href={pdf} download className="btn btn-primary">
            <AiOutlineDownload /> {t("resume.downloadCv")}
          </a>
        </div>
      </div>

      {fullscreen && (
        <div
          className="resume-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={t("resume.dialogLabel")}
          onClick={(e) => {
            // Click on the dim backdrop (not the document) closes the overlay.
            if (e.target === e.currentTarget) setFullscreen(false);
          }}
        >
          <div className="resume-overlay__bar">
            <a href={pdf} download className="btn btn-primary btn-sm">
              <AiOutlineDownload /> {t("resume.downloadCv")}
            </a>
            <button
              type="button"
              className="resume-overlay__close"
              onClick={() => setFullscreen(false)}
              aria-label={t("resume.closeFullscreen")}
              title={t("resume.closeEsc")}
            >
              <AiOutlineClose />
            </button>
          </div>
          <div className="resume-overlay__doc">
            <Document
              file={pdf}
              loading={<p className="lead">{t("resume.loading")}</p>}
            >
              <Page
                pageNumber={1}
                width={fsPageWidth}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
          </div>
        </div>
      )}
    </section>
  );
}

export default ResumeNew;
