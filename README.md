# default — Otabek Rakhimov’s portfolio

Phase 5 of a six-phase personal portfolio: an editorial archive of a person, selected software, words and images. The revised opening and portrait spread lead into The Vault, a browsable collection, a reading room and a visual notebook. Original site studies and unpublished personal works are clearly distinguished.

Private messaging, moderated project comments, the guestbook and the MFA owner dashboard remain connected to the existing protected backend. No database/security model was redesigned. Connection requirements and previous hosted checks are recorded in [Supabase setup](docs/SUPABASE_SETUP.md) and [Phase 4B validation](docs/PHASE_4B_VALIDATION.md); production Turnstile/proxy configuration and owner acceptance must not be inferred from mock tests. See [Phase 5 validation](docs/PHASE_5_VALIDATION.md) for current checks.

## Run locally

Requires Node.js 22+ and npm (tested with Node 26.11.1).

```bash
npm ci
npm run dev -- --hostname 127.0.0.1 --port 3001
```

Open http://localhost:3001. This matches `.env.example`’s `SITE_ORIGIN`; restart after changing private environment values. Owner access is at `/admin/login`. Configure the backend using [Supabase setup](docs/SUPABASE_SETUP.md). Production preview: `npm run build` then `npm start -- --port 3001`; production submissions/auth require their HTTPS configuration. No deployment is included.

```bash
npm run typecheck
npm run lint
npm run test:backend
npm run build
```

## Source map

- `src/app/`: App Router layout, homepage, global design tokens.
- `src/data/site.ts`: change the public nickname once here to update navigation, hero, biography, footer and metadata.
- `src/data/portfolio.ts`: editable profile, five projects, eight achievement/experience entries. `null` means unverified; do not invent details.
- `src/data/archive.ts`: typed portraits, archive entries, writing and visual studies. See [content editing](docs/ARCHIVE_CONTENT.md).
- `src/components/archive/`: image frames and the accessible filter/disclosure index.
- `src/components/sections/`: opening, personal presence, Vault, archive, reading room, visual notebook, parallel interests, milestones and guestbook.
- `src/components/layout/`: responsive navigation and footer.
- `src/components/visuals/`: original geometric site studies and conceptual project artwork.
- `src/components/community/`: shared validated visitor forms, approved-comment lists, and Turnstile lifecycle.
- `src/components/ui/`: reusable section shell.
- `src/components/motion/`: scoped GSAP/ScrollTrigger lifecycle.
- `src/components/contact/`: accessible native contact modal with private submission and preserved drafts.
- `src/types/community.ts`: contact/comment domain contracts, with separate guestbook/project targets.
- `src/components/admin/`: owner sign-in, protected TOTP enrollment/verification, inbox and moderation dashboard.
- `src/lib/auth/`: HttpOnly session cookies, server-only Auth gateway and cookie/Bearer API bridge.
- `src/lib/backend/`: server-only authorization, protection, schemas, typed data access and route handlers.
- `src/app/api/`: anonymous submissions, approved comments and MFA owner endpoints.
- `supabase/`: reviewed SQL migration and optional local-stack configuration.
- `tests/backend/`: database-backed HTTP/RLS/grants tests using embedded PostgreSQL.

## Documentation

- [Phase 5 verification](docs/PHASE_5_VALIDATION.md)
- [Editing photographs and personal works](docs/ARCHIVE_CONTENT.md)
- [Design system](docs/DESIGN_SYSTEM.md)
- [Archive inspection](docs/REFERENCE_AUDIT.md)
- [Backend setup and deployment requirements](docs/SUPABASE_SETUP.md)
- [Backend API contracts](docs/BACKEND_API.md)
- [Phase 4B verification](docs/PHASE_4B_VALIDATION.md)
- [Phase 4A verification](docs/PHASE_4A_VALIDATION.md)
- [Original backend proposal](docs/BACKEND_PLAN.md)
- [Phase 1 verification](docs/VALIDATION.md)
- [Phase 2 verification](docs/PHASE_2_VALIDATION.md)
- [Motion architecture](docs/MOTION_ARCHITECTURE.md)
- [Phase 3 verification](docs/PHASE_3_VALIDATION.md)
- [Font sources and licenses](docs/FONTS.md)

Keep content readable without animation. Reduced-motion preferences restore the original exhibition and disable pinning, parallax, smooth scrolling and button transforms. Mobile uses natural scrolling. The desktop Vault provides chapter links and a “Read as list” escape; opening project notes also restores the reading layout. Mobile navigation works without JavaScript. Visitor forms need JavaScript and display accurate availability/errors. No JavaScript animation is required to read the portfolio.

No private personal information or unverified social accounts are included. Never commit secret environment files or credentials; `.env.example` contains setup placeholders only. Downloaded reference ZIPs remain outside this repository and are unchanged.
