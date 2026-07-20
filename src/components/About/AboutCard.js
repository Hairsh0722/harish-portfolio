import React from "react";
import Card from "react-bootstrap/Card";
import { Trans } from "react-i18next";

function AboutCard() {
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
            <Trans i18nKey="about.card.p2">
              I hold a degree in <span className="purple">Electronics and Instrumentation Engineering</span> from <span className="purple">Panimalar Engineering College</span>, which gives me a strong grounding in systems thinking that carries over into how I design and build software. My focus is on developing scalable, maintainable applications and solving practical problems with clean, efficient code.
            </Trans>
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

          <p style={{ color: "rgb(155 126 172)" }}>
            <Trans i18nKey="about.card.quote">"Spread love everywhere you go"</Trans>{" "}
          </p>
          <footer className="blockquote-footer">Harish</footer>
        </blockquote>
      </Card.Body>
    </Card>
  );
}

export default AboutCard;
