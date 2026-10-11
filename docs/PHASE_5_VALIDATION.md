# Phase 5 — personal cinematic archive

Implemented and reviewed on 2026-10-11, Linux / Node 26.11.1. Baseline: `17b0bb94c860bae3dcfa9efc80e559c2b2437404`. No deployment, new database schema or later phase was started.

## Creative correction

The previous composition relied on heavy geometric headings, repeated numbered section starts, bright project blocks and a monogram standing in for a portrait. Its motion was technically functional but the sequence kept returning to the same portfolio vocabulary.

The new composition uses a charcoal cover, a paper-colored personal feature, a selected-software exhibition, an open collection index, an oxblood reading room, an unequal visual notebook, parallel interests, milestones, a guestbook and correspondence. Newsreader's real italic and DM Sans distinguish signature, literary text and practical information. Local original SVG studies provide a recurring paper/line motif; they never claim to be personal drawings or application screenshots. Large text alternates with small captions and denser reading surfaces rather than every section repeating the same scale.

Presence now has three explicit image reservations: main portrait, secondary place photograph and detail. The collection has typed categories, optional years/previews/excerpts/links and public status labels. Writing and gallery content can be replaced through the central data files. The reading specimen is visibly a sample; no personal poems, publication history, portrait or unverified social profile was invented. See [editing guide](ARCHIVE_CONTENT.md), [design system](DESIGN_SYSTEM.md) and [motion architecture](MOTION_ARCHITECTURE.md).

## Preserved integration boundaries

The five canonical project IDs, public discussions, private contact submission, guestbook, Supabase policies/routes and owner/MFA implementation remain intact. The footer's private-note action opens the existing contact modal via a scoped listener. Existing native focus management, draft retention and backdrop/scroll isolation remain responsible for the dialog.

The development environment retains the Phase 4B hosted Supabase connection and explicit local Turnstile test mode. The production preview therefore correctly disables submissions/auth over local HTTP rather than treating test protection as production-ready. Phase 5 did not submit new hosted messages, use the real owner's password/TOTP or change external security settings. Owner and submission regression fixtures must not be interpreted as new live hosted acceptance. Remaining production setup and live acceptance are documented in [Supabase setup](SUPABASE_SETUP.md) and the historical [Phase 4B report](PHASE_4B_VALIDATION.md).

## Validation actually run

- TypeScript: `npm run typecheck` passed.
- ESLint: `npm run lint` passed without warnings.
- Production: `npm run build` passed again after the last contrast/data refinement; the homepage remains static and owner/API routes dynamic.
- Backend: `npm run test:backend` passed **35/35**. Versioned migrations execute in PGlite's PostgreSQL engine with role/claim fixtures. Covers actual database grants/RLS, pending defaults, approved projection, cursor ordering, persistent quota operations, input/body limits, CAPTCHA/honeypot rejection, owner/AAL2 boundaries, moderation, Auth SDK fixture calls, refresh, enrollment and logout. This is not a hosted JWT/MFA acceptance test.
- New `scripts/check-archive.cjs` passed at **1440×1000, 1366×900, 390×844 and 360×800**. Traverses every section; checks 6/3/3 archive filters, pressed states, keyboard/native disclosures, original-art labels, complete hero wordmark, safe mobile caption placement, footer dialog opening/Escape/focus restoration, reduced-motion transforms, all accessible project panels, no overflow and no page errors. JavaScript-disabled checks confirm every entry is readable, native disclosures work, and filtering is truthfully disabled. [Archive results](preview/phase5/archive-browser-results.json).
- Existing `scripts/check-motion.cjs` passed all four sizes: each of five desktop chapters, slow/fast/reverse scrolling, nonblank handoffs, anchors, covered-panel focus rescue, reading-layout escape, dialog focus, mobile natural scrolling, reduced motion, no-JavaScript layout and five viewport/preference cycles. [Motion results](preview/phase5/browser-results.json).
- Existing `scripts/check-community.cjs` passed all four sizes. Covers valid/invalid no-login messaging, quota feedback, drafts, all canonical project targets, pending comments/guestbook, approved-only pagination, anonymous/non-owner denial, required MFA, inbox operations, approval/rejection, HttpOnly cookie handling and logout. Additional checks passed expired-session refresh/re-login, protected TOTP enrollment/QR rendering, CAPTCHA expiry/retry, network draft retention, unexpected acknowledgement rejection, duplicate prevention and dialog use while the Vault is pinned. This suite uses actual Next routes, Supabase SDK and session cookies against an isolated test gateway; the browser challenge is simulated and successful submissions use Cloudflare's published dummy verification credentials. It never presents fixtures as real portfolio feedback. [Community results](preview/phase5/community-browser-results.json).
- Final browser review after the last build: homepage HTTP 200, all three gallery studies rendered, exact achievement display values retained; the corrected contact label measured **5.8:1** against its background at all four widths with no overflow. [Final review results](preview/phase5/final-review-results.json), [mobile dialog](preview/phase5/mobile-contact-fixture-final.png), [complete visual notebook, reduced motion](preview/phase5/desktop-sketchbook-static.png).

The first community attempt exceeded the development navigation timeout; the next attempt found its fixture process stopped. Neither attempt is counted as passed. The first motion run stopped at a fixed-delay mobile anchor assertion. A separate browser measurement confirmed the native anchor arrives correctly; the test now polls the same arrival condition with a bounded timeout, preserving the original position assertion.

## Screenshots and visual review

Production screenshots were captured at all four sizes and actual frames were inspected: opening, presence, archive, writing, visual notebook, parallel interests, milestones, guestbook and ending. All five desktop Vault chapters were captured. Refinement addressed the narrow wordmark, hero caption placement, overlapping portrait captions, writing sample label, reading scale and public form feedback/label contrast. Representative images are stored in `docs/preview/phase5`; local full evidence remains in `/tmp/phase5-production`, `/tmp/phase5-motion` and `/tmp/phase5-community` during this session. Committed owner/dashboard and populated guestbook examples contain only explicit fixtures, never real private inbox or MFA data.

Representative frames: [desktop opening](preview/phase5/desktop-hero.png), [personal presence](preview/phase5/desktop-about.png), [SAT’chi](preview/phase5/desktop-vault-1.png), [collection](preview/phase5/desktop-archive.png), [writing](preview/phase5/desktop-writing.png), [visual notebook](preview/phase5/desktop-sketchbook.png), [mobile opening](preview/phase5/mobile-hero.png), [narrow collection](preview/phase5/narrow-mobile-archive.png), [closing](preview/phase5/laptop-contact.png).

## Performance and accessibility observations

No new runtime dependency, WebGL, scroll replacement or raster image was added. Two licensed, self-hosted Newsreader Latin WOFF2 files total 278,872 bytes; the old display font is no longer loaded. SVGs and fixed media aspect ratios preserve headroom for real assets.

The production motion runner sampled **179 frame intervals**, median **16.7 ms**, p95 **16.8 ms**, with **zero sampled long tasks over 50 ms**. Across five resize/preference cycles there was exactly one desktop pin, DOM node count remained **1,610 → 1,610**, JS heap changed **5,546,292 → 6,787,784 bytes**, and listeners **371 → 384**. These short headless observations do not guarantee 60 FPS, constant memory or absence of all leaks. No unbounded pin/node accumulation was observed in these cycles.

Reduced motion removes pinning, large reveals, parallax and decorative pointer response. Native disclosures, navigation, reading and forms remain usable. No JavaScript leaves the entire archive and project collection visible; interactive submissions still accurately require JavaScript. Keyboard focus/escape/restoration and inactive project focus exclusion are checked by the browser suites.

## Remaining material and limitations

- Add Otabek's actual portrait, place/detail photographs, original writing and visual works with accurate captions/credits. The new architecture intentionally does not invent them.
- Add verified project screenshots, stack/status information and links. Existing unknowns remain unknown.
- The archive is repository content, not a CMS/upload interface. All its statuses are public labels; private drafts belong outside the application.
- A recording and broad device/network benchmark were not captured. Screenshots, state assertions and sampled local performance support this review.
- Real hosted owner moderation and production Turnstile/proxy acceptance were not rerun in this creative phase. Backend security was not weakened for the fixture tests.
