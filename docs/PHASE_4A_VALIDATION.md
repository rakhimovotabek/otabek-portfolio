# Phase 4A validation

Validated locally on 2026-10-11, Linux, Node 26.11.1 / npm 12.2.0. Work continues from Phase 3 commit `12a36c58510893d6530158397663a4bffcedb933`. No portfolio layout, artwork, animation or public-form activation changed.

## Connection status

Supabase CLI 2.120.0 was already installed. No repository backend environment files, Supabase link/configuration or relevant environment variables existed at the start. No hosted project was selected, created or modified. Docker and standalone PostgreSQL tools were unavailable. The version-controlled migration was executed locally using PGlite's real PostgreSQL engine, not merely inspected as text.

## Checks run

- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed without backend environment variables. Homepage/icon remain static; six API routes compile as dynamic Node routes.
- `npm run test:backend`: **23/23 passed**, including actual PostgreSQL RLS/grants with broad default privileges revoked.
- `npm run test:turnstile`: passed against actual Cloudflare Siteverify using its published dummy pass/fail credentials. This verifies the test-mode network path, not a real production widget.
- `npm audit --omit=dev --json`: zero production vulnerabilities reported. Installation reported five high-severity development-tooling findings in the existing lint dependency chain; these were not force-upgraded in this phase.
- Production preview started at `http://127.0.0.1:3001` and served the homepage successfully.
- `BACKEND_SMOKE_UNCONFIGURED=true node scripts/check-backend-unconfigured.mjs`: **10 production HTTP checks passed**, including 503 for unconfigured valid public requests, 400 invalid input/target, 413 oversized body, and 401 on every anonymous owner method. No fake success or records were created. [API evidence](preview/phase4a/api-smoke-results.json).
- Existing Chromium motion/browser suite: **passed at 1440×1000, 1366×900, 390×844 and 360×800**. Slow/fast/reverse scrolling, desktop pinning, mobile natural flow, navigation anchors, disabled project/contact fields, dialog focus and reduced-motion restoration passed with no horizontal overflow or browser runtime errors. [Browser evidence](preview/phase4a/browser-results.json). A final four-size smoke pass after the last backend guard change also passed HTTP 200, skip-link focus, settled contact entrance, dialog focus return and reduced motion without overflow/runtime errors. [Final production evidence](preview/phase4a/production-smoke-results.json). Its output directory can now be overridden so Phase 3 evidence is preserved. [Desktop screenshot](preview/phase4a/desktop-hero.png) and [mobile screenshot](preview/phase4a/mobile-hero.png) were captured and examined; the existing visual identity is preserved.

The first browser attempt, run concurrently with the PostgreSQL suite, observed the hero before it had settled within the existing fixed 1.7-second wait and failed that position assertion. A separate rerun of the same suite passed without any animation change. The fixed entrance wait remains sensitive to a heavily loaded host; this is recorded rather than presented as an uninterrupted first-run pass. The passing browser run also observed 179 scroll-frame intervals with median/p95 16.7ms and zero sampled tasks over 50ms. Five resize/preference cycles kept 1228 DOM nodes and the expected pin count. These local headless observations are not a hardware/frame-rate guarantee or comprehensive leak proof.

Dependencies installed: Supabase JS, Zod and server-only; PGlite/tsx are development-only test tools. The current Supabase SDK requires Node 22+, now stated in package engines and README. A later package-lock-only refresh attempt was blocked by the local npm remote-tarball policy for an existing optional Tailwind WASM package. Installed dependencies and the generated dependency lock remained usable; only the root Node engine metadata was synchronized manually. This was not counted as a passing installation check.

## Database-backed coverage

Tests execute the entire migration with `anon`, `authenticated`, and BYPASSRLS `service_role` roles. Broad default table grants are modeled to ensure the migration actually revokes them. Supabase's Auth schema/functions and verified JWT claims are simulated as test fixtures. Real PostgreSQL checks cover:

- Private contact persistence, optional reply contact and unread defaults.
- Required/trimmed fields, field lengths, unexpected privileged fields, honeypot rejection, invalid/missing CAPTCHA.
- JSON media type, malformed UTF-8/JSON, declared and streamed 24 KiB caps, stalled-stream cancellation.
- Turnstile hostname/action success and mismatch, duplicate-token rejection responses and safe outage errors.
- Shared hourly/daily/global database quotas, denied attempts, expiry, purge and pseudonymous stored keys.
- Valid guestbook/project comments defaulting to pending; invalid target relationships and project foreign keys rejected.
- Anonymous approved-only retrieval, omitted private fields, HTML-safe JSON and stable equal-timestamp cursor pagination.
- Anonymous/invalid/non-owner/password-only owner endpoint rejection.
- Owner pending reads, approval/rejection and unread/read/archived inbox operations.
- RLS/grants preventing anonymous inbox access and writes, owner content editing/deletion, service-client private reads and caller-selected status.
- Production configuration fail-closed behavior, rejection of authenticated JWTs as public keys, dummy-key/test-mode rejection, trusted-IP handling/canonicalization and origin enforcement.
- SQL project IDs matching central portfolio data.
- Production Supabase DAL HTTP projections, minimal insert payloads and owner JWT scoping with mocked fetch.

These are meaningful database tests, but PGlite runs one connection. They do not claim hosted Supabase Auth, PostgREST behavior, secret-key gateway behavior, simultaneous multi-instance quota races, production proxy-header provenance or production widget correctness. Auth getUser and most CAPTCHA responses are mocked in the HTTP suite; only the separate dummy-key test uses live Siteverify.

## Remaining external verification

Follow [SUPABASE_SETUP.md](SUPABASE_SETUP.md) to create/verify a project, apply the migration, provision an allowlisted MFA owner, set private environment variables, configure a real widget and trusted hosting header, and schedule quota cleanup. Then perform the listed isolated-project live checks. In particular, verify real JWT/AAL enforcement, direct Data API column/RLS boundaries, approved-only read pagination, concurrent rate limiting and actual proxy IP behavior before activating Phase 4B forms.

No cron job, retention automation, login UI, frontend widget, working public form, admin dashboard, cookie session or deployment was created. Owner access currently requires a valid bearer MFA token. Archived messages remain stored; owner APIs intentionally do not delete records. The service key is still a highly privileged Supabase credential even though application-table grants are narrowed. Secrets must remain server-side.

## Reproduce browser and API checks

Build, then start an **unconfigured** production preview:

```bash
npm run build
npm start -- --hostname 127.0.0.1 --port 3001
```

In another terminal:

```bash
BACKEND_SMOKE_UNCONFIGURED=true node scripts/check-backend-unconfigured.mjs

PORTFOLIO_QA_OUTPUT=/tmp/otabek-phase4a-motion \
NODE_PATH=/path/to/qa/node_modules \
PLAYWRIGHT_CHROMIUM_PATH=/path/to/chrome \
node scripts/check-motion.cjs
```

Playwright/Chromium are external QA tooling, not application dependencies. `PORTFOLIO_URL` can override the local preview URL. The API smoke script deliberately guards against accidental execution on a configured/nonlocal backend. The owned preview server is stopped after verification.
