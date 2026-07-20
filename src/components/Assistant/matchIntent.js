/* =============================================================
   AI ASSISTANT — INTENT MATCHER
   A tiny, dependency-free scoring engine. It normalizes the
   question, then scores every intent by how much of its keyword
   vocabulary appears in the text. Longer keyword phrases weigh
   more, so specific questions ("what tech is THIS SITE built
   with?") beat generic ones ("skills"). No network, no keys —
   everything runs in the browser.
   ============================================================= */

import { INTENTS, FALLBACK_ID } from "./knowledgeBase";

// Pad with spaces so keyword substring checks respect rough word
// boundaries, and strip punctuation down to spaces. We keep + # .
// so tokens like "node.js", "c++" and "c#" survive.
function normalize(text) {
  return ` ${String(text)
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;
}

const fallback = INTENTS.find((i) => i.id === FALLBACK_ID);

/**
 * Pick the best-matching intent for a question.
 * Returns the fallback intent when nothing scores above zero.
 */
export function matchIntent(query) {
  const q = normalize(query);
  let best = null;
  let bestScore = 0;

  for (const intent of INTENTS) {
    if (!intent.keywords || !intent.keywords.length) continue;

    let score = 0;
    for (const kw of intent.keywords) {
      // Pad short keywords so "hi" doesn't match inside "this".
      const needle = kw.length <= 3 ? ` ${kw} ` : kw.toLowerCase();
      if (q.includes(needle)) {
        // Phrase length is the signal: matching "this site" (9) counts
        // for far more than matching "skill" (5).
        score += needle.trim().length + 1;
      }
    }

    score *= intent.weight || 1;
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }

  return bestScore > 0 && best ? best : fallback;
}

/**
 * Resolve a question to a reply object.
 *
 * This is the seam for a future real-LLM backend: if you later stand up
 * a serverless proxy (so no API key ships in the client) and set
 * REACT_APP_AI_ENDPOINT, route here and fall back to the local knowledge
 * base on any error. Kept async on purpose so callers don't change.
 */
export async function getReply(query) {
  const endpoint = process.env.REACT_APP_AI_ENDPOINT;

  if (endpoint) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });
      if (res.ok) {
        const data = await res.json();
        // Expect { text, list?, chips?, actions? } from the proxy.
        if (data && data.text) return data;
      }
    } catch (err) {
      // Network/proxy trouble — silently fall through to the local KB.
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.warn("AI endpoint failed, using local knowledge base.", err);
      }
    }
  }

  return matchIntent(query).reply;
}
