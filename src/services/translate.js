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
//    2. clients5.google.com "dict-chrome-ex" — keyless, and the only
//       one of the free endpoints that answers browser requests with
//       Access-Control-Allow-Origin: *.
//    3. translate.googleapis.com "gtx" — keyless, but sends no CORS
//       header, so it only works where a proxy/extension adds one.
//    4. MyMemory — keyless, documented, ~500 chars/query.
//  If every provider fails for a string the pass aborts with
//  TranslationUnavailable, so a blocked network fails fast and is
//  reported instead of silently leaving text in English.
//
//  A "Failed to fetch" from every provider is usually the network, not
//  the services: corporate TLS-inspecting proxies commonly reset
//  translate.googleapis.com and 403 api.mymemory.translated.net. That's
//  why provider 2 leads the keyless chain, and why the thrown error names
//  each provider's failure — see requestTranslation.
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
// Terms that must survive verbatim, matched case-sensitively on word
// boundaries. Two kinds, same treatment:
//  • Brand / proper nouns — a translator transliterates or, worse, "translates"
//    them: Postman -> "डाकिया" (mailman), Firestore -> "நெருப்புக் கடை"
//    (fire shop), APIs -> "शहद की मक्खी" (honey bee, i.e. the genus Apis).
//  • English words this site uses as fixed labels, where the generic
//    translation is wrong in context: Resume -> "फिर शुरू करना" (start again).
// Order doesn't matter — the regex below sorts longest-first, so "Harish Siva"
// wins over "Harish" and "REST API" over "API".
const GLOSSARY = [
  "iOPEX Technologies",
  "Harish Siva",
  "REST APIs",
  "REST API",
  "Firestore",
  "Bootstrap",
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
  "Resume",
  "MySQL",
  "XAMPP",
  "iOPEX",
  "Harish",
  "React",
  "HRIS",
  "APIs",
  "PHP",
  "API",
  "UIs",
  "Esc",
  "CV",
  "UI",
  "AI",
];

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// \b matters for the short entries: without it "Esc" would match inside
// "Escape" and "AI" inside "EMAIL", masking part of an ordinary word.
const GLOSSARY_RE = new RegExp(
  `\\b(?:${GLOSSARY.slice()
    .sort((a, b) => b.length - a.length)
    .map(escapeRe)
    .join("|")})\\b`,
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

/**
 * Keyless endpoint used by Chrome's dictionary extension. Normally answers with
 * a plain ["translated text"], and — unlike the gtx endpoint below — sends
 * Access-Control-Allow-Origin: *, so a browser fetch actually completes.
 * Occasionally it replies in the gtx segment shape or with a `sentences` object,
 * so all three are accepted.
 */
async function viaGoogleDict(text, target) {
  const url =
    "https://clients5.google.com/translate_a/t?client=dict-chrome-ex" +
    `&sl=${SOURCE_LANG}&tl=${encodeURIComponent(target)}&q=${encodeURIComponent(text)}`;
  const data = await fetchJson(url);
  const out = flattenSegments(data);
  if (!out.trim()) throw new Error("Empty response");
  return decodeEntities(out);
}

/**
 * Join a keyless Google response into one string. Each endpoint has its own
 * shape and they occasionally answer in each other's, so all are handled:
 *   ["text", …]                        — dict-chrome-ex
 *   [[[text, original, …], …], …]      — gtx (keep [0], drop the original)
 *   { sentences: [{ trans }, …] }      — gtx with extra dt params
 * Anything else yields "", which the callers report as "Empty response" so the
 * next provider gets a turn.
 */
function flattenSegments(data) {
  if (typeof data === "string") return data;
  if (data && Array.isArray(data.sentences))
    return data.sentences.map((s) => (s && s.trans) || "").join("");
  if (!Array.isArray(data)) return "";
  // ["text", …] — dict-chrome-ex.
  if (data.every((s) => typeof s === "string")) return data.join("");
  // [[[text, original, …], …], …] — gtx. The segment list is data[0], and only
  // element 0 of each segment is the translation: joining the whole segment
  // would splice the original English back into the output.
  if (!Array.isArray(data[0])) return "";
  return data[0]
    .map((seg) => (Array.isArray(seg) ? seg[0] || "" : typeof seg === "string" ? seg : ""))
    .join("");
}

// Keyless endpoint: returns [[[chunk, source, …], …], …] — join the chunks.
// Sends no CORS header, so in a browser this only works behind something that
// adds one; kept as a fallback for networks where it does.
async function viaGoogleFree(text, target) {
  const url =
    "https://translate.googleapis.com/translate_a/single?client=gtx" +
    `&sl=${SOURCE_LANG}&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(text)}`;
  const data = await fetchJson(url);
  const out = flattenSegments(data);
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
  // CORS-enabled first: the other two are commonly unreachable from a browser.
  list.push({ name: "google-dict", run: viaGoogleDict });
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
  const failures = [];
  for (const p of providers()) {
    try {
      const out = await p.run(text, target);
      if (out && out.trim()) return out;
      throw new Error("Empty response");
    } catch (err) {
      failures.push(`${p.name}: ${err.message}`);
      // eslint-disable-next-line no-console
      console.warn(`Translation provider "${p.name}" failed:`, err.message);
    }
  }
  // Name every provider's failure: one "Failed to fetch" is a blocked host, all
  // of them together is the network (proxy / offline / extension).
  throw new TranslationUnavailable(
    `No translation service reachable (${failures.join("; ")}).`
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
