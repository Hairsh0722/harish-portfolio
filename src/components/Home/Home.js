import React from "react";
import Home2 from "./Home2";
import scrollToSection from "../helper/scrollToSection";
import { requestResume } from "../helper/resumeReveal";
import Type from "./Type";
import heroAnim from "../../Assets/lottie/Developer2.json";
import AnimationLottie from "../helper/animation-lottie";
import { AiOutlineArrowRight, AiFillFacebook } from "react-icons/ai";
import { FaLinkedinIn, FaGithub, FaInstagram } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { useTranslation } from "react-i18next";

const socials = [
  {
    icon: <FaLinkedinIn />,
    href: "https://www.linkedin.com/in/harish-s-119b5a18a/",
    label: "LinkedIn",
    brand: "linkedin",
  },
  {
    icon: <FaGithub />,
    href: "https://github.com/Hairsh0722",
    label: "GitHub",
    brand: "github",
  },
  {
    icon: <FaInstagram />,
    href: "https://www.instagram.com/harish_.siva",
    label: "Instagram",
    brand: "instagram",
  },
  {
    icon: <AiFillFacebook />,
    href: "https://www.facebook.com/harish.siva.727191",
    label: "Facebook",
    brand: "facebook",
  },
];

function Home() {
  const { t } = useTranslation();
  return (
    <section id="home">
      {/* ---------------- HERO ---------------- */}
      <div className="hero">
        <div className="container-x hero-grid">
          <div className="hero-copy" data-reveal-children>
            <span className="eyebrow">{t("home.hero.eyebrow")}</span>
            <h1 className="hero-name">
              <span className="hero-greeting">{t("home.hero.greeting")}</span>
              <span className="accent">Harish Siva</span>
            </h1>
            <div className="hero-role">
              <span className="prefix">{t("home.hero.rolePrefix")}</span>
              <Type />
            </div>
            <p className="hero-value lead">{t("home.hero.value")}</p>
            <div className="hero-cta">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => requestResume()}
                data-magnetic="0.35"
              >
                {t("home.hero.viewResume")} <AiOutlineArrowRight />
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => scrollToSection("contact")}
                data-magnetic="0.35"
              >
                <HiOutlineMail /> {t("home.hero.getInTouch")}
              </button>
            </div>
            <div className="hero-social">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className={`social-btn social-btn--${s.brand}`}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="hero-visual" data-reveal="right">
            <div className="hero-panel glass">
              <span className="status-chip hero-status">
                <span className="dot" /> {t("home.hero.openToOpportunities")}
              </span>
              <div className="lottie-wrap">
                <AnimationLottie animationPath={heroAnim} />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll cue — bobs, then fades out as the reader scrolls
            (fade is scroll-linked in CSS; see SCROLL-DRIVEN CINEMATICS). */}
        <div className="scroll-cue" aria-hidden="true">
          <span className="scroll-cue__mouse" />
          <span className="scroll-cue__label">{t("home.hero.scrollCue")}</span>
        </div>
      </div>

      {/* ---------------- INTRO ---------------- */}
      <Home2 />
    </section>
  );
}

export default Home;
