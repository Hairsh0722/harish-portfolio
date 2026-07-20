import React, { useState, useEffect, useRef } from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import {
  AiOutlineHome,
  AiOutlineUser,
  AiOutlineLaptop,
  AiOutlineMessage,
  AiOutlineFundProjectionScreen,
} from "react-icons/ai";
import { CgFileDocument } from "react-icons/cg";
import { FiSun, FiMoon, FiPhoneCall, FiMaximize, FiMinimize } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { useTranslation } from "react-i18next";
import scrollToSection from "./helper/scrollToSection";
import { requestResume, onResumeRequest } from "./helper/resumeReveal";
import LanguageSwitcher from "./helper/LanguageSwitcher";
import useFullscreen from "./helper/useFullscreen";

// Labels are resolved from i18n at render time via t(`nav.${id}`).
const NAV_ITEMS = [
  { id: "home", icon: <AiOutlineHome /> },
  { id: "about", icon: <AiOutlineUser /> },
  { id: "skills", icon: <AiOutlineLaptop /> },
  { id: "projects", icon: <AiOutlineFundProjectionScreen /> },
  { id: "resume", icon: <CgFileDocument /> },
  { id: "contact", icon: <AiOutlineMessage /> },
];

// "Sign in" is styled to match the design but there's no auth backend, so it
// opens Gmail (Google shows its sign-in page when the visitor is logged out).
const SIGN_IN_URL = "https://mail.google.com/";

// The phone CTA opens WhatsApp directly. Mirrors Contact.js.
const WHATSAPP_NUMBER = "919551363232"; // +91 95513 63232

function NavBar({ theme, onToggleTheme }) {
  const { t } = useTranslation();
  const [expand, updateExpanded] = useState(false);
  const [navColour, updateNavbar] = useState(false);
  const [activeId, setActiveId] = useState("home");
  const progressRef = useRef(null);
  // Whole-page fullscreen (documentElement). Hidden where unsupported (iOS).
  const { isFullscreen, toggle: toggleFullscreen, supported: fsSupported } =
    useFullscreen();

  // Buttery scroll-progress bar: a rAF loop eases the bar toward the current
  // scroll target (lerp) and writes transform straight to the DOM — no React
  // re-renders per frame. The loop parks itself once it reaches the target, so
  // it burns zero cycles while idle.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const SMOOTHING = 0.14; // lower = more languid trail, higher = snappier

    let raf = 0;
    let running = false;
    let current = 0;
    let target = 0;

    const paint = () => {
      const el = progressRef.current;
      if (!el) return;
      el.style.transform = `scaleX(${current})`;
      el.setAttribute("aria-valuenow", String(Math.round(current * 100)));
    };

    const measure = () => {
      const scrolled = window.scrollY;
      const track = document.documentElement.scrollHeight - window.innerHeight;
      updateNavbar(scrolled >= 20);
      target = track > 0 ? Math.min(scrolled / track, 1) : 0;
    };

    const tick = () => {
      current += (target - current) * SMOOTHING;
      const settled = Math.abs(target - current) < 0.0005;
      if (settled) current = target;
      paint();
      if (settled) {
        running = false;
        raf = 0;
      } else {
        raf = requestAnimationFrame(tick);
      }
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      measure();
      if (reduce) {
        current = target; // snap instantly for reduced-motion users
        paint();
      } else {
        start();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    measure();
    if (reduce) {
      current = target;
      paint();
    } else {
      start();
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Scrollspy: highlight the nav item for whichever section is in view.
  useEffect(() => {
    let observer;

    const attach = () => {
      if (observer) observer.disconnect();
      const sections = NAV_ITEMS.map((i) =>
        document.getElementById(i.id)
      ).filter(Boolean);
      if (!sections.length) return;

      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          if (visible[0]) setActiveId(visible[0].target.id);
        },
        { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
      );

      sections.forEach((s) => observer.observe(s));
    };

    attach();

    // The Resume section is hidden at mount and reveals on request, so it isn't
    // in the DOM when the observer above is first built. Light its nav dot right
    // away, then re-attach once it has mounted so scrollspy keeps tracking it.
    const unsub = onResumeRequest(() => {
      setActiveId("resume");
      setTimeout(attach, 80);
    });

    return () => {
      if (observer) observer.disconnect();
      unsub();
    };
  }, []);

  useEffect(() => {
    if (!expand) return;
    const clickHandler = (e) => {
      if (!e.target.closest(".nav-aurora")) updateExpanded(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, [expand]);

  const close = () => updateExpanded(false);

  const go = (id) => {
    // Resume is hidden by default — clicking its nav item reveals it.
    if (id === "resume") requestResume();
    else scrollToSection(id);
    close();
  };

  return (
    <Navbar
      expanded={expand}
      fixed="top"
      expand="lg"
      className={`nav-aurora ${navColour ? "is-scrolled" : ""} ${
        expand ? "is-expanded" : ""
      }`}
    >
      <span
        ref={progressRef}
        className="nav-progress"
        role="progressbar"
        aria-label={t("nav.scrollProgress")}
        aria-valuenow={0}
        aria-valuemin={0}
        aria-valuemax={100}
      />
      <Container className="nav-shell">
        <Navbar.Collapse id="responsive-navbar-nav" className="nav-menu">
          <Nav className="nav-links">
            {NAV_ITEMS.map((item) => (
              <Nav.Item key={item.id}>
                <Nav.Link
                  as="button"
                  type="button"
                  active={activeId === item.id}
                  aria-current={activeId === item.id ? "true" : undefined}
                  onClick={() => go(item.id)}
                >
                  <span className="nav-link__icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  {t(`nav.${item.id}`)}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </Navbar.Collapse>

        <div className="nav-actions">
          <span className="nav-divider" aria-hidden="true" />
          <button
            type="button"
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label={
              theme === "dark" ? t("nav.themeToLight") : t("nav.themeToDark")
            }
            aria-pressed={theme === "light"}
            title={theme === "dark" ? t("nav.lightMode") : t("nav.darkMode")}
          >
            {theme === "dark" ? <FiSun /> : <FiMoon />}
          </button>
          {fsSupported && (
            <button
              type="button"
              className="theme-toggle fullscreen-toggle"
              onClick={toggleFullscreen}
              aria-label={
                isFullscreen ? t("nav.exitFullscreen") : t("nav.viewFullscreen")
              }
              aria-pressed={isFullscreen}
              title={isFullscreen ? t("nav.exitFullscreen") : t("nav.fullscreen")}
            >
              {isFullscreen ? <FiMinimize /> : <FiMaximize />}
            </button>
          )}
          <LanguageSwitcher />
          <a
            className="signin-btn"
            href={SIGN_IN_URL}
            target="_blank"
            rel="noreferrer"
          >
            <FcGoogle aria-hidden="true" />
            <span>{t("nav.signIn")}</span>
          </a>
          <a
            className="nav-cta"
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noreferrer"
            aria-label={t("contact.chatWhatsApp")}
            title={t("contact.chatWhatsApp")}
          >
            <FiPhoneCall aria-hidden="true" />
          </a>
        </div>

        <Navbar.Toggle
          aria-controls="responsive-navbar-nav"
          onClick={() => updateExpanded(expand ? false : "expanded")}
        >
          <span></span>
          <span></span>
          <span></span>
        </Navbar.Toggle>
      </Container>
    </Navbar>
  );
}

export default NavBar;
