---
version: 1
name: dark-room
description: "One tinted dark ground from top to bottom, and in it, lit things. The robot's LiDAR scan is the light in the room: the 3D point-cloud hero, and each case study, appear as exhibits lit against the dark. Wide extended display type (Panchang) for the name and headings, a neutral grotesk (Switzer) for reading. One bronze accent, on the single primary action and small markers only. Square corners, no lines, no shadows."

colors:
  ground: "#101114"
  surface: "#1a1b1f"
  surface-2: "#232429"
  ink: "#ecebe8"
  ink-muted: "#9b9a97"
  bronze: "#a08672"
  bronze-ink: "#101114"
  inverse-ground: "#ecebe8"
  inverse-surface: "#e0dfdb"
  inverse-ink: "#101114"
  inverse-ink-muted: "#5c5b58"
  inverse-bronze: "#7a6250"

typography:
  display:
    fontFamily: Panchang
    fontWeight: 500
    letterSpacing: -0.02em
    lineHeight: 1.0
    textTransform: uppercase
  text:
    fontFamily: Switzer
    fontWeight: [400, 500]
    lineHeight: 1.55
  steps:
    small: "clamp(0.8125rem, 0.79rem + 0.1vw, 0.875rem)"
    body: "clamp(1.0625rem, 1rem + 0.25vw, 1.1875rem)"
    lead: "clamp(1.25rem, 1.1rem + 0.7vw, 1.625rem)"
    head: "clamp(2rem, 1.3rem + 3.2vw, 4rem)"
    display: "clamp(3rem, 0.5rem + 10vw, 12.5rem)"

spacing:
  page-margin: "clamp(1.25rem, 0.9rem + 1.5vw, 2rem)"
  section-gap: "clamp(6rem, 3.5rem + 8vw, 12rem)"
  tap-min: "2.75rem"

radius: 0
---

# Design system — the dark room

Source of truth for tokens: `src/styles/global.css`. This file explains them.

## Origin

Dealt by the taste skill (`design-taste-frontend`, direction **dark-room**, seed `229773169`, 2026-10-30) for sector personal-portfolio, tone technical. The first three dealt directions (type-only statement, quiet instrument, contact sheet) were set aside: each conflicts with the approved 3D hero or needs photographs that don't exist. Dark-surface layering was cross-checked against the Raycast and Linear references in `design-md`.

**The idea:** on this page, the robot's LiDAR scan becomes the light in the dark room. A competitor's portfolio can't say that sentence.

**The live thing:** the 3D LiDAR hero — a robot sweeping a dark warehouse made of points (phase 6; a still poster until then).

## Colour

- One ground, one ink, one accent. The page is dark by design; there is no light theme toggle. "The darkness is not a theme switch; it is a room."
- `.inverse` flips a section to the light palette — used only for the contact section and the footer, which the direction sets in inverse.
- Bronze appears on the single primary action and small markers, at most once per screen. Never as a background field, never on text runs.
- Depth comes from a step in surface tone (`ground` → `surface` → `surface-2`), never from lines, shadows or glows.

| Pair | Contrast |
|---|---|
| ink on ground | 15.8:1 |
| ink-muted on ground | 6.7:1 |
| bronze on ground / bronze-ink on bronze | 5.5:1 |
| inverse ink-muted on inverse ground | 5.7:1 |
| inverse bronze on inverse ground | 4.8:1 |

## Type

- **Panchang 500** (display, uppercase, tracking −0.02em, leading 1.0) for the name and section headings. Very wide: four words or fewer per line. The direction's "light weights glow on dark" overrides the type system's 700.
- **Switzer 400/500** for everything else. Running text at 17–19px in full ink; `ink-muted` only for secondary notes.
- Five steps only: small, body, lead, head, display. No sixth size.
- Self-hosted woff2 in `public/fonts/` (Fontshare, ITF Free Font License); the two most-used files are preloaded.

## Layout (mobile-first)

- Build at 375px first, then add `sm:` / `md:` / `lg:` — never design for desktop and shrink.
- One pair of equal page margins (`px-page`, 20px → 32px). Large things run to the edges.
- Sections are separated by `section-gap` (96px → 192px); nothing inside a section is spaced that far.
- Tap targets ≥ 44px (`min-h-tap`). Respect `env(safe-area-inset-*)`. No horizontal scroll at any width.
- Section blueprints dealt for the home page: work (full panels, one midline row) → stats (quiet figure lines) → about (portrait as drop cap) → list (line-up at one type size) → contact (the email as display type, inverse) → footer (columns above, wordmark below, inverse). Full geometry in `.taste-skill/direction-sheet.md` (local) — reprint with `node .claude/skills/design-taste-frontend/scripts/draw.mjs --show`.

## Components

- Buttons: flat, square, one fill (bronze), 44px tall minimum. One button shape on the whole site.
- Navigation: wordmark, three to five plain links, one action. No bar chrome, no blur, no pill.
- shadcn/ui (`radix-lyra` preset, radius 0) for interactive primitives; restyle through tokens, never with hardcoded values.

## Motion

- Signature move: the wordmark scales a few percent with scroll (scroll-linked, < 8% travel, static fallback).
- Every section's parts enter staggered (60–90ms), rising 16–32px with opacity, once.
- Transform and opacity only; every move has a `prefers-reduced-motion` fallback.

## House rules (from the taste skill)

No eyebrows, no monospace outside code, no 01/02/03 numbering, no thin rules or 1px boxes, no gradients (a neutral scrim under text on a photo is the one exception), no shadows at rest, no glass or blur, no icon-topped card rows, no emoji, no styled accent word in a headline, two typefaces at most, headlines two lines or fewer at every width.
