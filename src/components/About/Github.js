import React, { useEffect, useState } from "react";
import GitHubCalendar from "react-github-calendar";
import { useTranslation } from "react-i18next";

const GITHUB_USERNAME = "Hairsh0722";

// Purple ramps tuned to the aurora palette, one per theme so the empty days
// read correctly against both the dark and light backgrounds.
const CAL_THEMES = {
  dark: {
    level0: "#1b1730",
    level1: "#3f2768",
    level2: "#6a3ea6",
    level3: "#9a63d9",
    level4: "#c9a2ff",
  },
  light: {
    level0: "#ece8f6",
    level1: "#d2bcef",
    level2: "#b088e0",
    level3: "#8a57c9",
    level4: "#6a34a8",
  },
};

// Track <html data-theme> so the calendar recolors on theme toggle without
// threading a theme prop down through About. useTheme() owns the attribute;
// we just observe it (a second useTheme() call would fork the state).
function useThemeAttr() {
  const [theme, setTheme] = useState(
    () =>
      (typeof document !== "undefined" &&
        document.documentElement.getAttribute("data-theme")) ||
      "dark"
  );
  useEffect(() => {
    const el = document.documentElement;
    const obs = new MutationObserver(() =>
      setTheme(el.getAttribute("data-theme") || "dark")
    );
    obs.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return theme;
}

function Github() {
  const { t } = useTranslation();
  const theme = useThemeAttr();

  return (
    <div className="github-activity">
      <h3 className="github-activity__heading">{t("about.github.heading")}</h3>
      <p className="github-activity__sub lead">{t("about.github.sub")}</p>
      <div className="glass github-activity__card">
        <GitHubCalendar
          username={GITHUB_USERNAME}
          theme={CAL_THEMES[theme] || CAL_THEMES.dark}
          blockSize={12}
          blockMargin={4}
          blockRadius={2}
          fontSize={14}
          labels={{ totalCount: t("about.github.totalCount") }}
          style={{ color: "var(--text-primary)", maxWidth: "100%" }}
        />
      </div>
    </div>
  );
}

export default Github;
