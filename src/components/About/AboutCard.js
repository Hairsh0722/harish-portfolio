import React from "react";
import Card from "react-bootstrap/Card";
import { Trans, useTranslation } from "react-i18next";

function AboutCard() {
  const { t } = useTranslation();
  return (
    <Card className="quote-card-view">
      <Card.Body>
        <blockquote className="blockquote mb-0">
          <p style={{ textAlign: "left" }}>
            <Trans i18nKey="about.card.p1">
              I'm <span className="purple">Harish Siva</span>, a <span className="purple">Software Engineer</span> based in Chennai, India, currently working with the software engineering team at <span className="purple">iOPEX Technologies</span>.
            </Trans>
            <br />
            <br />
            {t("home.intro.p1")}
            <br />
            <br />
            {t("home.intro.p3")}
            <br />
            <br />
            <Trans i18nKey="about.card.interestsIntro">
              <span className="purple">Outside of work, my interests include:</span>
            </Trans>
            <br />
          </p>

          <ul className="about-activity">
            <li>
              <Trans i18nKey="about.card.sports">
                🏏 <span className="purple">Sports</span>: Playing cricket and badminton.
              </Trans>
            </li>
            <li>
              <Trans i18nKey="about.card.travel">
                ✈️ <span className="purple">Travel</span>: Exploring new places and cultures.
              </Trans>
            </li>
            <li>
              <Trans i18nKey="about.card.music">
                🎵 <span className="purple">Music</span>: An essential companion while coding.
              </Trans>
            </li>
          </ul>

          <p style={{ color: "color-mix(in srgb, var(--accent) 45%, var(--text-muted))" }}>
            <Trans i18nKey="about.card.quote">"Spread love everywhere you go"</Trans>{" "}
          </p>
          <footer className="blockquote-footer">Harish</footer>
        </blockquote>
      </Card.Body>
    </Card>
  );
}

export default AboutCard;
