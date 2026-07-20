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

- **Aurora / glassmorphism aesthetic** — a fixed, gradient-mesh backdrop with translucent "glass" cards, aiming for a modern, memorable first impression rather than a generic template look.
- **Motion with restraint** — Lottie animations and a typewriter role effect add personality without overwhelming the content; `prefers-reduced-motion` is respected for accessibility.
- **Frictionless resume access** — the resume is viewable in-page (no download required to preview) but still downloadable for those who want a copy.

## Core Features

| Feature | User Value |
|---|---|
| Animated hero with typewriter roles | Immediately communicates who Harish is and what he does |
| About page | Gives background, education, and interests for a fuller picture |
| Skills page (tech + tools grid) | Lets visitors quickly assess technical fit |
| In-browser resume viewer | No download needed to review qualifications |
| Responsive layout | Works equally well whether shared via mobile or desktop |
| Preloader & smooth transitions | Polished, professional feel on navigation |

## Site Map

| Route | Purpose |
|---|---|
| `/` | First impression: hero, intro, social links |
| `/about` | Background, education, personal interests |
| `/skills` | Technical skillset and tools |
| `/resume` | View and download resume |

## Content That's Meant to Change Over Time

This is a living personal site — the following are expected to be updated as Harish's career progresses:
- Resume PDF
- Tech/tool stack icons on the Skills page
- About text (education, interests)
- Hero tagline and typewriter roles
- Social/contact links

## Non-Goals

- Not a CMS or multi-user platform — content changes are made directly in code, not through an admin panel.
- Not a blog or project-case-study site — it's an identity/resume showcase, not a portfolio of in-depth project write-ups.
- Not intended to support e-commerce, authentication, or backend data storage beyond a static resume asset.

## Attribution

Based on an open-source portfolio template by [Soumyajit Behera](https://github.com/soumyajit4419/Portfolio), with a redesigned UI, custom aurora backdrop, and updated content.
