import React from "react";
import Typewriter from "typewriter-effect";
import { useTranslation } from "react-i18next";

const prefersReducedMotion =
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Type() {
  const { t, i18n } = useTranslation();
  const roles = t("home.roles", { returnObjects: true });
  const list = Array.isArray(roles) ? roles : [String(roles)];

  if (prefersReducedMotion) {
    return <span>{list[0]}</span>;
  }

  // Keyed on language so the typewriter re-initializes with the translated
  // strings when the visitor switches languages.
  return (
    <span key={i18n.language}>
      <Typewriter
        options={{
          strings: list,
          autoStart: true,
          loop: true,
          deleteSpeed: 40,
        }}
      />
    </span>
  );
}

export default Type;
