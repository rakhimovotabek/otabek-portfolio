# default — Otabek Rakhimov’s portfolio

Phase 3 of a six-phase personal portfolio: an editorial working archive with a cinematic hero, layered desktop Vault, responsive scroll choreography, Side Quests interactions, biography, milestones and disabled guestbook/contact previews. No backend, data collection, or working submission forms exist.

## Run locally

Requires Node.js 20.9+ and npm (tested with Node 26.11.1).

```bash
npm ci
npm run dev
```

Open http://localhost:3000. Production: `npm run build` then `npm start`.

```bash
npm run typecheck
npm run lint
npm run build
```

## Source map

- `src/app/`: App Router layout, homepage, global design tokens.
- `src/data/site.ts`: change the public nickname once here to update navigation, hero, biography, footer and metadata.
- `src/data/portfolio.ts`: editable profile, five projects, eight achievement/experience entries. `null` means unverified; do not invent details.
- `src/components/sections/`: hero, editorial biography, Vault exhibition, Side Quests, achievements and guestbook.
- `src/components/layout/`: responsive navigation and footer.
- `src/components/visuals/`: original fold motif and five conceptual project artworks.
- `src/components/community/`: disabled shared field previews with explicit project/guestbook targets.
- `src/components/ui/`: reusable section shell.
- `src/components/motion/`: scoped GSAP/ScrollTrigger lifecycle.
- `src/components/contact/`: native modal with disabled private-message preview; no submission handler.
- `src/types/community.ts`: future contact/comment domain contracts, with separate guestbook/project targets.

## Documentation

- [Design system](docs/DESIGN_SYSTEM.md)
- [Archive inspection](docs/REFERENCE_AUDIT.md)
- [Future backend and deployment](docs/BACKEND_PLAN.md)
- [Phase 1 verification](docs/VALIDATION.md)
- [Phase 2 verification](docs/PHASE_2_VALIDATION.md)
- [Motion architecture](docs/MOTION_ARCHITECTURE.md)
- [Phase 3 verification](docs/PHASE_3_VALIDATION.md)
- [Font sources and licenses](docs/FONTS.md)

Keep content readable without animation. Reduced-motion preferences restore the original exhibition and disable pinning, parallax, smooth scrolling and button transforms. Mobile uses natural scrolling. The desktop Vault provides chapter links and a “Read as list” escape; opening project notes also restores the reading layout. Mobile navigation works without JavaScript. The contact panel needs JavaScript and clearly says messaging is unavailable.

No private personal information or unverified social accounts are included. Never commit environment files or credentials. Downloaded reference ZIPs remain outside this repository and are unchanged.
