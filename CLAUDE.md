# CLAUDE.md

Guidance for Claude (or any AI assistant) working in this repository.

## Project Overview

This is **Harish Siva's personal portfolio website** — a single-page, scroll-driven React app with an aurora / glassmorphism visual style. It showcases the owner's background, skills, and resume. Every section stacks vertically on one page; the navbar smooth-scrolls between them (there are no separate routed pages).

- **Live site:** https://harishportfolio.lovestoblog.com/
- **Based on:** open-source template by [Soumyajit Behera](https://github.com/soumyajit4419/Portfolio), heavily customized.

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 17 (Create React App) |
| Layout | Single-page vertical scroll — sections stacked in `App.js`. Navbar anchors + Lenis smooth-scroll (`helper/smoothScroll.js`, `helper/scrollToSection.js`); `DeepLinkScroll.js` handles `#anchor` deep links. React Router v6 only wraps the app for those anchors — no routed pages. |
| UI | React Bootstrap 2 + custom CSS |
| i18n | i18next + react-i18next — English / Hindi / Tamil, strings in `src/locales/*.json`, config in `src/i18n.js` |
| Theming | Light/dark toggle (`helper/useTheme.js`) + accent palette switcher (`helper/AccentSwitcher.js`); tokens in `style.css` |
| Animation | lottie-react, typewriter-effect, react-parallax-tilt, Lenis smooth scroll |
| PDF Viewer | react-pdf |
| Contact form | @emailjs/browser (client-side email, no server) |
| GitHub calendar | react-github-calendar |
| Icons | react-icons |
| HTTP Client | axios (`src/services/api.js`) |

No TypeScript, no CSS-in-JS, no Redux-style state library — state lives in component hooks and React context (i18next, theme). Keep additions consistent with this lightweight setup unless asked to introduce something new.

## Project Structure

```
Portfolio-master/
├── public/                  # Static assets, favicons, manifest, index.html
├── src/
│   ├── Assets/              # Images, SVG tech icons, Lottie JSON, resume PDF
│   ├── locales/             # i18n strings: en.json, hi.json, ta.json
│   ├── components/
│   │   ├── Home/            # Hero, intro, typewriter, code terminal
│   │   ├── About/           # About card, tech/tool stack, GitHub calendar
│   │   ├── Projects/        # Skills section + project showcase (projectsData.js)
│   │   ├── Resume/          # PDF resume viewer (reveals on request)
│   │   ├── Contact/         # EmailJS contact form + WhatsApp CTA
│   │   ├── Connect/         # Social links section
│   │   ├── Assistant/       # Client-side AI assistant (knowledgeBase.js, matchIntent.js)
│   │   ├── helper/          # Aurora backdrop, cursor, reveal, smooth-scroll,
│   │   │                    #   theme/accent/language switchers, back-to-top
│   │   ├── Navbar.js        # Fixed nav: anchors, scrollspy, theme/lang/accent controls
│   │   ├── DeepLinkScroll.js# Scrolls to the #anchor section on load
│   │   ├── Footer.js        # Footer with social links
│   │   └── Pre.js           # Preloader
│   ├── services/            # Axios API client (api.js)
│   ├── i18n.js              # i18next initialization
│   ├── App.js               # Single-page shell: stacks all sections
│   ├── style.css            # Design system (aurora, glass, layout, theme tokens)
│   └── index.js             # Entry point
└── package.json
```

## Commands

```bash
npm install       # install dependencies
npm start         # dev server at http://localhost:3000
npm run build     # production build to build/
npm test          # run tests
```

## Where to Make Changes

Most user-facing **text is now translated** — it lives in `src/locales/{en,hi,ta}.json`, not in JSX. Edit the string in **all three** files (English is the source of truth) and it's resolved at render via `t("key")`. Structural/visual and non-text data still live in components.

| Task | File(s) |
|---|---|
| Hero greeting, tagline, value copy | `src/locales/*.json` → `home.hero.*` |
| Typewriter roles | `src/locales/*.json` → `home.roles` |
| About text & interests | `src/locales/*.json` → `about.*` |
| Skills / projects section copy | `src/locales/*.json` → `skills.*` |
| Contact / connect / footer copy | `src/locales/*.json` → `contact.*`, `connect.*`, `footer.*` |
| Add / edit a UI language | add `src/locales/<lang>.json`, register in `src/i18n.js`, add to `helper/LanguageSwitcher.js` |
| Hero social links | `src/components/Home/Home.js` |
| Tech stack icons | `src/components/About/Techstack.js` (and `Projects/Techstack.js`) |
| Tools icons | `src/components/About/Toolstack.js` (and `Projects/Toolstack.js`) |
| Project showcase entries | `src/components/Projects/projectsData.js` |
| AI assistant answers / intents | `src/components/Assistant/knowledgeBase.js` |
| Resume PDF | `src/Assets/harish_resume_new.pdf` |
| Colors, accent palettes & design tokens | `src/style.css` |

## Sections (single-page)

The site is one page; the navbar scrolls between sections by `id`. Order and ids are defined in `App.js` (render order) and `src/components/helper/scrollToSection.js` (`SECTION_IDS`).

| Section id | Description |
|---|---|
| `home` | Hero, intro, typewriter, social links |
| `about` | Background, education, interests, GitHub contribution calendar |
| `skills` | Professional skillset and tools |
| `projects` | Featured project showcase |
| `resume` | Embedded resume viewer (hidden until requested) with download |
| `contact` | EmailJS contact form + WhatsApp CTA |
| _connect_ | Social links (below contact; not a navbar item) |

## Conventions & Constraints

- **Component style:** functional components, plain CSS (no CSS modules/Tailwind). Match existing patterns in `src/components/` rather than introducing new styling systems.
- **Internationalization:** never hardcode user-facing text in JSX. Add a key under the right namespace in **all three** locale files and render with `useTranslation()`'s `t()`. Keep the three files structurally in sync.
- **Theming:** support both light and dark via the CSS custom properties in `style.css` — don't hardcode colors; use the `--accent`/token variables so the accent switcher keeps working.
- **Accessibility:** respect `prefers-reduced-motion` (the smooth-scroll and animations already branch on it); keep ARIA labels on interactive elements (nav, buttons, social links, the assistant, form fields).
- **Performance:** the aurora background is GPU-friendly and fixed-position — avoid changes that force repaints on scroll. Scrolling is driven by Lenis; route section navigation through `scrollToSection.js` rather than fighting it with manual `scrollTo`.
- **Content vs. code:** translated copy lives in `src/locales/*.json`; non-text data (icons, project entries, assistant knowledge) lives in the component/data files listed above. Prefer editing those over hardcoding elsewhere.
- **Resume:** the PDF is rendered in-browser via `react-pdf`; if replacing it, keep the filename convention or update the import in `src/components/Resume/`.
- **New sections:** add the component to the stack in `App.js`, give it an `id`, and — if it should be reachable from the nav — add its id to `SECTION_IDS` in `scrollToSection.js` and to `NAV_ITEMS` in `Navbar.js`.

## Testing & Verification

Before committing changes:
1. Run `npm start` and scroll through every affected section; confirm navbar anchors and scrollspy still land correctly.
2. Verify responsiveness at desktop, tablet, and mobile widths.
3. If text changed, switch languages (English / Hindi / Tamil) and confirm all three render.
4. If styling changed, check both light and dark themes.
5. Confirm `npm run build` completes without errors/warnings introduced by the change.
