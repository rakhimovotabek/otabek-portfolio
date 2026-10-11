# Phase 4B validation

Implementation verified on 2026-10-11, Linux / Node 26.11.1. Baseline: `0fee8e655a111befd407a997c5044015e2e06148`. No public sections, conceptual project artwork or GSAP timelines were redesigned. No deployment or Phase 5 work was performed.

## External connection status

Supplied Supabase URL and keys were written only to ignored `.env.local`, with mode 0600. The owner subsequently applied both migrations in the intended project's SQL Editor and reported creating/allowlisting the owner. Hosted public comment reads now return HTTP 200. Anonymous inbox reads, direct writes, moderation-column reads and the pre-MFA identity RPC are denied; service credentials also cannot select inbox/comments through the Data API. The CLI account listed two unrelated projects, which were left untouched.

The local development preview is connected to hosted storage using published Cloudflare dummy credentials with explicit test mode. Actual Next submission routes and real Siteverify produced HTTP 201 for one labeled private contact, one guestbook comment and one SAT’chi comment. Both comments returned pending acknowledgements and remained absent from public retrieval. Empty/oversized fields, honeypots, missing CAPTCHA and client-supplied moderation status were rejected. Six concurrent calls to the hosted quota RPC using a separate random test subject allowed exactly five and denied one, without consuming the visitor's local-IP bucket. [Hosted evidence](preview/phase4b/hosted-backend-results.json).

Owner password/TOTP and moderation acceptance are pending. The user reported disabling signups, but a fresh Auth settings read still returned `disable_signup=false`; rechecking/saving the setting was requested. A production Turnstile widget remains unconfigured. Credentials are never part of this report or screenshots. Rotate the secret key shared in chat and replace it privately in `.env.local`. [Exact setup guide](SUPABASE_SETUP.md).

## Implemented behavior

- Contact: native modal with explicit keyboard focus cycling, Escape/backdrop/close dismissal, focus restoration, background scroll isolation, preserved drafts and labels separated from character hints. Shared Zod validation, honeypot, widget tokens, busy lock and server-only persistence. Success requires both HTTP 201 and the expected acknowledgement. HTTP/network errors preserve the draft; no optimistic fake delivery.
- Projects/guestbook: one reusable discussion system; all five canonical project targets and the guestbook target. Plain React text, validated public response shape, UTC timestamps, five-row cursor pagination and approved-only retrieval. New comments stay absent publicly until moderation. Project notes mount lazily and retain the existing Vault reading-layout escape.
- Owner: password login followed by required TOTP; allowlisted first owners can enroll through a protected QR/manual-key flow. No registration/recovery interface. Network-verified Auth identity, UID membership and AAL2 remain mandatory for private access. Server-rendered `/admin` gate plus authenticated/RLS-checked APIs. Overview uses exact counts/current moderation timestamps; inbox supports filtering/read/archive and comments supports pending/approved/rejected review with confirmation.
- Sessions: per-request server Auth clients; HttpOnly/SameSite Strict cookies, Secure and canonical HTTPS origin required in production; eight-hour cookie duration. No tokens in JS storage, URLs or response JSON. Refresh retries an owner request once. Logout clears cookies and reports unconfirmed remote revocation honestly. No-JavaScript credentials stay disabled and forms use POST rather than risking password URLs.
- Motion integration: existing timelines untouched. A scoped, debounced discussion ResizeObserver refreshes existing measurements only after content-height changes. It disconnects and cancels work on unmount; reduced motion skips refresh work. No extra dependency or scroll library was installed.
- Database: one additive, transactional migration adds authenticated-only `is_portfolio_owner_identity()` for pre-MFA membership. Existing `is_portfolio_owner()` and AAL2 table policies are unchanged. AAL1 membership never authorizes private rows.

## Checks run

- `npm run typecheck`: passed.
- `npm run lint`: passed with no warnings after final refinements.
- `npm run build`: passed; homepage remains static and owner/API routes dynamic. Backend variables are lazy and owner pages are no-store/noindex.
- `npm run test:backend`: **35/35 passed**. Entire migrations execute in PGlite's real PostgreSQL engine. Covers RLS/grants, validation/body caps/honeypot, pending defaults, public approved projection, pagination, persistent quotas, owner/MFA denial and moderation. Added tests cover the pre-MFA RPC's restricted privileges, overview/status filters, real Auth SDK calls against the isolated gateway, enrollment/MFA, expired access/invalid refresh, logout outage, cookie flags, streaming request adaptation and production origin restrictions. Supabase JWT/GoTrue behavior in the gateway is mocked; PGlite role claims are fixtures, not live signed tokens.
- `npm run test:turnstile`: actual Cloudflare Siteverify accepted/rejected its published dummy credentials. This is not a real production widget check.
- `scripts/check-community.cjs`: passed at **1440×1000, 1366×900, 390×844 and 360×800**. Real Next routes/SDK/cookies with isolated mock Supabase; simulated browser widget and real dummy Siteverify for successful submissions. Covers invalid fields, rate-limit feedback, retained drafts, no-login contact/comments/guestbook, canonical targets, public pagination, non-owner denial, AAL1 private denial, invalid/valid MFA, inbox actions, approval/rejection, XSS as text, cookie secrecy and logout. Extra cases cover expired-session refresh/re-login, protected enrollment/QR rendering, expired CAPTCHA/retry, network failures, unexpected success status rejection, duplicate busy-lock protection, and a dialog opened while the Vault is pinned with unchanged scroll position. All public moderation data in these tests is explicitly fixture content. [UI results](preview/phase4b/community-browser-results.json).
- Existing `scripts/check-motion.cjs`: passed all four sizes, slow/fast/reverse scrolling, anchors, focus, desktop pinning, mobile natural layout, reduced motion, no-JavaScript layout and five resize/preference cycles. No overflow/runtime errors. [Motion results](preview/phase4b/browser-results.json). Production public forms correctly stayed disabled because Turnstile is unconfigured.
- Production preview with blank backend variables: the existing HTTP smoke suite passed **10 checks**, with safe 503/400/413/401 responses and no stored records. [HTTP evidence](preview/phase4b/api-smoke-results.json). The four-size unconfigured browser smoke also passed disabled public/owner controls, admin redirect, no overflow/runtime errors, plus no-JavaScript POST/disabled-owner-form behavior. [Browser evidence](preview/phase4b/unconfigured-browser-results.json).

Desktop/laptop/mobile/narrow-mobile screenshots were captured. Representative contact, guestbook and dashboard compositions were inspected visually. Committed examples use **test fixtures, never real inbox/MFA content**: [desktop contact](preview/phase4b/desktop-contact-fixture.png), [mobile contact](preview/phase4b/mobile-contact-fixture.png), [desktop owner overview](preview/phase4b/desktop-admin-fixture.png), [narrow mobile overview](preview/phase4b/narrow-mobile-admin-fixture.png), [guestbook](preview/phase4b/laptop-guestbook-fixture.png).

The motion sample recorded 179 frame intervals with median/p95 16.7ms and zero sampled long tasks over 50ms. Across resize/preference cycles the DOM node count stayed 1032, heap rose from 4,980,836 to 6,294,220 bytes and listener count from 361 to 374. These local headless observations do not prove a guaranteed frame rate or absence of all leaks.

Testing exposed and corrected field accessible names, modal Tab cycling, an initial reduced-motion style mismatch, and copying Next's incoming request directly into Node's Request constructor; the adapter now reconstructs from URL while preserving streaming caps. Cold development-route compilation initially exceeded the browser's 30-second navigation timeout; warmed/final runs passed with the documented longer navigation allowance. A separate attempt to inspect the real third-party dummy browser widget timed out and **is not counted as passed**. Widget lifecycle tests used an explicit test script; live production-widget validation remains outstanding.

## Reproduce isolated UI checks

Use externally installed Playwright (`NODE_PATH=/path/to/node_modules`) and a Chromium binary; no application dependency was added. Start the mock gateway in one terminal:

```bash
node tests/fixtures/supabase.cjs
```

In a second terminal, use only these test fixtures (they are not hosted project credentials):

```bash
SUPABASE_URL=http://127.0.0.1:3102 \
SUPABASE_PUBLISHABLE_KEY=sb_publishable_fixture \
SUPABASE_SERVICE_ROLE_KEY=fixture-service-key \
SITE_ORIGIN=http://localhost:3002 TURNSTILE_HOSTNAME=localhost \
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA \
TURNSTILE_MODE=test NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA \
BACKEND_LOCAL_IP=true RATE_LIMIT_HMAC_SECRET=isolated-ui-test-hmac-key-at-least-32-characters \
npm run dev -- --hostname 127.0.0.1 --port 3002
```

Then:

```bash
NODE_PATH=/path/to/node_modules PLAYWRIGHT_CHROMIUM_PATH=/path/to/chrome \
PORTFOLIO_QA_OUTPUT=/tmp/portfolio-community-evidence node scripts/check-community.cjs
```

For production unconfigured checks, start an additional preview with all database/protection variables explicitly blank, e.g. `SUPABASE_URL= SUPABASE_PUBLISHABLE_KEY= SUPABASE_SERVICE_ROLE_KEY= SITE_ORIGIN=http://localhost:3003 TURNSTILE_SECRET_KEY= RATE_LIMIT_HMAC_SECRET= npm start -- --hostname 127.0.0.1 --port 3003`. Run `BACKEND_SMOKE_UNCONFIGURED=true PORTFOLIO_URL=http://localhost:3003 node scripts/check-backend-unconfigured.mjs` and the similarly configured `scripts/check-community-unconfigured.cjs` with external Playwright/Chromium. `PORTFOLIO_LOGIN_QA_URL=http://localhost:3002` additionally checks the configured login's no-JavaScript disabled state. Set output paths to `/tmp` to preserve committed evidence.

## Remaining limits and live acceptance

- Hosted anonymous database permissions, persistence, pending visibility and concurrent quota enforcement have been tested. Real owner password/TOTP, production proxy provenance, real Turnstile hostname/action and the complete owner moderation → public chain remain pending. Local CAPTCHA test mode does not validate a production widget.
- Supabase access JWTs may remain valid until expiry after refresh-session logout. Configure appropriate lifetimes; this application does not claim instant copied-JWT revocation.
- A lost submission response can follow a successful insert. The form blocks concurrent submissions, but cross-tab/network-level idempotency is not added. Retry carefully after ambiguous network failures.
- Recent moderation is current status/timestamp, not an immutable historical audit log. No editing/deletion, notifications or analytics were added.
- Configure Auth rate limits, disable signups/anonymous Auth, enable TOTP, provision/allowlist the owner, apply both migrations, configure real Turnstile and trusted IP handling, schedule quota cleanup, and repeat live acceptance before enabling production submissions. No deployment was performed.
