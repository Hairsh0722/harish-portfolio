import React from "react";
import GitHubCalendar from "react-github-calendar";

/**
 * The calendar itself, split into its own chunk.
 *
 * react-github-calendar pulls in react-activity-calendar and date-fns — ~100 KB
 * of JavaScript for a widget that sits well below the fold. Keeping the import
 * here (and lazy-loading this module from Github.js once the section nears the
 * viewport) keeps all of it off the critical path.
 */
export default function GithubCalendar({ username, theme, totalCountLabel }) {
  return (
    <GitHubCalendar
      username={username}
      theme={theme}
      blockSize={12}
      blockMargin={4}
      blockRadius={2}
      fontSize={14}
      labels={{ totalCount: totalCountLabel }}
      style={{ color: "var(--text-primary)", maxWidth: "100%" }}
    />
  );
}
