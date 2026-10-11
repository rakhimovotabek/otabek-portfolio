<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Portfolio boundaries

- Current scope is Phase 2. Do not start a later phase without the owner’s prompt.
- Edit the public nickname only in `src/data/site.ts`.
- Edit personal facts only in `src/data/portfolio.ts`; preserve unknown values as null.
- No backend, submissions, Supabase initialization, or fake success states in Phase 2. Disabled visual previews are permitted.
- Read `docs/DESIGN_SYSTEM.md` for UI changes and `docs/BACKEND_PLAN.md` before backend work.
- Keep downloaded ZIPs outside this repository unchanged.
- Preserve reduced motion, readable server HTML, keyboard access, and scoped animation teardown.
- Run typecheck, lint and production build before committing functional changes.
- Keep secrets and environment files untracked.
