# Otabek Rakhimov — Portfolio

Phase 1 of a six-phase personal portfolio. Original typography, orbital SVG art, and foundational motion. No backend, data collection, project case studies, or working submission forms exist yet.

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
- `src/data/portfolio.ts`: editable profile, five projects, eight achievement/experience entries. `null` means unverified; do not invent details.
- `src/components/sections/`: hero, editorial introduction, initial project index.
- `src/components/layout/`: responsive navigation and footer.
- `src/components/ui/`: reusable section shell.
- `src/components/motion/`: scoped GSAP/ScrollTrigger lifecycle.
- `src/components/contact/`: native modal placeholder; no submission form.
- `src/types/community.ts`: future contact/comment domain contracts, with separate guestbook/project targets.

## Documentation

- [Design system](docs/DESIGN_SYSTEM.md)
- [Archive inspection](docs/REFERENCE_AUDIT.md)
- [Future backend and deployment](docs/BACKEND_PLAN.md)
- [Phase 1 verification](docs/VALIDATION.md)

Keep content readable without animation. Reduced-motion preferences disable hero animation, parallax, smooth scrolling, and button transforms. The mobile navigation works without JavaScript. The contact panel needs JavaScript and clearly says messaging is unavailable.

No private personal information or unverified social accounts are included. Never commit environment files or credentials. Downloaded reference ZIPs remain outside this repository and are unchanged.
