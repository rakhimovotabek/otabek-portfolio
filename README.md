# default — Otabek Rakhimov’s portfolio

Phase 2 of a six-phase personal portfolio: an original editorial working archive, five-project Vault, Side Quests collage, biography, milestones, guestbook/contact previews, and foundational motion. No backend, data collection, or working submission forms exist.

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
- [Font sources and licenses](docs/FONTS.md)

Keep content readable without animation. Reduced-motion preferences disable hero animation, subtle art movement, smooth scrolling, and button transforms. The mobile navigation works without JavaScript. The contact panel needs JavaScript and clearly says messaging is unavailable.

No private personal information or unverified social accounts are included. Never commit environment files or credentials. Downloaded reference ZIPs remain outside this repository and are unchanged.
