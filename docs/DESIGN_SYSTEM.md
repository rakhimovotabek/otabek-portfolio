# Design system — Phase 2

## Direction

A working archive, with a visual language drawn from exhibition posters, folded paper, and editorial field notes. The public nickname is `site.brand` in `src/data/site.ts`; it is the only editable nickname value. Otabek Rakhimov remains the person in the biography and copyright. No business success, metrics, launch statuses, or social links are invented.

## Typography and color

Syne is the distinctive display family, DM Sans the reading family, and system Georgia italic supplies editorial emphasis. Variable font files are self-hosted through next/font/local with swap behavior and fallback metrics. No browser request to a font provider is needed. Font files and original SIL Open Font License 1.1 notices live in `src/app/fonts/`; see FONTS.md for provenance. No font package or runtime dependency was added.

`src/app/globals.css` owns tokens. Charcoal #151619, graphite #202226, midnight #1e2535, warm paper #f2efe7 and bone #e7e3d9 form the surfaces. Muted cyan #b7d5d2 is reserved for correspondence/download art; electric blue #3256db anchors SAT’chi and debate; lime #d8ef9f connects the hero frame and problem-solving; warm orange #bd643e belongs to the financial project/hackathons. Burgundy #692b3d is local to the examination artwork. Secondary text has separate dark/light tokens.

There are no glowing backgrounds, glass cards, gradient heroes, or pill systems. Hairlines, square edges, strong type, and deliberately unequal layouts supply the hierarchy. Desktop display scales are constrained to the actual wide font glyphs; mobile uses separate compositions at 700px, with tablet adjustments at 1000px. Shared gutters and fluid section spacing retain alignment.

## Journey and geometry

- Hero: a large, legible nickname, left-aligned personal context, and an original folded architectural frame. The frame is a visual metaphor for room to learn, not a product icon.
- About: calm paper, asymmetric portrait-reserved typographic specimen, substantial biography, and interests as a reading line rather than badges.
- Vault: charcoal exhibition, enormous section heading, lead SAT’chi presentation, and four offset projects. Education gets a blue typography poster; examinations a burgundy balance study; finance architectural steps; the downloader layered sheets; IELTS repeated arches. Every image is visibly labelled original concept art, not a screenshot.
- Side Quests: a magazine collage with unequal spans, distinct typography and sparing original geometry. Layout collapses into purposeful staggered mobile blocks, including a narrow two-column pair.
- Achievements: quiet bone paper, truthful ranks/band score, and supporting milestones. Numbers are records, not counters. No inferred dates or chronological timeline.
- Guestbook: an unwritten page beside an inert, labelled preview sheet. No fake visitors or comments.
- Contact: midnight surface and the opening frame motif repeated in muted cyan. Large closing brand, private-message preview in a native dialog, and an always-available square floating trigger. At phone widths it becomes a compact icon with an explicit accessible name to reduce overlap with reading areas.

Stepped paper/charcoal boundary tabs establish section handoffs. Each section has its own isolation context; project IDs, articles, artwork containers with explicit aspect ratios, and separate text/figure blocks are stable targets for Phase 3. Existing hash anchors remain valid. There are no pins, forced scroll positions, or complex GSAP sequences.

## Interaction and accessibility

The server renders readable finished content. The scoped GSAP wrapper adds a small introduction and 20px hero-art scroll shift. Teardown and live reduced-motion changes are preserved. Motion for React is limited to button interaction. Native mobile disclosure works without JavaScript; the native modal requires JavaScript, restores trigger focus on Escape, and makes background content inert. Headings, labels, landmarks, comment targets, focus rings and skip link remain semantic.

FormPreview is presentation only: disabled fieldsets, visible unavailability notices, labelled fields and disabled “opens later” controls. It never issues a request or stores values. All comment targets discriminate between stable project IDs and the separate guestbook. The contact preview is private-inbox presentation only; Phase 4 owns validation, permissions and persistence.

## Extension rules

Replace conceptual artwork only with verified screenshots, updating captions. Confirm stacks/status/URLs before editing unknown values. Add a genuine portrait later. Never ship visitor forms until the backend requirements and security checks are satisfied. Phase 3 motion must preserve the final no-JavaScript/reduced-motion compositions and avoid layout shifts. Keep SVG graphics and content server-rendered, and add client boundaries only for actual interaction.

## Build pipeline

Tailwind uses the documented `@tailwindcss/postcss` integration in `postcss.config.mjs`. The starter’s custom Turbopack CSS loader was replaced after production rebuilds reused stale stylesheet output. The application still uses Next.js/Turbopack; no runtime animation or UI dependency was added.
