import React, { useEffect, useRef, useState } from "react";
import { FiX, FiLock } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { ownerSignIn } from "./guildStore";

// Owner sign-in for Firebase mode. Only the account whose UID matches
// REACT_APP_GUILD_OWNER_UID can delete pins (enforced by Firestore rules) —
// this form just authenticates; it never creates accounts.
function OwnerLogin({ onClose }) {
  const { t } = useTranslation();
  const closeRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | signing | error
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (closeRef.current) closeRef.current.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setStatus("signing");
    try {
      await ownerSignIn(email.trim(), password);
      onClose(); // subscribeOwner flips the wall into owner mode
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.error("Owner sign-in failed:", err);
      }
      setStatus("error");
    }
  };

  return (
    <div
      className="guild-modal__overlay"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="guild-modal guild-modal--sm glass"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guild-owner-title"
      >
        <button
          type="button"
          className="guild-modal__close"
          onClick={onClose}
          ref={closeRef}
          aria-label={t("guild.form.close")}
        >
          <FiX />
        </button>

        <h3 className="guild-modal__title" id="guild-owner-title">
          <FiLock aria-hidden="true" /> {t("guild.owner.title")}
        </h3>
        <p className="guild-modal__hint">{t("guild.owner.hint")}</p>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label" htmlFor="go-email">
              {t("guild.owner.email")}
            </label>
            <input
              id="go-email"
              type="email"
              className="form-input"
              autoComplete="username"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") setStatus("idle");
              }}
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="go-password">
              {t("guild.owner.password")}
            </label>
            <input
              id="go-password"
              type="password"
              className="form-input"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (status === "error") setStatus("idle");
              }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary guild-modal__submit"
            disabled={status === "signing"}
          >
            <FiLock />{" "}
            {status === "signing"
              ? t("guild.owner.signingIn")
              : t("guild.owner.signIn")}
          </button>

          {status === "error" && (
            <p className="form-status" role="alert" style={{ color: "#fca5a5" }}>
              {t("guild.owner.error")}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default OwnerLogin;
