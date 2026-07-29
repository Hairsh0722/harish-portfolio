// =============================================================
//  Machine translation (admin-only)
// -------------------------------------------------------------
//  The owner edits content in ENGLISH only. Hindi and Tamil are
//  generated from that English when the admin panel saves, and
//  stored in Firestore (content/hi, content/ta) exactly like a
//  hand-written translation. Visitors never call a translation
//  service — they read the saved text — so the public site keeps
//  working with no network dependency and no extra latency.
//
//  Providers, tried in order (first success wins):
//    1. Google Cloud Translation v2 — used only when
//       REACT_APP_GOOGLE_TRANSLATE_KEY is set (documented, paid).
//    2. translate.googleapis.com "gtx" — keyless and free, but an
//       undocumented endpoint: it can rate-limit or change shape.
//    3. MyMemory — keyless, free, documented, ~500 chars/query.
//  If every provider fails for a string the pass aborts with
//  TranslationUnavailable, so a blocked network fails fast and is
//  reported instead of silently leaving text in English.
//
//  Two things are protected from the translator:
//   • i18next placeholders ({{count}}) and <Trans> markers
//     (<1>…</1>) — masked before the request, restored after.
//   • Proper nouns from GLOSSARY (Harish Siva, iOPEX, React…) —
//     masked the same way so they're never transliterated.
//  If a marker doesn't survive the round trip the English string is
//  kept: a missing translation is recoverable, a mangled marker
//  would break the rendered markup.
// =============================================================

export const SOURCE_LANG = "en";
export const TARGET_LANGS = ["hi", "ta"];
export const LANG_LABELS = { en: "English", hi: "Hindi", ta: "Tamil" };

// Longest URL the keyless endpoint reliably accepts (it's a GET).
const MAX_CHARS = 1400;
const CONCURRENCY = 4;

// Thrown when no provider is reachable — the caller then saves the English
// edit anyway and tells the owner the translation pass was skipped.
export class TranslationUnavailable extends Error {
  constructor(message) {
    super(message || "No translation service is reachable right now.");
    this.name = "TranslationUnavailable";
  }
}

// ---------------------------------------------------------------------------
//  Masking: placeholders, markup markers and proper nouns
// ---------------------------------------------------------------------------
// Brand / proper nouns that must survive verbatim (longest first so "Harish
// Siva" wins over "Harish"). Matched case-sensitively on word boundaries.
const GLOSSARY = [
  "iOPEX Technologies",
  "Harish Siva",
  "Node.js",
  "Next.js",
  "NestJS",
  "CodeIgniter",
  "TypeScript",
  "JavaScript",
  "WhatsApp",
  "GitHub",
  "LinkedIn",
  "Firebase",
  "Postman",
  "Prisma",
  "MySQL",
  "XAMPP",
  "iOPEX",
  "Harish",
  "React",
  "PHP",
];

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const GLOSSARY_RE = new RegExp(
  `(?:${GLOSSARY.map(escapeRe).join("|")})`,
  "g"
);

// i18next interpolation, <Trans> index markers / any tag, URLs and emails.
const TOKEN_RE =
  /(\{\{[^{}]*\}\}|\$t\([^)]*\)|<\/?\s*\d+\s*>|<[^<>]+>|https?:\/\/[^\s]+|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;

// Sentinel shapes, tried in order. Engines pass some through and mangle others,
// so the round trip is verified and retried with the next shape.
const SENTINELS = [(i) => `[[${i}]]`, (i) => `#${i}#`];

const HAS_LETTER = /[A-Za-z]/;

function mask(text, sentinel) {
  const tokens = [];
  const keep = (m) => sentinel(tokens.push(m) - 1);
  return { masked: text.replace(TOKEN_RE, keep).replace(GLOSSARY_RE, keep), tokens };
}

// Loose matcher: engines sometimes pad a sentinel with spaces ("[[ 0 ]]").
const sentinelRe = (s) =>
  new RegExp(s.split("").map(escapeRe).join("\\s*"));

function unmask(text, tokens, sentinel) {
  let out = text;
  for (let i = 0; i < tokens.length; i++) {
    const re = sentinelRe(sentinel(i));
    if (!re.test(out)) return null; // marker lost — caller keeps English
    out = out.replace(re, () => tokens[i]);
  }
  return out;
}

/**
 * Is there anything here worth sending to a translator? Skips empty strings,
 * values with no letters at all ("2017 – 2021", "©"), over-long strings, and
 * strings that are nothing but placeholders / proper nouns ("you@example.com").
 */
export function isTranslatableText(value) {
  if (typeof value !== "string") return false;
  const s = value.trim();
  if (!s || s.length > MAX_CHARS) return false;
  if (!HAS_LETTER.test(s)) return false;
  const { masked, tokens } = mask(s, SENTINELS[0]);
  let bare = masked;
  for (let i = 0; i < tokens.length; i++) bare = bare.replace(sentinelRe(SENTINELS[0](i)), " ");
  return HAS_LETTER.test(bare);
}

// Paths whose English value is deliberately kept in every language (proper
// nouns the site shows verbatim). Everything else is fair game.
const KEEP_ENGLISH_PATHS = [
  /^education\.items\.[^.]+\.institution$/,
  /^contact\.form\.emailPlaceholder$/,
  /^guild\.form\.emailPlaceholder$/,
];

export const keepsEnglish = (path) =>
  KEEP_ENGLISH_PATHS.some((re) => re.test(path));

// ---------------------------------------------------------------------------
//  Translation cache (localStorage) — a re-save costs no requests
// ---------------------------------------------------------------------------
const CACHE_KEY = "portfolio.mt.v1";
const CACHE_MAX = 3000;
let memCache = null;
let flushTimer = 0;

function cache() {
  if (memCache) return memCache;
  memCache = {};
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === "object") memCache = parsed;
  } catch (e) {
    /* storage unavailable / corrupt — start empty */
  }
  return memCache;
}

function persistCache() {
  window.clearTimeout(flushTimer);
  flushTimer = window.setTimeout(() => {
    try {
      if (Object.keys(memCache).length > CACHE_MAX) memCache = {};
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(memCache));
    } catch (e) {
      /* ignore — the cache is an optimisation, not state */
    }
  }, 400);
}

// ---------------------------------------------------------------------------
//  Providers
// ---------------------------------------------------------------------------
async function fetchJson(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Documented, keyed API. Only offered when a key is configured.
async function viaGoogleCloud(text, target, key) {
  const data = await fetchJson(
    `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, source: SOURCE_LANG, target, format: "text" }),
    }
  );
  const out = data?.data?.translations?.[0]?.translatedText;
  if (!out) throw new Error("Empty response");
  return decodeEntities(out);
}

// Keyless endpoint: returns [[[chunk, source, …], …], …] — join the chunks.
async function viaGoogleFree(text, target) {
  const url =
    "https://translate.googleapis.com/translate_a/single?client=gtx" +
    `&sl=${SOURCE_LANG}&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(text)}`;
  const data = await fetchJson(url);
  if (!Array.isArray(data) || !Array.isArray(data[0])) throw new Error("Unexpected response");
  const out = data[0].map((seg) => (Array.isArray(seg) ? seg[0] || "" : "")).join("");
  if (!out.trim()) throw new Error("Empty response");
  return out;
}

async function viaMyMemory(text, target) {
  const url =
    "https://api.mymemory.translated.net/get" +
    `?langpair=${SOURCE_LANG}|${encodeURIComponent(target)}&q=${encodeURIComponent(text)}`;
  const data = await fetchJson(url);
  const out = data?.responseData?.translatedText;
  if (!out || /QUERY LENGTH LIMIT|INVALID|MYMEMORY WARNING/i.test(out)) {
    throw new Error(typeof out === "string" ? out.slice(0, 80) : "Empty response");
  }
  return decodeEntities(out);
}

// MyMemory / Cloud v2 return HTML-escaped text.
function decodeEntities(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

function providers() {
  const list = [];
  const key = process.env.REACT_APP_GOOGLE_TRANSLATE_KEY;
  if (key) list.push({ name: "google-cloud", run: (t, l) => viaGoogleCloud(t, l, key) });
  list.push({ name: "google-free", run: viaGoogleFree });
  list.push({ name: "mymemory", run: viaMyMemory });
  return list;
}

// One masked string through the provider chain. If every provider fails for it,
// the network or the services are down — throw so the caller aborts the whole
// pass and says so, rather than quietly leaving strings in English (which reads
// as "translated fine" to the owner). Callers stop on the first throw, so a
// blocked network costs a handful of requests, not one per string.
async function requestTranslation(text, target) {
  let last = null;
  for (const p of providers()) {
    try {
      const out = await p.run(text, target);
      if (out && out.trim()) return out;
      throw new Error("Empty response");
    } catch (err) {
      last = err;
      // eslint-disable-next-line no-console
      console.warn(`Translation provider "${p.name}" failed:`, err.message);
    }
  }
  throw new TranslationUnavailable(
    `Translation service unreachable (${last ? last.message : "unknown error"}).`
  );
}

/**
 * Translate one string. Returns the translation, or null when the markers
 * couldn't be preserved (caller keeps the English). Throws
 * TranslationUnavailable when no provider can be reached at all.
 */
export async function translateText(text, target) {
  if (!isTranslatableText(text)) return null;
  const source = text.trim();
  const cacheKey = `${target}|${source}`;
  const store = cache();
  if (typeof store[cacheKey] === "string") return store[cacheKey];

  for (const sentinel of SENTINELS) {
    const { masked, tokens } = mask(source, sentinel);
    const raw = await requestTranslation(masked, target);
    const restored = tokens.length ? unmask(raw, tokens, sentinel) : raw;
    if (restored) {
      store[cacheKey] = restored;
      persistCache();
      return restored;
    }
    // Markers were mangled — retry with the next sentinel shape.
  }
  return null;
}

// A leaf is either a string or an array of strings (roles, project modules).
async function translateLeaf(value, target) {
  if (Array.isArray(value)) {
    const out = [];
    let hits = 0;
    for (const item of value) {
      const tr = await translateText(item, target);
      if (tr == null) out.push(item);
      else {
        out.push(tr);
        hits += 1;
      }
    }
    return hits ? out : null;
  }
  return translateText(value, target);
}

// ---------------------------------------------------------------------------
//  i18next tree helpers
// ---------------------------------------------------------------------------
export const getAt = (obj, path) =>
  path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);

// Immutable deep set (same contract as the admin panel's setPath).
export function setAt(obj, path, value) {
  const keys = path.split(".");
  const root = Array.isArray(obj) ? [...obj] : { ...(obj || {}) };
  let cur = root;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    const next = cur[k];
    cur[k] = Array.isArray(next) ? [...next] : { ...(next || {}) };
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
  return root;
}

const isStringArray = (v) => Array.isArray(v) && v.every((x) => typeof x === "string");

// Visit every leaf (string / string[]) with its dotted path.
export function walkLeaves(tree, visit, prefix = "") {
  if (!tree || typeof tree !== "object") return;
  for (const key of Object.keys(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    const value = tree[key];
    if (typeof value === "string" || isStringArray(value)) visit(path, value);
    else if (value && typeof value === "object") walkLeaves(value, visit, path);
  }
}

const sameValue = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Which English leaves need (re)translating for one target language?
 *
 *  • `all: true`  — every translatable leaf (the "re-translate everything"
 *    action; overwrites hand-written translations).
 *  • default      — leaves whose English changed since `baseline`, plus leaves
 *    the target language has no value for yet (new projects, new keys). Keys the
 *    owner hasn't touched keep whatever translation they already have.
 */
export function collectTranslatable(en, { baseline, existing, all = false } = {}) {
  const out = [];
  walkLeaves(en, (path, value) => {
    if (keepsEnglish(path)) return;
    const translatable = Array.isArray(value)
      ? value.some(isTranslatableText)
      : isTranslatableText(value);
    if (!translatable) return;
    if (all) {
      out.push({ path, value });
      return;
    }
    const before = baseline ? getAt(baseline, path) : undefined;
    const changed = !baseline || !sameValue(before, value);
    const target = existing ? getAt(existing, path) : undefined;
    const missing =
      target == null ||
      (typeof target === "string" && !target.trim()) ||
      (Array.isArray(target) && !target.length);
    if (changed || missing) out.push({ path, value });
  });
  return out;
}

/**
 * Translate a list of `{ path, value }` entries into `target`.
 * Returns `{ results, skipped }` — `skipped` holds the paths that kept their
 * English (markers couldn't be preserved). Throws TranslationUnavailable if the
 * service goes away mid-run, so the caller can still save the English edit.
 */
export async function translateEntries(entries, target, onProgress) {
  const results = [];
  const skipped = [];
  let cursor = 0;
  let done = 0;
  let failure = null;

  const worker = async () => {
    while (cursor < entries.length && !failure) {
      const entry = entries[cursor++];
      try {
        const value = await translateLeaf(entry.value, target);
        if (value == null) skipped.push(entry.path);
        else results.push({ path: entry.path, value });
      } catch (err) {
        failure = err;
        return;
      }
      done += 1;
      if (onProgress) onProgress(done, entries.length);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, entries.length) }, worker)
  );
  if (failure) throw failure;
  return { results, skipped };
}

// Merge translated leaves back into a language tree (returns a new tree).
export function applyTranslations(tree, results) {
  return results.reduce((acc, r) => setAt(acc, r.path, r.value), tree || {});
}
