# TDD — Single-Page Scroll Layout

**Architect:** Winston · **Tier:** High · **Source:** [PRD](../prd/single-page-scroll.md)

## Approach
Keep the Router (for deep-links) but render **all sections stacked** on every route.
Nav + hero buttons scroll to sections via a shared helper; active link tracked with a
native `IntersectionObserver` (scrollspy). No routing-per-page anymore.

## Files touched
| File | Change |
|---|---|
| `src/App.js` | Render one stacked page: `Home, About, Projects(#skills), ProjectShowcase(#projects), Resume, Contact` in a `<main>`. All routes → same page. |
| `src/components/helper/scrollToSection.js` **(new)** | Plain-JS util: `scrollToSection(id)`; reduced-motion → `behavior:'auto'`, else `'smooth'`; `home`→top. |
| `src/components/ScrollToTop.js` | Repurpose → deep-link scroll: map `pathname`→section id on change (`/`→top), scroll once after mount. |
| `src/components/Navbar.js` | `NavLink to=` → `Nav.Link as="button"` calling `scrollToSection(id)`. Local `activeId` state from `IntersectionObserver`; `active={activeId===id}`. Brand → top. Mobile: still `close()` on tap. |
| `src/components/Home/Home.js` | Hero "View Resume"/"Get in touch" `<Link>` → buttons calling `scrollToSection('resume'|'contact')`; drop unused `Link` import. |
| `src/components/Resume/ResumeNew.js` | `useRef`+`IntersectionObserver` (`rootMargin` preloads early) → render `<Document>` only once `inView`; placeholder before. |
| `src/style.css` | Add `scroll-margin-top: var(--nav-h)` to section targets so headings clear the fixed navbar (AC#6). |

## State / props
No new props. Local `useState`/`useRef` only — `activeId` (Navbar), `inView` (Resume). No store.

## Styling
Plain CSS. Reuses existing `.nav-aurora .nav-link.active` (dot indicator) — Bootstrap's
`active` prop adds that class + `aria-current`. No new visual system.

## A11y
- `active` link carries `aria-current`. Nav items keep icon+text.
- Smooth scroll gated on `prefers-reduced-motion` in the helper (AC#8) — instant jump.

## Performance
- Aurora stays fixed-position & untouched → no new repaint-on-scroll.
- `IntersectionObserver` (no scroll-handler thrash) for both scrollspy and resume defer.
- Resume PDF not fetched/rendered until near viewport → light initial load (AC#4).

## Stack integrity (self-review gate)
No TypeScript, no state library, no CSS-in-JS. One new plain-JS helper. Native
`IntersectionObserver` only — **no new dependency**.
