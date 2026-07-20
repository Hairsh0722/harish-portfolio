# BRD — Single-Page Scroll Layout

**Analyst:** Mary · **Tier:** High (restructures `App.js` routing + Navbar)

## The change
Convert the site from 6 separate routes into **one continuously-scrolling page**. All
sections stack top-to-bottom in nav order (Home → About → Skills → Projects → Resume
→ Contact). Nav links smooth-scroll to a section instead of navigating a route; the
active link highlights based on scroll position.

## Why (which site purpose it serves)
- **Identity + tech fit + resume/contact** all at once — a recruiter skims the whole
  story in one scroll, no clicks, no page reloads. Fewer drop-off points.

## Decisions locked in discovery
1. **Scroll style:** natural smooth scroll (not full-screen snap) — handles the tall
   resume PDF and mobile cleanly.
2. **Resume:** stays an inline section but its PDF **lazy-renders** when scrolled into
   view — keeps initial load fast.

## Fit with philosophy
- Aurora backdrop is already fixed-position, so one long page reuses it unchanged — no
  new repaint risk. ✅ No Non-Goals touched (no CMS/auth/backend).

## Out of scope
- No new content, no visual redesign of any section, no new dependencies.
- Deep-link / SEO behaviour of old routes: to be decided in design (Winston).

## Open question for design
- Should the old routes (`/about`, `/resume`, …) still work as deep-links that scroll
  to the right section, or be dropped entirely?
