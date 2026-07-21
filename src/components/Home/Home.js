import React from "react";
import Home2 from "./Home2";
import scrollToSection from "../helper/scrollToSection";
import { requestResume } from "../helper/resumeReveal";
import Type from "./Type";
import heroAnim from "../../Assets/lottie/Developer2.json";
import AnimationLottie from "../helper/animation-lottie";
import {
  AiOutlineArrowRight,
  AiFillInstagram,
  AiFillFacebook,
} from "react-icons/ai";
import { FaLinkedinIn, FaGithub } from "react-icons/fa";
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
    icon: <AiFillInstagram />,
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
          <div className="hero-copy">
            <span className="eyebrow">{t("home.hero.eyebrow")}</span>
            <h1 className="hero-name">
              {t("home.hero.greeting")}
              <br />
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
              >
                {t("home.hero.viewResume")} <AiOutlineArrowRight />
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => scrollToSection("contact")}
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

          <div className="hero-visual">
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
      </div>

      {/* ---------------- INTRO ---------------- */}
      <Home2 />
    </section>
  );
}

export default Home;
