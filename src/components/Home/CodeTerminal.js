import React from "react";

/**
 * A decorative mock code-editor card that renders a short "about me"
 * snippet with syntax highlighting and a staggered line-reveal animation.
 * It's purely visual (the prose beside it carries the real content), so the
 * whole card is hidden from assistive tech via aria-hidden.
 */

const FILE_NAME = "harish.js";

// Each line is a list of [className, text] token pairs. An empty array is a
// blank line. Whitespace lives in tokens with an empty className.
const LINES = [
  [["tk-kw", "const"], ["", " "], ["tk-var", "harish"], ["", " "], ["tk-op", "="], ["", " "], ["tk-punc", "{"]],
  [["", "  "], ["tk-prop", "role"], ["tk-punc", ":"], ["", " "], ["tk-str", '"Software Engineer"'], ["tk-punc", ","]],
  [["", "  "], ["tk-prop", "stack"], ["tk-punc", ":"], ["", " "], ["tk-punc", "["], ["tk-str", '"React"'], ["tk-punc", ", "], ["tk-str", '"Node"'], ["tk-punc", ", "], ["tk-str", '"SQL"'], ["tk-punc", "],"]],
  [["", "  "], ["tk-prop", "focus"], ["tk-punc", ":"], ["", " "], ["tk-str", '"scalable systems + clean UX"'], ["tk-punc", ","]],
  [["", "  "], ["tk-prop", "learning"], ["tk-punc", ":"], ["", " "], ["tk-str", '"System Design"'], ["tk-punc", ","]],
  [["", "  "], ["tk-prop", "openToWork"], ["tk-punc", ":"], ["", " "], ["tk-bool", "true"], ["tk-punc", ","]],
  [["tk-punc", "};"]],
  [],
  [["tk-com", "// let's build something great →"]],
];

function CodeTerminal() {
  return (
    <div className="code-card" aria-hidden="true">
      <div className="code-card__bar">
        <span className="code-card__dots">
          <span className="code-card__dot code-card__dot--r" />
          <span className="code-card__dot code-card__dot--y" />
          <span className="code-card__dot code-card__dot--g" />
        </span>
        <span className="code-card__title">{FILE_NAME}</span>
      </div>

      <div className="code-card__body">
        {LINES.map((tokens, i) => (
          <span className="code-line" key={i} style={{ "--line": i }}>
            <span className="code-line__num">{i + 1}</span>
            <span className="code-line__content">
              {tokens.length === 0
                ? " "
                : tokens.map(([cls, text], j) => (
                    <span className={cls} key={j}>
                      {text}
                    </span>
                  ))}
              {i === LINES.length - 1 && <span className="code-caret" />}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default CodeTerminal;
