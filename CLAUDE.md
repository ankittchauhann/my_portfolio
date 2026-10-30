# Ankit Singh Chouhan — Portfolio

Personal portfolio site for a full-stack developer at ANSCER Robotics (real-time robot fleet platforms). Goal: a fast, content-first site that lands interviews — case studies over code dumps.

## Stack

- **Astro** (static output) with **React 19 islands** only where interactivity earns its JS
- **TypeScript** strict, **Tailwind v4**, **shadcn/ui** for interactive primitives
- **MDX** content collections for case studies (`src/content/work/`)
- **three + React Three Fiber + drei** for the homepage 3D LiDAR hero only (see `PLAN.md`)
- **Bun** as package manager and runner, **Biome via Ultracite** for lint/format
- **lefthook** + **commitlint** (conventional commits), deployed to Vercel or Cloudflare Pages

## Commands

- `bun run dev` — dev server (`http://localhost:4321`)
- `bun run build` / `bun run preview` — production build and preview
- `bun run lint` / `bun run fix` — Ultracite check / autofix
- `bun run check` — type-check `.astro` and `.ts` files (`astro check`; needs TypeScript 6)
- Node 22 (`.nvmrc`); run `nvm use` first — Astro 7 refuses Node 20

## Layout

- `src/pages/` — routes; `src/layouts/` — page shells (`base-layout.astro` sets title, description, OG, canonical)
- `src/components/` — `.astro` components (default) and `.tsx` islands (only when stateful)
- `src/components/ui/` — shadcn primitives
- `src/content/work/*.mdx` — case studies; schema in `src/content.config.ts`
- `src/styles/global.css` — Tailwind entry and design tokens (dark ground + `.inverse` sections)
- `DESIGN.md` — the design system and why; read it before any UI work
- `public/` — static assets; redacted screenshots go in `public/work/<slug>/`

## Conventions

- Default to `.astro` components. Reach for a React island only for real interactivity, and hydrate with the laziest directive that works (`client:visible` > `client:idle` > `client:load`).
- **Mobile-first, always.** Build every component at 375px first, then scale up with `sm:`/`md:`/`lg:`. Tap targets ≥ 44px (`min-h-tap`), equal page margins (`px-page`), safe-area insets, no horizontal scroll at any width.
- The site is dark by design (DESIGN.md); no theme toggle. Light sections use `.inverse`.
- Colors, type sizes, radius and spacing come from tokens in `global.css` (`bg-ground`, `text-ink`, `text-head`, `px-page`, …); no hardcoded hex or arbitrary sizes in markup.
- Follow the taste skill's house rules (listed in DESIGN.md): no eyebrows, monospace, numbering, thin rules, gradients, shadows, glass or icon card rows.
- File names are kebab-case (Ultracite rule), including `.astro` components.
- 3D stays in its island: mutate buffers in `useFrame`, never React state per frame; always ship a static poster fallback for reduced motion and no WebGL.
- Every image has meaningful `alt` text and uses `astro:assets` `<Image />` where possible.
- Every page sets a unique title and description through the base layout.
- No comments unless the WHY is non-obvious; keep it to one short line.

## Skills

Project skills live in `.claude/skills/` (provenance in `.claude/skills-sources/SOURCES.md`).

- **Design:** `design-taste-frontend` (taste-skill) for art direction and a browser look-and-fix loop on public pages; `design-md` for reference design systems when setting tokens; `web-design-guidelines` to review built UI.
- **Workflow (superpowers):** `brainstorming` before new features, `writing-plans` / `executing-plans` for multi-step work, `systematic-debugging` for bugs, `verification-before-completion` before calling anything done.

## Public repo

This repo is public. Case studies describe professional work at the architecture level only.

- Never commit employer source code, internal repo or service names, URLs, IPs, credentials, customer or site names, or unredacted screenshots and maps.
- Never commit absolute local paths. Machine-specific notes go in `CLAUDE.local.md`, permissions in `.claude/settings.local.json` (both gitignored).
