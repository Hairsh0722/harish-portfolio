# PRD — Single-Page Scroll Layout

**PM:** Patty · **Tier:** High · **Source:** [BRD](../brd/single-page-scroll.md)

## Audience value
A recruiter or hiring manager lands once and skims Harish's entire story — who he is,
what he works with, his projects, resume, and how to reach him — in a single uninterrupted
scroll. No route changes, no reloads, no navigation dead-ends.

## Acceptance criteria
Tied to the three site purposes: **(I)** identity · **(T)** tech fit · **(R)** resume/contact.

1. **(I/T/R)** All six sections render on `/` in order: Home, About, Skills, Projects,
   Resume, Contact — each keeps its existing look and content, unchanged.
2. **(I)** Clicking a nav link smooth-scrolls to that section rather than loading a new page.
3. **(I)** The nav link for the section currently in view is visually marked active as the
   user scrolls (scrollspy).
4. **(R)** The Resume PDF does **not** load on initial page load; it renders only when the
   Resume section is scrolled near the viewport.
5. **(R)** Hero buttons "View Resume" and "Get in touch" scroll to their sections (no route nav).
6. **(I)** Fixed navbar stays clear of section content — no heading hidden behind the bar
   when scrolled to (scroll-margin offset).
7. Refreshing mid-page and mobile menu tap-then-scroll both work; menu closes after tapping.
8. `prefers-reduced-motion`: smooth-scroll falls back to instant jump.

## Decided here
- **Old routes:** kept as deep-links — visiting `/about` etc. loads the page and auto-scrolls
  to that section (preserves any existing shared links / hero buttons). Unknown paths → `/`.

## Out of scope
No content edits, no restyle, no new dependencies, no analytics/funnels.
