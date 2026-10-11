<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Portfolio boundaries

- Current scope is multi-page organization. Preserve the reference hero, existing backend and MFA. No CMS, migrations, two-way chat or deployment.
- Edit the public nickname only in `src/data/site.ts`.
- Edit personal facts in `src/data/portfolio.ts`; archive/media/writing content lives in `src/data/archive.ts`. Preserve unknown values as null and label sample work.
- Build from the owner’s `otabek_reference_hero_demo.html` and motion video. Saved Strade material is reference-only and must not be redistributed. Preserve messaging, canonical comment targets, MFA and database security. Never return fake submission success.
- Read `docs/DESIGN_SYSTEM.md` for UI changes and `docs/BACKEND_PLAN.md` before backend work.
- Keep downloaded ZIPs outside this repository unchanged.
- Preserve reduced motion, readable server HTML, keyboard access, and scoped animation teardown.
- Run typecheck, lint and production build before committing functional changes.
- Keep secrets and environment files untracked.
