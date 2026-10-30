# Portfolio plan

## Goal

A fast, content-first portfolio that shows a full-stack developer who builds real-time robot fleet platforms. Case studies over code dumps; one strong 3D moment that proves the robotics + 3D work.

## Stack

- Astro (static) + React 19 islands, TypeScript strict
- Tailwind v4 + shadcn/ui, MDX content collections
- 3D: three + React Three Fiber + drei, reserved for the robot-app case study
- Bun, Biome via Ultracite, lefthook + commitlint
- Deploy: Vercel or Cloudflare Pages

## Approach

- **Mobile-first:** every component is built at 375px first and scaled up; everything is responsive, the 3D hero included.
- **Positioning:** full-stack developer first; robotics is the setting.
- **Design system:** the taste skill's *dark-room* direction with light and dark themes — see `DESIGN.md`.

## Pages

- **Home** — live map hero, work (fleet app, robot app, update wizard, Gita reader), stack, results, about, contact
- **Work** — `/work/<slug>` case studies: Fleet Management System, on-robot control UI (incl. local RAG assistant), OTA software updates, robot provisioning, Bhagwat-Gita
- **Resume** — on hold

## 3D demo: LiDAR scene (robot-app case study)

A robot navigates a warehouse made of points; its scan sweeps and reveals shelves and walls; other robots move in the background. All data is procedurally generated — nothing from ANSCER.

- One `THREE.Points` buffer, updated in place in `useFrame`; no per-frame React state
- Hydrate with `client:visible`; text and layout render first so LCP never waits on WebGL
- Static poster fallback for `prefers-reduced-motion`, no WebGL, and low-power devices
- Pause when off-screen or the tab is hidden; cap device pixel ratio
- No GLTF models, Spline embeds, or scroll-jacking; 3D appears once
- Optional later: small 2D/3D toggle demo in the Robot UI case study

## Phases

1. **Scaffold** — Astro + React + Tailwind + MDX + sitemap, shadcn, Ultracite, lefthook/commitlint, git init ✅
2. **Design system** — direction dealt (dark-room), tokens in `global.css`, `DESIGN.md` ✅
3. **Base layout** — head/SEO, skip link, nav, theme toggle, footer ✅
4. **Home page** — all sections, live 2D map hero, motion, both themes ✅
5. **Case studies** — content schema, FMS first, then the rest (`/case-study <project>`); redact screenshots
6. **3D demo** — LiDAR point-cloud island inside the robot-app case study, with fallbacks and performance budget
7. **QA and launch** — `senior-frontend-reviewer`, `web-design-guidelines`, `ui-qa`, Lighthouse; deploy and custom domain

The site is shippable after phase 5; phase 6 is additive.

## Budgets

- Lighthouse ≥ 95 on all categories (mobile)
- Home JS before 3D loads: < 50 KB gzipped; 3D island: < 200 KB gzipped
- LCP < 2.0 s, CLS < 0.05 on mobile
