import React, { useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { BsPinAngle, BsHeart, BsHeartFill } from "react-icons/bs";
import { GUILD_NOTES, avatarColor, initialOf } from "./guildData";
import PinModal from "./PinModal";
import { subscribePins, addPin } from "./guildStore";

const LIKES_KEY = "guild.likes.v1"; // ids the visitor has hearted (per browser)

// Rotating pastel paper + tape combos for visitor-added notes.
const NEW_COLORS = ["mint", "rose", "blue", "yellow", "pink"];
const NEW_TAPES = ["amber", "red", "teal", "green", "rose"];

// Seeds are curated testimonials that live in code — shown to everyone, not
// deletable from the UI (edit guildData.js to change them).
const SEEDS = GUILD_NOTES.map((n) => ({ ...n, seed: true }));

// Owner moderation (edit / delete pins, mark "loved") now lives in the in-site
// admin panel (sign in with ?admin). The board itself is purely visitor-facing.
function Guild() {
  const { t } = useTranslation();
  const [openModal, setOpenModal] = useState(false);
  const [livePins, setLivePins] = useState([]);
  const [liked, setLiked] = useState(() => new Set());

  // Real-time pins (shared via Firestore, or local fallback).
  useEffect(() => {
    const unsubPins = subscribePins(setLivePins);
    return () => unsubPins();
  }, []);

  // Visitor's own hearts.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LIKES_KEY);
      if (raw) setLiked(new Set(JSON.parse(raw)));
    } catch (_) {
      /* ignore */
    }
  }, []);

  // Board = live pins (newest first) then curated seeds.
  const notes = useMemo(() => [...livePins, ...SEEDS], [livePins]);

  const toggleLike = (id) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        window.localStorage.setItem(LIKES_KEY, JSON.stringify([...next]));
      } catch (_) {
        /* ignore */
      }
      return next;
    });
  };

  // A pin shows for everyone immediately (no approval needed).
  const handlePinned = async ({ name, message }) => {
    const i = livePins.length;
    await addPin({
      name,
      message,
      color: NEW_COLORS[i % NEW_COLORS.length],
      tape: NEW_TAPES[i % NEW_TAPES.length],
    });
  };

  return (
    <section className="section section--page guild-section" id="guild">
      <div className="container-x" style={{ textAlign: "center" }}>
        <span className="eyebrow eyebrow--center guild-badge" data-reveal>
          {t("guild.eyebrow")}
        </span>
        <h1 className="section-heading" data-reveal>
          <Trans i18nKey="guild.heading">
            The Wall <span className="accent">Keeps Them</span>
          </Trans>
        </h1>
        <p className="guild-subtitle accent-text" data-reveal>
          {t("guild.subtitle")}
        </p>

        <div className="guild-cta" data-reveal>
          <button
            type="button"
            className="btn btn-primary guild-pin-btn"
            onClick={() => setOpenModal(true)}
            data-magnetic="0.35"
          >
            <BsPinAngle aria-hidden="true" /> {t("guild.pin")}
          </button>
        </div>

        <div className="guild-recent" data-reveal>
          <span className="guild-recent__line" aria-hidden="true" />
          <span className="guild-recent__label">{t("guild.recent")}</span>
          <span className="guild-recent__line" aria-hidden="true" />
        </div>

        {notes.length === 0 ? (
          <p className="guild-empty" data-reveal>
            {t("guild.empty")}
          </p>
        ) : (
          <div className="guild-board" data-reveal-children="pop">
            {notes.map((note) => {
              const isLiked = liked.has(note.id);
              const likeCount = (note.likes || 0) + (isLiked ? 1 : 0);
              return (
                <article
                  key={note.id}
                  className={`guild-note guild-note--${note.color}`}
                >
                  <span
                    className={`guild-note__tape guild-note__tape--${note.tape}`}
                    aria-hidden="true"
                  />

                  <div className="guild-note__top">
                    <span
                      className="guild-note__count"
                      aria-label={t("guild.likesLabel", { count: likeCount })}
                    >
                      {likeCount}
                    </span>
                  </div>

                  <p className="guild-note__message">{note.message}</p>
                  <span className="guild-note__rule" aria-hidden="true" />

                  {note.loved && (
                    <span className="guild-note__loved">{t("guild.loved")}</span>
                  )}

                  <div className="guild-note__foot">
                    <span
                      className="guild-note__avatar"
                      style={{ background: avatarColor(note.author || note.name) }}
                      aria-hidden="true"
                    >
                      {initialOf(note.author || note.name)}
                    </span>
                    <span className="guild-note__meta">
                      <span className="guild-note__author">
                        {note.author || note.name}
                      </span>
                      <span className="guild-note__date">{note.date}</span>
                    </span>
                    <button
                      type="button"
                      className={`guild-note__like${isLiked ? " is-liked" : ""}`}
                      onClick={() => toggleLike(note.id)}
                      aria-pressed={isLiked}
                      aria-label={isLiked ? t("guild.unlike") : t("guild.like")}
                    >
                      {isLiked ? <BsHeartFill /> : <BsHeart />}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {openModal && (
        <PinModal onClose={() => setOpenModal(false)} onPinned={handlePinned} />
      )}
    </section>
  );
}

export default Guild;
