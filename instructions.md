# Comprehensive Architecture & Implementation Specification: Static Portfolio with Firebase & GitHub Actions

## 1. Project Overview & Execution Directives
You are acting as a Principal Full-Stack Cloud Architect and UI/UX Engineer. Your objective is to scaffold, configure, and implement an entire multi-page static portfolio site from scratch using Astro, Tailwind CSS, Firebase Firestore (Build-Time Admin SDK), and GitHub Actions for continuous deployment to GitHub Pages.

### Strict Engineering Constraints:
- Output 100% complete, fully implemented files. Never use placeholders like `// TODO`, `// implement here`, or omit imports.
- Static Site Generation (SSG) only. Zero server-side runtime during client execution.
- Content (profile, experiences, and projects) is pulled at build time from Google Firebase Firestore via the Firebase Admin SDK.
- Aesthetic: High-density, professional developer UI. Deep charcoal/zinc background (`#09090b`), faint slate/zinc borders (`#27272a`), emerald accents (`#10b981`), sans-serif body typography, and monospace accents (`JetBrains Mono` / code tags) for metrics, tags, and data.

---

## 2. Directory Structure to Implement

Ensure every file listed below is generated:

```text
.
├── .github/
│   └── workflows/
│       ├── sync-repos.yml
│       └── deploy.yml
├── public/
│   ├── favicon.svg
│   └── resume.pdf
├── scripts/
│   ├── seed-firebase.mjs
│   └── sync-github.mjs
├── src/
│   ├── components/
│   │   ├── ExperienceTimeline.astro
│   │   ├── Footer.astro
│   │   ├── Hero.astro
│   │   ├── Navbar.astro
│   │   ├── ProjectCard.astro
│   │   └── SkillsMatrix.astro
│   ├── layouts/
│   │   └── Layout.astro
│   ├── lib/
│   │   ├── firebase.ts
│   │   └── markdown.ts
│   ├── pages/
│   │   ├── 404.astro
│   │   ├── index.astro
│   │   └── projects/
│   │       ├── [slug].astro
│   │       └── index.astro
│   └── types/
│       └── index.ts
├── .env.example
├── astro.config.mjs
├── package.json
├── tailwind.config.cjs
└── tsconfig.json