# Phase 1 validation

Verified locally on 2026-10-11 with Node.js 26.11.1 and npm 12.2.0.

| Check | Result |
| --- | --- |
| Dependency installation | Passed; npm lockfile committed |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed |
| `npm run build` | Passed; homepage, not-found and icon prerendered |
| Development server | Started successfully on 127.0.0.1:3000; initial page returned HTTP 200 |
| Production server | Started successfully on 127.0.0.1:3000; HTTP 200 |
| Desktop Chromium 1440 × 1000 | Passed |
| Mobile Chromium 390 × 844 | Passed |
| Horizontal overflow | None at the two tested viewports |
| Browser runtime exceptions | None during the final browser checks |
| Mobile navigation | Opens; anchor navigation closes the menu |
| Contact placeholder | Opens, states unavailable, has no form/input fields |
| Escape and focus return | Passed on desktop and mobile |
| Reduced motion | Hero readable, orbital transform absent, scrolling automatic |
| JavaScript disabled | Hero visible; native mobile disclosure opens |
| `npm audit --omit=dev` | Zero production vulnerabilities |
| Full `npm audit` | Five high-severity findings in one development lint dependency chain |
| Environment exclusions | `.env`, `.env.local`, `.env.production`, node_modules and .next ignored |

Screenshots: [desktop](preview/desktop.png), [mobile](preview/mobile.png). They were captured from the successful production build. Automated browser checks ran with Playwright installed in a temporary directory outside the project, using an existing local Chromium binary; no browser-test dependency was added to the application.

The full audit reports `braces` through micromatch → fast-glob → @next/eslint-plugin-next → eslint-config-next. The installed/latest braces version is 3.0.3; a proposed patched 3.0.4 was not available in the registry. npm suggests downgrading eslint-config-next across major versions, which is unsuitable for this Next.js version. This remains a development-tool limitation and must be reviewed when a compatible patch becomes available. Production dependencies are unaffected by this reported chain.

Scope limits: no backend, submission security, full accessibility audit, physical-device tests, Firefox/WebKit validation, or deployment verification. Supabase/RLS/Turnstile requirements are plans only in BACKEND_PLAN.md. No real message/comment submission was claimed or tested.
