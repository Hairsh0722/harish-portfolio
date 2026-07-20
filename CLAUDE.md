# CLAUDE.md

Guidance for Claude (or any AI assistant) working in this repository.

## Project Overview

This is **Harish Siva's personal portfolio website** — a multi-page React app with an aurora / glassmorphism visual style. It showcases the owner's background, skills, and resume.

- **Live site:** https://harishportfolio.lovestoblog.com/
- **Based on:** open-source template by [Soumyajit Behera](https://github.com/soumyajit4419/Portfolio), heavily customized.

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 17 (Create React App) |
| Routing | React Router v6 |
| UI | React Bootstrap 2 + custom CSS |
| Animation | lottie-react, typewriter-effect, react-parallax-tilt |
| PDF Viewer | react-pdf |
| Icons | react-icons |
| HTTP Client | axios |

No TypeScript, no CSS-in-JS, no state management library — keep additions consistent with this lightweight setup unless asked to introduce something new.

## Project Structure

```
Portfolio-master/
├── public/                  # Static assets, favicons, manifest, index.html
├── src/
│   ├── Assets/              # Images, SVG tech icons, Lottie JSON, resume PDF
│   ├── components/
│   │   ├── Home/            # Hero, intro, typewriter components
│   │   ├── About/           # About card, tech stack, tool stack
│   │   ├── Projects/        # Skills page (tech + tools showcase)
│   │   ├── Resume/          # PDF resume viewer
│   │   ├── helper/          # Aurora backdrop, Lottie wrapper
│   │   ├── Navbar.js        # Fixed responsive navigation
│   │   ├── Footer.js        # Footer with social links
│   │   ├── Pre.js           # Preloader
│   │   └── ScrollToTop.js   # Scroll restoration on route change
│   ├── services/            # Axios API client
│   ├── App.js               # Routes and app shell
│   ├── style.css            # Design system (aurora, glass, layout)
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

| Task | File |
|---|---|
| Hero name, tagline, social links | `src/components/Home/Home.js` |
| Typewriter roles | `src/components/Home/Type.js` |
| About text & interests | `src/components/About/AboutCard.js` |
| Tech stack icons | `src/components/About/Techstack.js` |
| Tools icons | `src/components/About/Toolstack.js` |
| Resume PDF | `src/Assets/harish_resume_new.pdf` |
| Colors & design tokens | `src/style.css` |

## Routes

| Route | Description |
|---|---|
| `/` | Hero, introduction, social connect |
| `/about` | Background, education, interests |
| `/skills` | Professional skillset and tools |
| `/resume` | Embedded resume viewer with download |

## Conventions & Constraints

- **Component style:** functional components, plain CSS (no CSS modules/Tailwind). Match existing patterns in `src/components/` rather than introducing new styling systems.
- **Accessibility:** respect `prefers-reduced-motion`; keep ARIA labels on interactive elements (nav, buttons, social links).
- **Performance:** the aurora background is GPU-friendly and fixed-position — avoid changes that force repaints on scroll.
- **Content vs. code:** personal content (name, bio, resume, skill icons) lives in the files listed above. Prefer editing content there over hardcoding elsewhere.
- **Resume:** the PDF is rendered in-browser via `react-pdf`; if replacing it, keep the filename convention or update the import in `src/components/Resume/`.
- **Routing:** all pages are registered in `App.js` via React Router v6 — new pages need a route added there and a nav link in `Navbar.js`.

## Testing & Verification

Before committing changes:
1. Run `npm start` and manually check all four routes.
2. Verify responsiveness at desktop, tablet, and mobile widths.
3. Confirm `npm run build` completes without errors/warnings introduced by the change.
