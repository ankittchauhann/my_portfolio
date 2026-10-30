# Portfolio plan

## Goal

A fast, content-first portfolio that shows a full-stack developer who builds real-time robot fleet platforms. Case studies over code dumps; one strong 3D moment that proves the robotics + 3D work.

## Stack

- Astro (static) + React 19 islands, TypeScript strict
- Tailwind v4 + shadcn/ui, MDX content collections
- 3D: three + React Three Fiber + drei, homepage hero island only
- Bun, Biome via Ultracite, lefthook + commitlint
- Deploy: Vercel or Cloudflare Pages

## Pages

- **Home** — 3D LiDAR hero, one-line pitch, featured work, experience timeline, skills, contact
- **Work** — `/work/<slug>` case studies: Fleet Management System, on-robot control UI (incl. local RAG assistant), OTA software updates, robot provisioning, Bhagwat-Gita
- **Resume** — downloadable PDF

## 3D hero: LiDAR scene

A robot navigates a warehouse made of points; its scan sweeps and reveals shelves and walls; other robots move in the background. All data is procedurally generated — nothing from ANSCER.

- One `THREE.Points` buffer, updated in place in `useFrame`; no per-frame React state
- Hydrate with `client:visible`; text and layout render first so LCP never waits on WebGL
- Static poster fallback for `prefers-reduced-motion`, no WebGL, and low-power devices
- Pause when off-screen or the tab is hidden; cap device pixel ratio
- No GLTF models, Spline embeds, or scroll-jacking; 3D appears once
- Optional later: small 2D/3D toggle demo in the Robot UI case study

## Phases

1. **Scaffold** — Astro + React + Tailwind + MDX + sitemap, shadcn, Ultracite, lefthook/commitlint, git init
2. **Design system** — pick a direction (`design-taste-frontend`, `design-md`), write tokens to `global.css` (light + dark) and `DESIGN.md`
3. **Base layout** — head/SEO component, nav, footer, theme toggle, skip link
4. **Static home** — hero with poster image in place of 3D, featured work, timeline, skills, contact
5. **Case studies** — content schema, FMS first, then the rest (`/case-study <project>`); redact screenshots
6. **3D hero** — LiDAR scene island replacing the poster, with fallbacks and performance budget
7. **QA and launch** — `senior-frontend-reviewer`, `web-design-guidelines`, `ui-qa`, Lighthouse; deploy and custom domain

The site is shippable after phase 5; phase 6 is additive.

## Budgets

- Lighthouse ≥ 95 on all categories (mobile)
- Home JS before 3D loads: < 50 KB gzipped; 3D island: < 200 KB gzipped
- LCP < 2.0 s, CLS < 0.05 on mobile
