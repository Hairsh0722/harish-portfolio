// =============================================================
//  ContentProvider
// -------------------------------------------------------------
//  Loads the dynamic site content once at startup and exposes it
//  via the useContent() hook. Structural lists (projects,
//  education, tech/tools, stats) come back render-ready; text
//  overlays are merged into i18next so existing t("…") calls pick
//  up the database copy automatically.
//
//  It starts from the bundled defaults, so the UI renders
//  immediately and simply refreshes when Firestore resolves. If
//  Firebase is unset or a read fails, the defaults stand — the
//  site never depends on the backend being reachable.
//
//  `refresh()` re-reads everything on demand — the in-site admin
//  panel calls it after a save so edits show without a reload.
// =============================================================
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import i18n from "../../i18n";
import { firebaseReady } from "../../services/firebase";
import {
  loadStructuralContent,
  loadTextOverlays,
} from "../../services/content";
import {
  DEFAULT_CONTENT,
  resolveProjects,
  resolveEducationList,
  resolveSkills,
  sortStats,
} from "./registries";

const ContentContext = createContext({ ...DEFAULT_CONTENT, refresh: () => {} });

// Replace a section only when the database actually returned rows, so an
// unseeded (empty) collection keeps showing the bundled default instead of
// blanking the section.
const pick = (rows, transform, fallback) =>
  Array.isArray(rows) && rows.length ? transform(rows) : fallback;

export function ContentProvider({ children }) {
  const [content, setContent] = useState(DEFAULT_CONTENT);

  const load = useCallback(async () => {
    if (!firebaseReady) return;

    const [structural, overlays] = await Promise.all([
      loadStructuralContent(),
      loadTextOverlays(),
    ]);

    // Merge text overlays over the bundled locale resources (DB wins), then
    // nudge i18next so mounted components re-render with the new copy.
    if (overlays) {
      let changed = false;
      Object.entries(overlays).forEach(([lang, tree]) => {
        if (tree && typeof tree === "object") {
          i18n.addResourceBundle(lang, "translation", tree, true, true);
          changed = true;
        }
      });
      if (changed) i18n.changeLanguage(i18n.language);
    }

    if (structural) {
      setContent({
        projects: pick(
          structural.projects,
          resolveProjects,
          DEFAULT_CONTENT.projects
        ),
        education: pick(
          structural.education,
          resolveEducationList,
          DEFAULT_CONTENT.education
        ),
        techstack: pick(
          structural.techstack,
          resolveSkills,
          DEFAULT_CONTENT.techstack
        ),
        toolstack: pick(
          structural.toolstack,
          resolveSkills,
          DEFAULT_CONTENT.toolstack
        ),
        stats: pick(structural.stats, sortStats, DEFAULT_CONTENT.stats),
      });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Guard against setting state after unmount (the async load resolves late).
    if (firebaseReady) {
      load().catch((err) => {
        if (!cancelled) {
          // eslint-disable-next-line no-console
          console.warn("Content load failed — using bundled defaults.", err);
        }
      });
    }
    return () => {
      cancelled = true;
    };
  }, [load]);

  return (
    <ContentContext.Provider value={{ ...content, refresh: load }}>
      {children}
    </ContentContext.Provider>
  );
}

// Access the loaded (or default) site content anywhere in the tree.
export function useContent() {
  return useContext(ContentContext);
}
