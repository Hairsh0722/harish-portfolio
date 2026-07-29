# Dynamic content (Firestore)

The portfolio's content is loaded from **Firebase Firestore** at runtime. Edit
it in the [Firebase console](https://console.firebase.google.com/) → *Firestore
Database* and the site picks it up on the next load — no rebuild or redeploy.

If Firebase isn't configured (`REACT_APP_FIREBASE_*` unset) **or** a read fails,
the site falls back to the bundled defaults in
[`src/components/content/registries.js`](src/components/content/registries.js),
so it always works with no backend.

## First-time setup

1. Set `REACT_APP_FIREBASE_*` in `.env` (see `.env.example`).
2. Publish the rules in [`firestore.rules`](firestore.rules) (Firestore → Rules).
3. Seed the database from the current content:
   ```bash
   # .env also needs the owner login (writes are owner-only):
   #   SEED_OWNER_EMAIL=you@example.com
   #   SEED_OWNER_PASSWORD=••••••••
   npm run seed
   ```
   Re-running `npm run seed` is safe — it upserts by document ID.

## Editing in the browser (owner-only admin panel)

You don't have to use the Firebase console — there's a built-in editor for the
owner.

1. Add `?admin` to the URL for the owner sign-in prompt (same Firebase account,
   enforced by `firestore.rules`).
2. A floating **✎ Content** button appears (bottom-left). Open it.
3. Tabs: **Projects · Education · Tech · Tools · Stats · Text · Guild**. Edit,
   then **Save** — changes go straight to Firestore and the site refreshes live
   (no reload). The **Guild** tab edits/deletes visitor wall notes and marks a
   note as “Loved by Harish” (this replaces the old `?guild=owner` flow).
4. **You only ever type English.** Hindi and Tamil are machine-translated on
   save — see [Automatic translation](#automatic-translation) below.

The panel seeds each tab from the bundled defaults when a collection is still
empty, so you can also use it to populate a fresh database instead of
`npm run seed`. The **Text** tab edits the friendly fields per section, or the
raw i18next tree via **Advanced** (must be valid JSON to save).

Regular visitors never see the button or the editor — it only mounts for the
authenticated owner.

## Automatic translation

English is the single source of truth. When you save the **Text** or
**Projects** tab, the panel machine-translates the English into Hindi and Tamil
and writes all three `content/{en,hi,ta}` docs. The HI / TA sub-tabs are
read-only previews of that output.

- **Only what you changed is re-translated.** The panel diffs the English tree
  against the version it loaded, so untouched copy keeps the translation it
  already has (the hand-written Hindi/Tamil in `src/locales/*.json` is not
  overwritten). Keys a language is missing entirely — a new project or education
  entry — are translated too.
- **Re-translate all from English** (bottom of the Text tab) ignores the diff and
  rebuilds every key. It overwrites hand-written translations, asks first, and
  takes a couple of minutes.
- **Never translated:** i18next placeholders (`{{count}}`), `<Trans>` markers
  (`<1>…</1>`), URLs/emails, values with no letters (`2017 – 2021`), education
  `institution`, and the proper nouns in the `GLOSSARY` in
  [`src/services/translate.js`](src/services/translate.js) (Harish Siva, iOPEX,
  React, PHP…). Add a brand name there to protect it. If a marker doesn't survive
  the round trip, that one string stays English rather than shipping broken
  markup.
- **Language-independent by design:** project `title` and `tags`, and the
  Tech/Tools `label`s, render as typed in every language — they're product and
  technology names. Stat `value`/`suffix` are numbers; their labels live in the
  Text tab (`skills.stats.<key>`) and do get translated.
- **Providers** (first success wins, all client-side from the owner's browser):
  Google Cloud Translation v2 when `REACT_APP_GOOGLE_TRANSLATE_KEY` is set →
  the keyless `translate.googleapis.com` endpoint → MyMemory. The keyless ones
  are free and unofficial, so they can rate-limit; results are cached in
  `localStorage`, so re-saving costs no requests. If nothing is reachable the
  English still saves and the toast says the other languages were left alone.
- **Visitors never call a translation service** — they read the saved
  `content/{lang}` docs, so the public site stays fast and offline-safe.

Machine translation is a starting point, not a proofread. To correct a specific
Hindi/Tamil string by hand, edit that key in the Firebase console (or the
Advanced JSON view of that language) — the panel won't touch it again unless you
change the English or run **Re-translate all**.

## Collections ("tables")

| Collection / doc | Holds | Document shape |
|---|---|---|
| `content/en`, `content/hi`, `content/ta` | **All UI text**, per language | The full i18n tree (same shape as `src/locales/<lang>.json`). Deep-merged over the bundled JSON — the DB value wins. |
| `projects/{id}` | Project cards | `order`, `abbr`, `title`, `description`, `modules[]`, `tags[]`, `ghLink`, `demoLink`, `imgKey` |
| `education/{id}` | Education timeline | `order`, `iconKey`. Card text lives in `content/*` under `education.items.<id>` |
| `techstack/{id}` | Tech marquee | `order`, `label`, `iconKey`, optional `color` |
| `toolstack/{id}` | Tools marquee | `order`, `label`, `iconKey`, optional `color` |
| `meta/site` | Skill stats | `stats: [{ order, key, value, suffix }]` |

`order` sorts each list ascending. `id` is any stable string (used only as the
document key).

### Editing text

Text is **not** stored per-component — it's the i18next tree. To change the hero
tagline, edit `content/en` (and `content/hi`, `content/ta`) → `home.hero.value`.
A `content/*` doc may contain only the keys you want to override; anything absent
falls back to the bundled `src/locales/<lang>.json`.

Project `description` / `modules` are translated via the abbr key
`skills.projects.<abbr>` in the `content/*` docs; the values on the `projects`
doc are the English fallback.

### Icon & image keys

Icons and cover images can't live in a database, so a document stores a **key**
that maps to an imported asset in
[`src/components/content/registries.js`](src/components/content/registries.js).

- `imgKey` (projects): `eib`, `iconnect`. Empty/unknown → the abbreviation
  gradient cover.
- `iconKey` (education): `graduationCap`.
- `iconKey` (tech/tools): `javascript`, `jquery`, `typescript`, `codeigniter`,
  `php`, `node`, `nestjs`, `react`, `nextjs`, `sql`, `macos`, `ubuntu`,
  `chrome`, `vscode`, `claude`, `xampp`, `git`, `prisma`, `postman`.

**To add a new icon/image:** import the asset in `registries.js`, add it to the
matching registry (`SKILL_ICONS` / `EDU_ICONS` / `PROJECT_IMAGES`) under a new
key, then reference that key from the Firestore document. Adding a project/skill
that reuses an existing key needs no code change — just a new document.
