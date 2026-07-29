import React, { useEffect, useMemo, useState } from "react";
import { FiX, FiTrash2, FiUsers, FiLogOut } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { subscribeOwner, ownerSignOut, firebaseReady } from "../Guild/guildStore";
import OwnerLogin from "../Guild/OwnerLogin";
import { subscribeVisits, deleteVisit } from "./visitorStore";

/**
 * Owner-only visitor dashboard.
 *
 * Reuses the Guild Board's owner auth (same Firebase account / UID). It stays
 * invisible to normal visitors: it renders nothing unless the owner is signed
 * in, or the page was opened with ?visitors (which pops the owner sign-in).
 * Once signed in, a small launcher pill shows the live visit log.
 */

// Best-effort "when": prefer the Firestore server timestamp, else client ms.
function fmtWhen(v) {
  const ms =
    (v.createdAt && v.createdAt.seconds ? v.createdAt.seconds * 1000 : null) ||
    v.createdClient ||
    null;
  if (!ms) return v.date || "";
  try {
    return new Date(ms).toLocaleString();
  } catch (_) {
    return v.date || "";
  }
}

function place(v) {
  return [v.city, v.region, v.country].filter(Boolean).join(", ");
}

function VisitorDashboard() {
  const { t } = useTranslation();
  const [owner, setOwner] = useState(false);
  const [open, setOpen] = useState(false);
  const [wantLogin, setWantLogin] = useState(false);
  const [visits, setVisits] = useState([]);

  useEffect(() => subscribeOwner(setOwner), []);

  // ?visitors → open the dashboard (popping the owner sign-in first if needed).
  // The param is stripped so the link isn't accidentally shared.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.has("visitors")) {
        setOpen(true);
        if (firebaseReady) setWantLogin(true);
        params.delete("visitors");
        const q = params.toString();
        window.history.replaceState(
          {},
          "",
          window.location.pathname + (q ? `?${q}` : "") + window.location.hash
        );
      }
    } catch (_) {
      /* ignore */
    }
  }, []);

  // Only read the log once the owner is authenticated — Firestore rules deny
  // reads to everyone else, so subscribing earlier would just error.
  useEffect(() => {
    if (!owner) {
      setVisits([]);
      return undefined;
    }
    setWantLogin(false);
    return subscribeVisits(setVisits);
  }, [owner]);

  const stats = useMemo(() => {
    const total = visits.length;
    const named = visits.filter((v) => v.name && v.name.trim()).length;
    const countries = new Set(visits.map((v) => v.country).filter(Boolean));
    return { total, named, countries: countries.size };
  }, [visits]);

  // Invisible to normal visitors.
  if (!owner && !wantLogin) return null;

  return (
    <>
      {wantLogin && !owner && <OwnerLogin onClose={() => setWantLogin(false)} />}

      {owner && (
        <>
          <button
            type="button"
            className="pv-launch"
            onClick={() => setOpen((v) => !v)}
            aria-label={t("visitors.dash.open")}
            title={t("visitors.dash.open")}
          >
            <FiUsers aria-hidden="true" />
            <span className="pv-launch__count">{visits.length}</span>
          </button>

          {open && (
            <div
              className="pv-dash glass"
              role="dialog"
              aria-label={t("visitors.dash.title")}
            >
              <header className="pv-dash__head">
                <strong>
                  <FiUsers aria-hidden="true" /> {t("visitors.dash.title")}
                </strong>
                <button
                  type="button"
                  className="pv-dash__close"
                  onClick={() => setOpen(false)}
                  aria-label={t("visitors.dash.close")}
                >
                  <FiX aria-hidden="true" />
                </button>
              </header>

              <div className="pv-dash__stats">
                <span>
                  <b>{stats.total}</b> {t("visitors.dash.visits")}
                </span>
                <span>
                  <b>{stats.named}</b> {t("visitors.dash.named")}
                </span>
                <span>
                  <b>{stats.countries}</b> {t("visitors.dash.countries")}
                </span>
              </div>

              {!firebaseReady && (
                <p className="pv-dash__note">{t("visitors.dash.localNote")}</p>
              )}

              <div className="pv-dash__list" data-lenis-prevent>
                {visits.length === 0 ? (
                  <p className="pv-dash__empty">{t("visitors.dash.empty")}</p>
                ) : (
                  visits.map((v) => (
                    <div key={v.id} className="pv-visit">
                      <div className="pv-visit__row">
                        <span
                          className={`pv-visit__name${v.name ? "" : " is-anon"}`}
                        >
                          {v.name || t("visitors.dash.anon")}
                        </span>
                        <span className="pv-visit__when">{fmtWhen(v)}</span>
                        <button
                          type="button"
                          className="pv-visit__del"
                          onClick={() => deleteVisit(v.id)}
                          aria-label={t("visitors.dash.delete")}
                          title={t("visitors.dash.delete")}
                        >
                          <FiTrash2 aria-hidden="true" />
                        </button>
                      </div>
                      <div className="pv-visit__meta">
                        {place(v) && <span>📍 {place(v)}</span>}
                        {v.org && <span>🏢 {v.org}</span>}
                        {(v.device || v.os || v.browser) && (
                          <span>
                            💻 {[v.device, v.os, v.browser].filter(Boolean).join(" · ")}
                          </span>
                        )}
                        <span>
                          ↪{" "}
                          {v.referrer && v.referrer !== "direct"
                            ? v.referrer
                            : t("visitors.dash.direct")}
                        </span>
                        {v.returning && (
                          <span className="pv-visit__badge">
                            {t("visitors.dash.returning")}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <footer className="pv-dash__foot">
                <button
                  type="button"
                  className="pv-dash__signout"
                  onClick={() => ownerSignOut()}
                >
                  <FiLogOut aria-hidden="true" /> {t("visitors.dash.signOut")}
                </button>
              </footer>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default VisitorDashboard;
