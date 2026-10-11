# Multi-page personal universe: validation

Implemented on 2026-10-11 from `32a7eb8a913a3736615178f7e9ec2d23dd072ba4`. This is route organization and frontend integration, not another hero overhaul. No new dependency, migration, publishing backend, anonymous two-way chat or deployment was introduced.

## Result

The homepage now has five scenes: the preserved four-world hero; brief paper introduction with About/Journal/Gallery links; two selected Vault projects; Now / Lately with collection navigation; and correspondence/footer. Biography, verified milestones, all five works, writing, albums, online identities and moderated feedback have dedicated routes.

Created `/about`, `/work`, `/work/[slug]`, `/journal`, `/journal/[slug]`, `/gallery`, `/gallery/[slug]`, `/links` and `/guestbook`. The public route group shares navigation, community availability and the existing contact interface. PageMotion contexts are keyed by pathname for route cleanup and masked inner-page entrances. All existing admin/API routes, Auth, MFA, database and anti-spam implementations remain unchanged.

The hero composition, entrance, normalized timeline, project focus, diagonal wipe and first editorial transition are retained. The Vault presents SAT’chi and Huquq Test with its original per-chapter holds and panel movement; scroll length follows the selected chapter count. Full project comments are now on individual work pages. Full writing/gallery/biography sections are no longer stacked on the homepage.

Work supports Digital, Physical / tangible and Creative categories. Physical and Creative have real empty states. SAT’chi has the configurable collaboration action on the directory and detail page, opening the existing private-message modal with editable project context. Visitor drafts are retained. No unverified contribution URL is displayed. Now / Lately is centrally editable, capped at three visible entries and currently empty. Journal has no fictional entries. Gallery shows a labeled album of existing original site studies. Journal/gallery reciprocal references and reading/image templates are ready for real content. Links publishes only the verified GitHub profile.

See [route/content guide](ROUTES_AND_CONTENT.md) for models, source locations and future CMS boundaries.

## Checks actually run

- TypeScript: `npm run typecheck` passed after implementation and fixes.
- ESLint: `npm run lint` passed with no reported errors/warnings.
- Production: `npm run build` passed after the final mobile sizing fix. Homepage and informational routes are static; five work details and the site-study album are prerendered. Category-filtered `/work`, admin and API routes remain dynamic.
- Backend: `npm run test:backend` passed **35/35**, covering database/RLS boundaries, validation, CAPTCHA/quotas, pending/approved projections, owner/MFA authorization, moderation and session fixtures. No new hosted owner login or private submission was made.
- Focused Chromium: `scripts/check-universe.cjs` passed against the production build at **1440×900 and 390×844**, plus reduced-motion route spot checks at **1366×900 and 360×800**. [Results](preview/universe/universe-browser-results.json).

The browser runner verifies four visible hero worlds, five homepage scenes, two selected works, forward/reverse hero scroll, the diagonal wipe and navigation into the SAT’chi page. It exercises all five canonical work detail/comment targets, category filtering and empty states, project context prefill/editing, draft preservation, exact private-message payload, confirmed success, modal Tab/Escape/focus restoration, guestbook pending acknowledgement, approved fixture display, album images, verified links, About photo slots, missing/unpublished 404s, anonymous inbox denial and the admin login redirect. Returning to the homepage creates exactly one desktop Vault pin; reduced motion removes cinematic enhancement and pinning while keeping world links usable. No horizontal overflow or page errors were observed in the completed checks. Server-rendered category filtering also passed with JavaScript disabled.

Submission responses, public comment entries, public availability and the browser challenge are explicitly mocked in this focused UI runner. These tests exercise frontend integration and payloads, not fresh live Supabase/Turnstile acceptance. The existing backend tests provide independent server/database security regression coverage. Real private inbox content, owner credentials and MFA codes were never photographed or submitted.

An initial typecheck found the installed Lucide package did not export a GitHub brand icon; the directory uses its available link icon. The first browser attempt exposed focus leaving the modal after a submit control was disabled; confirmed receipts now restore focus inside the modal. The next attempt exposed intrinsic artwork width in the mobile directory; both directory and detail previews now explicitly fit their containers. Failed attempts are not counted as passes. Final build and focused checks passed after those fixes.

The historical whole-site browser suites were not rerun: their single-page assumptions predate this route structure. The new focused runner covers the changed navigation and integration boundaries. Old scripts and validation evidence are retained for reference; adapt their page assumptions before using them for future regression checks.

## Visual evidence and limitations

Screenshots were captured and actually reviewed at desktop/mobile sizes. Representative frames: [homepage](preview/universe/desktop-home.png), [preserved focus](preview/universe/desktop-hero-focus.png), [Work](preview/universe/desktop-work.png), [Journal](preview/universe/desktop-journal.png), [Gallery](preview/universe/desktop-gallery.png), [Links](preview/universe/desktop-links.png), [About](preview/universe/desktop-about.png), [mobile Work](preview/universe/mobile-work.png), [mobile Gallery](preview/universe/mobile-gallery.png), [mobile collaboration fixture](preview/universe/mobile-collaboration-fixture.png), [guestbook fixture](preview/universe/mobile-guestbook-fixture.png).

Add real portraits, personal photographs/drawings, journal entries, physical/creative work, verified project screenshots/statuses/stacks, additional public identities and truthful recent activity through the typed data. No valid personal journal detail can be visually reviewed until a real entry exists; its typed template builds and unpublished slugs return 404. Reciprocal journal/album links likewise await genuine related content.

Future owner-only CMS editing, image uploads and anonymous returning-visitor replies remain separate tasks. This phase does not make their interfaces look operational. The production HTTP preview retains existing fail-closed configuration behavior; setup requirements remain in `SUPABASE_SETUP.md`. No live performance benchmark or physical-device guarantee is claimed.

Run locally: `npm run dev -- --hostname 127.0.0.1 --port 3001` from the existing project directory.
