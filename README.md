# Ankit Singh Chouhan — portfolio

Personal site of a full-stack developer who builds the real-time software behind robot fleets: fleet management, on-robot control and 3D views.

## Stack

Astro (static) with React 19 islands · TypeScript · Tailwind v4 · shadcn/ui · MDX · React Three Fiber for the 3D hero · Bun · Biome via Ultracite

## Run it

Requires Node 22 and Bun.

```bash
nvm use
bun install
bun run dev
```

| Command | What it does |
|---|---|
| `bun run dev` | Dev server at `localhost:4321` |
| `bun run build` | Static build to `dist/` (set `SITE_URL` to emit the sitemap and canonical URLs) |
| `bun run preview` | Serve the build |
| `bun run check` | Type-check |
| `bun run lint` / `bun run fix` | Lint and format |

Commits follow [Conventional Commits](https://www.conventionalcommits.org), checked by commitlint in a lefthook hook.

## Design

The design system and the reasoning behind it are in [`DESIGN.md`](DESIGN.md); the build plan is in [`PLAN.md`](PLAN.md).

## License

Code is MIT. Written content, case studies and images are © Ankit Singh Chouhan, all rights reserved. See [`LICENSE`](LICENSE).
