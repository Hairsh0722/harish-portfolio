import React, { useEffect, useRef, useState, useCallback } from "react";
import { BsRobot } from "react-icons/bs";
import { FiSend, FiX, FiUser } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { getReply } from "./matchIntent";
import { GREETING, STARTER_CHIPS, CONTACT } from "./knowledgeBase";
import scrollToSection, {
  prefersReducedMotion,
} from "../helper/scrollToSection";
import { requestResume } from "../helper/resumeReveal";

/**
 * Floating AI assistant chat.
 *
 * A self-contained, in-browser assistant: it answers questions about Harish
 * from a curated knowledge base (see knowledgeBase.js) via a lightweight
 * intent matcher (matchIntent.js). No API key, no backend — but getReply()
 * has a seam to route to a real LLM proxy later.
 *
 * Design: glass panel + aurora accents, matches the site's design system and
 * re-themes with it. Respects prefers-reduced-motion and is keyboard/AT
 * friendly (dialog role, focus management, Esc to close).
 */

let messageSeq = 0;
const nextId = () => {
  messageSeq += 1;
  return messageSeq;
};

const greetingMessage = () => ({
  id: nextId(),
  role: "bot",
  text: GREETING,
  chips: STARTER_CHIPS,
});

function AiAssistant() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => [greetingMessage()]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const panelRef = useRef(null);
  const launcherRef = useRef(null);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const thinkTimer = useRef(null);

  // Auto-scroll the transcript to the newest message.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  // Focus the input when the panel opens; return focus to the launcher on close.
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
    launcherRef.current?.focus();
    return undefined;
  }, [open]);

  // Esc closes the panel from anywhere within it.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => () => clearTimeout(thinkTimer.current), []);

  // Run an action button (résumé, WhatsApp, section jump, external link).
  const runAction = useCallback((action) => {
    switch (action.kind) {
      case "resume":
        requestResume();
        setOpen(false);
        break;
      case "whatsapp":
        window.open(
          `https://wa.me/${CONTACT.whatsapp}`,
          "_blank",
          "noopener,noreferrer"
        );
        break;
      case "section":
        scrollToSection(action.target);
        setOpen(false);
        break;
      case "link":
        window.open(action.href, "_blank", "noopener,noreferrer");
        break;
      default:
        break;
    }
  }, []);

  const send = useCallback((raw) => {
    const text = raw.trim();
    if (!text || typing) return;

    setMessages((prev) => [...prev, { id: nextId(), role: "user", text }]);
    setInput("");
    setTyping(true);

    // A short "thinking" beat makes the reply feel considered (skipped for
    // reduced-motion users). getReply is async to keep the LLM seam open.
    const delay = prefersReducedMotion() ? 0 : 480;
    clearTimeout(thinkTimer.current);
    thinkTimer.current = setTimeout(async () => {
      const reply = await getReply(text);
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "bot", ...reply },
      ]);
    }, delay);
  }, [typing]);

  const onSubmit = (e) => {
    e.preventDefault();
    send(input);
  };

  const label = open ? t("assistant.close") : t("assistant.open");

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        className={`ai-fab ${open ? "is-open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={label}
        aria-expanded={open}
        aria-controls="ai-assistant-panel"
        title={label}
      >
        <span className="ai-fab__icon" aria-hidden="true">
          {open ? <FiX /> : <BsRobot />}
        </span>
        {!open && <span className="ai-fab__ping" aria-hidden="true" />}
      </button>

      <section
        id="ai-assistant-panel"
        ref={panelRef}
        className={`ai-panel ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="false"
        aria-label={t("assistant.chatLabel")}
        aria-hidden={!open}
      >
        {/* ---------------- HEADER ---------------- */}
        <header className="ai-panel__head">
          <span className="ai-avatar" aria-hidden="true">
            <BsRobot />
          </span>
          <div className="ai-panel__id">
            <strong>{t("assistant.title")}</strong>
            <span className="ai-status">
              <span className="ai-status__dot" /> {t("assistant.online")}
            </span>
          </div>
          <button
            type="button"
            className="ai-panel__close"
            onClick={() => setOpen(false)}
            aria-label={t("assistant.closeChat")}
          >
            <FiX aria-hidden="true" />
          </button>
        </header>

        {/* ---------------- TRANSCRIPT ---------------- */}
        <div className="ai-log" ref={scrollRef} role="log" aria-live="polite">
          {messages.map((m) => (
            <div key={m.id} className={`ai-row ai-row--${m.role}`}>
              <span className="ai-row__avatar" aria-hidden="true">
                {m.role === "bot" ? <BsRobot /> : <FiUser />}
              </span>
              <div className="ai-bubble">
                <p className="ai-bubble__text">{m.text}</p>

                {m.list && (
                  <ul className="ai-bubble__list">
                    {m.list.map((item, i) =>
                      typeof item === "string" ? (
                        <li key={i}>{item}</li>
                      ) : (
                        <li key={i}>
                          <strong>{item.label}:</strong> {item.value}
                        </li>
                      )
                    )}
                  </ul>
                )}

                {m.actions && (
                  <div className="ai-bubble__actions">
                    {m.actions.map((a, i) => (
                      <button
                        key={i}
                        type="button"
                        className="ai-action-btn"
                        onClick={() => runAction(a)}
                      >
                        {a.label ||
                          (a.kind === "resume"
                            ? t("assistant.action.resume")
                            : a.kind === "whatsapp"
                            ? t("assistant.action.whatsapp")
                            : t("assistant.action.open"))}
                      </button>
                    ))}
                  </div>
                )}

                {m.chips && (
                  <div className="ai-chips">
                    {m.chips.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className="ai-chip"
                        onClick={() => send(c)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {typing && (
            <div className="ai-row ai-row--bot">
              <span className="ai-row__avatar" aria-hidden="true">
                <BsRobot />
              </span>
              <div className="ai-bubble ai-bubble--typing" aria-label={t("assistant.typing")}>
                <span className="ai-dot" />
                <span className="ai-dot" />
                <span className="ai-dot" />
              </div>
            </div>
          )}
        </div>

        {/* ---------------- COMPOSER ---------------- */}
        <form className="ai-composer" onSubmit={onSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="ai-input"
            placeholder={t("assistant.placeholder")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label={t("assistant.typeMessage")}
            autoComplete="off"
          />
          <button
            type="submit"
            className="ai-send"
            disabled={!input.trim() || typing}
            aria-label={t("assistant.sendMessage")}
          >
            <FiSend aria-hidden="true" />
          </button>
        </form>
      </section>
    </>
  );
}

export default AiAssistant;
