---
version: 2
name: dark-room
description: "A calm, type-led portfolio for a full-stack developer. One flat ground per theme, wide extended display type (Panchang) for the name and headings, a neutral grotesk (Switzer) for reading, one bronze accent. Work is shown as real interface fragments built in HTML, never photographs. A live real-time map in the hero demonstrates front-end and real-time skill. Square corners, no lines, no shadows. Light and dark themes."

colors:
  dark:
    ground: "#101114"
    surface: "#1a1b1f"
    surface-2: "#232429"
    ink: "#ecebe8"
    ink-muted: "#9b9a97"
    bronze: "#a08672"
    bronze-ink: "#101114"
  light:
    ground: "#f1f0ec"
    surface: "#e5e4df"
    surface-2: "#d9d8d2"
    ink: "#101114"
    ink-muted: "#5a5955"
    bronze: "#7a6250"
    bronze-ink: "#f1f0ec"

typography:
  display:
    fontFamily: Panchang
    fontWeight: 500
    letterSpacing: -0.02em
    lineHeight: 0.9
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
    display: "fitted: (100vw - 2 × margin) / 7.8 on phones (two lines), / 12.3 from 1024px (one line)"

spacing:
  page-margin: "clamp(1.25rem, 0.9rem + 1.5vw, 2rem)"
  section-gap: "clamp(3.5rem, 2.25rem + 4vw, 6.5rem)"
  tap-min: "2.75rem"

radius: 0
---

# Design system

Source of truth for tokens: `src/styles/global.css`. This file explains them.

## Positioning

A **full-stack developer** who currently works at a robotics company. Every headline names the craft first: real-time web apps, React to Node to MongoDB, and the pipelines that ship them. Robotics is the setting, not the identity.

## Origin

Direction **dark-room** from the taste skill (`design-taste-frontend`, seed `229773169`, 2026-10-30), adapted:

- Two themes instead of one dark room.
- No photographs. The direction expected low-key photos; the owner ruled out company images, so every picture is an interface fragment built in HTML (`src/components/fragments/`, marked `data-ui`).
- About redrawn to "side facts, wide paragraph" because there is no portrait.

Award-site research (Awwwards 2025–26 portfolio winners, the skill's 247-site study) informed what *not* to copy: monospace labels, pill navigation and hairline grids are current costume.

## Themes

- `[data-theme="light" | "dark"]` on `<html>` picks the palette. An inline script in `base-layout.astro` sets it before first paint from, in order: `?theme=` in the URL (not saved; for sharing and QA), the saved choice in `localStorage`, then the system preference.
- The toggle (`theme-toggle.astro`) saves the choice and fires a `themechange` event; the hero map listens and repaints.
- `.inverse` flips a section to the *other* palette. Contact and footer use it, so the page always ends on the opposite ground.
- Without JavaScript the system preference applies through `prefers-color-scheme`.

| Pair | Dark | Light |
| --- | --- | --- |
| ink on ground | 15.8:1 | 16.6:1 |
| ink-muted on ground | 6.7:1 | 6.2:1 |
| bronze on ground | 5.5:1 | 5.0:1 |

## Colour

- One ground, one ink, one accent per theme. Bronze appears on the primary action, the robot on the map, a few markers inside fragments, and the stack group labels.
- Depth comes from a step in surface tone (`ground` → `surface` → `surface-2`), never from lines, shadows or glows.

## Type

- **Panchang 500**: the name and section headings, uppercase, tracking −0.02em. Very wide, so headings stay one to three words.
- **Switzer 400/500**: everything else. Running text at 17–19px in full ink; `ink-muted` only for labels and secondary notes.
- Five steps: small, body, lead, head, display. The display step is fitted to the viewport so the name runs margin to margin.
- Self-hosted woff2 in `public/fonts/` (Fontshare, ITF Free Font License).

## Layout (mobile-first)

- Built at 375px first; `sm:` / `md:` / `lg:` add layout upward.
- One pair of page margins (`px-page`, 20px → 32px). Sections separated by `py-section`.
- Tap targets ≥ 44px (`min-h-tap`, `size-tap`). Safe-area insets respected. No horizontal scroll at any width.

## Page

1. **Hero:** live map (left 47% on desktop, top half on phones), the name fitted to the full width along the bottom, one line on what the work is, **Email me**.
2. **Work:** four projects. Desktop: text left (years, title, fact, summary, what was built on front end, back end and beyond), interface fragment right on a surface stage. Phone: fragment above text.
3. **Stack:** one-size line-up, grouped Front end / Back end / Real time / Delivery: tool, what it does in the work, where it runs.
4. **Results:** five figures, engineering wins first.
5. **About:** heading and facts in a left column, paragraph from 34% of the width; roles and study below.
6. **Contact** (inverse): email set as display type fitted to the width, phone, city, GitHub, LinkedIn.
7. **Footer** (inverse): link columns, the name full width, copyright.

## The live map

`src/scripts/lidar-map.ts`: a simulated robot drives a procedurally generated warehouse and builds its map from LiDAR rays. Tap or press Enter to send it somewhere. It's about 5 KB, paused off-screen and in hidden tabs, capped at 2× pixel ratio, and drawn as one static frame under reduced motion. The 3D version is planned for the robot-app case study, not the hero.

## Motion

- **Signature:** the name settles to 94% as the first screen scrolls away; the footer name grows back to full size as it arrives. CSS scroll-driven animations, only where supported.
- **Entrances:** blocks marked `data-reveal` rise 24px and fade in, 75ms apart, once. Content is hidden only after the reveal script has started, never under reduced motion, and everything is shown at the bottom of the page.
- **Feedback:** colour and press transitions on every link and button.
- Transform and opacity only; `prefers-reduced-motion` removes travel.

## House rules (from the taste skill)

No eyebrows, no monospace outside code, no 01/02/03 numbering, no thin rules or 1px boxes on the page (fragments keep their own), no gradients, no shadows at rest, no glass or blur, no icon-topped card rows, no emoji, no styled accent word in a headline, two typefaces at most, headlines two lines or fewer at every width.
