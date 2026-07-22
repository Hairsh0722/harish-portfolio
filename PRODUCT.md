# PRODUCT.md

## What This Is

A personal portfolio website for **Harish Siva**, presenting his professional identity, skills, and resume to recruiters, collaborators, and visitors in a visually distinctive way.

- **Live site:** https://harishportfolio.lovestoblog.com/
- **Owner location:** Chennai, India

## Purpose

The site exists to answer three questions quickly for anyone who lands on it:
1. Who is Harish, and what does he do?
2. What technologies and tools does he work with?
3. Can I see his resume and reach him?

## Target Audience

- Recruiters and hiring managers scanning for technical fit
- Potential collaborators or clients
- Anyone following a link from LinkedIn, GitHub, or a resume/CV

## Design Philosophy

- **Single-page flow** — one continuous scroll rather than separate routed pages; the navbar smooth-scrolls (Lenis) between sections so the whole story reads top to bottom.
- **Aurora / glassmorphism aesthetic** — a fixed, gradient-mesh backdrop with translucent "glass" cards, aiming for a modern, memorable first impression rather than a generic template look. A light/dark toggle and an accent-colour switcher let visitors tune the palette.
- **Motion with restraint** — Lottie animations, a typewriter role effect, and smooth scrolling add personality without overwhelming the content; `prefers-reduced-motion` is respected throughout for accessibility.
- **Speaks the visitor's language** — the interface is available in English, Hindi, and Tamil.
- **Frictionless resume access** — the resume is viewable in-page (no download required to preview) but still downloadable for those who want a copy.

## Core Features

| Feature | User Value |
|---|---|
| Animated hero with typewriter roles | Immediately communicates who Harish is and what he does |
| About section | Gives background, education, interests, and a live GitHub contribution calendar for a fuller picture |
| Skills & projects sections | Lets visitors quickly assess technical fit and see representative work |
| In-browser resume viewer | No download needed to review qualifications |
| Contact form + WhatsApp CTA | Low-friction ways to reach Harish directly (email via EmailJS, or real-time chat) |
| Multilingual UI (EN / HI / TA) | Reaches visitors in their preferred language |
| Light/dark + accent theming | Lets visitors read comfortably and adds a touch of personalization |
| AI assistant | Answers quick questions about Harish's skills, work, and how to get in touch |
| Responsive layout | Works equally well whether shared via mobile or desktop |
| Preloader & smooth scrolling | Polished, professional feel while moving through the page |

## Site Map

A single scrolling page; the navbar jumps between sections rather than loading separate routes.

| Section | Purpose |
|---|---|
| Home | First impression: hero, intro, social links |
| About | Background, education, interests, GitHub activity |
| Skills | Technical skillset and tools |
| Projects | Featured work showcase |
| Resume | View and download resume |
| Contact | Message form and direct contact channels |
| Connect | Social links |

## Content That's Meant to Change Over Time

This is a living personal site — the following are expected to be updated as Harish's career progresses:
- Resume PDF
- Tech/tool stack icons on the Skills section
- Project showcase entries
- About text (education, interests)
- Hero tagline and typewriter roles
- Social/contact links
- Translations for all copy (English / Hindi / Tamil kept in sync)
- AI assistant knowledge (the facts it answers with)

## Non-Goals

- Not a CMS or multi-user platform — content changes are made directly in code, not through an admin panel.
- Not a blog or project-case-study site — it's an identity/resume showcase, not a portfolio of in-depth project write-ups.
- No server backend or database — the contact form sends mail via a third-party client-side service (EmailJS); nothing is stored server-side beyond the static resume asset.
- The AI assistant is a lightweight, client-side, rule/intent-based helper over a fixed knowledge base — not a live LLM integration.
- Not intended to support e-commerce or authentication.

## Attribution

Based on an open-source portfolio template by [Soumyajit Behera](https://github.com/soumyajit4419/Portfolio), with a redesigned UI, custom aurora backdrop, and updated content.
